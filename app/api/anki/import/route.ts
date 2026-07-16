import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import initSqlJs from "sql.js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { error: "You need to be logged in to import a deck." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    if (zip.file("collection.anki21b")) {
      return NextResponse.json(
        {
          error:
            'This file was exported with a newer Anki database format we can\'t read. In Anki, use File → Export, choose "Anki Deck Package", and check "Support older Anki versions" before exporting — then try importing that file here.',
        },
        { status: 400 }
      );
    }

    const dbFile = zip.file("collection.anki21") ?? zip.file("collection.anki2");

    if (!dbFile) {
      return NextResponse.json(
        {
          error:
            'This file uses a newer Anki format we can\'t read yet. In Anki, re-export with "Support older Anki versions" checked, then try again.',
        },
        { status: 400 }
      );
    }

    const dbBuffer = await dbFile.async("uint8array");

    const SQL = await initSqlJs();
    const db = new SQL.Database(dbBuffer);

    // Read Anki's deck hierarchy (name uses "::" to separate parent/child)
    const colResult = db.exec("SELECT decks FROM col");
    const decksJson = colResult[0]?.values[0]?.[0];
    const ankiDecks: Record<string, { name: string }> = decksJson
      ? JSON.parse(String(decksJson))
      : {};

    // Read every card, joined to its note text and which Anki deck it's in
    const cardsResult = db.exec(
      "SELECT cards.did as did, notes.flds as flds FROM cards JOIN notes ON cards.nid = notes.id"
    );

    const cardsByAnkiDeck = new Map<string, { front: string; back: string }[]>();

    if (cardsResult.length > 0) {
      for (const row of cardsResult[0].values) {
        const did = String(row[0]);
        const flds = String(row[1]);
        const fields = flds.split("\x1f");
        const front = stripHtml(fields[0] ?? "");
        const back = stripHtml(fields[1] ?? "");
        if (!front && !back) continue;

        if (!cardsByAnkiDeck.has(did)) cardsByAnkiDeck.set(did, []);
        cardsByAnkiDeck.get(did)!.push({ front, back });
      }
    }

    db.close();

    const isPlaceholderOnly =
      cardsByAnkiDeck.size === 1 &&
      Array.from(cardsByAnkiDeck.values())[0].length === 1 &&
      /update to the latest anki version/i.test(
        Array.from(cardsByAnkiDeck.values())[0][0].front +
          Array.from(cardsByAnkiDeck.values())[0][0].back
      );

    if (cardsByAnkiDeck.size === 0 || isPlaceholderOnly) {
      return NextResponse.json(
        {
          error:
            'This file only contains a placeholder note, which usually means it was exported with a newer Anki database format. In Anki, use File → Export, choose "Anki Deck Package", and check "Support older Anki versions" before exporting — then try again.',
        },
        { status: 400 }
      );
    }

    // Only keep Anki decks that actually have cards, and drop the
    // usually-empty built-in "Default" deck unless it genuinely has cards.
    const cardDeckAnkiIds = Object.keys(ankiDecks).filter((ankiId) => {
      if (!cardsByAnkiDeck.has(ankiId)) return false;
      if (ankiDecks[ankiId].name === "Default" && ankiId === "1") {
        return (cardsByAnkiDeck.get(ankiId)?.length ?? 0) > 0;
      }
      return true;
    });

    if (cardDeckAnkiIds.length === 0) {
      return NextResponse.json(
        { error: "No cards were found in that file." },
        { status: 400 }
      );
    }

    // Build the full set of folder paths we need — every card-holding deck's
    // name, plus every ancestor folder above it, even ones with zero cards
    // of their own (they're still needed as organizational containers).
    const requiredPaths = new Set<string>();
    for (const ankiId of cardDeckAnkiIds) {
      const fullName = ankiDecks[ankiId].name;
      const segments = fullName.split("::");
      for (let i = 1; i <= segments.length; i++) {
        requiredPaths.add(segments.slice(0, i).join("::"));
      }
    }

    // Simple case: just one deck, no folder structure needed — let the
    // person review/edit in the create form instead of publishing right away.
    if (requiredPaths.size <= 1) {
      const onlyId = cardDeckAnkiIds[0];
      const cards = cardsByAnkiDeck.get(onlyId) ?? [];
      return NextResponse.json({ mode: "flat", cards });
    }

    const sortedPaths = Array.from(requiredPaths).sort(
      (a, b) => a.split("::").length - b.split("::").length
    );

    const pathToOurId = new Map<string, string>();
    let rootDeckId: string | null = null;

    for (const fullPath of sortedPaths) {
      const segments = fullPath.split("::");
      const title = segments[segments.length - 1];
      const parentPath = segments.slice(0, -1).join("::");
      const parentOurId = parentPath ? pathToOurId.get(parentPath) ?? null : null;

      const { data: newDeck, error: insertError } = await supabase
        .from("decks")
        .insert({
          owner_id: user.id,
          parent_deck_id: parentOurId,
          title,
          description: "",
          tags: [],
          visibility: "public",
        })
        .select()
        .single();

      if (insertError || !newDeck) {
        return NextResponse.json(
          { error: insertError?.message ?? "Could not create deck structure." },
          { status: 500 }
        );
      }

      pathToOurId.set(fullPath, newDeck.id);
      if (!parentOurId && !rootDeckId) rootDeckId = newDeck.id;
    }

    for (const ankiId of cardDeckAnkiIds) {
      const fullPath = ankiDecks[ankiId].name;
      const ourDeckId = pathToOurId.get(fullPath);
      const cardsForThisDeck = cardsByAnkiDeck.get(ankiId) ?? [];
      if (!ourDeckId || cardsForThisDeck.length === 0) continue;

      await supabase.from("cards").insert(
        cardsForThisDeck.map((c) => ({
          deck_id: ourDeckId,
          front_text: c.front,
          back_text: c.back,
        }))
      );
    }

    return NextResponse.json({ mode: "created", rootDeckId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Could not read that file." },
      { status: 500 }
    );
  }
}