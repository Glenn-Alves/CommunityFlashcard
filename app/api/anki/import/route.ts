import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import initSqlJs from "sql.js";

export const runtime = "nodejs";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export async function POST(request: NextRequest) {
  try {
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

    const result = db.exec("SELECT flds FROM notes");
    const cards: { front: string; back: string }[] = [];

    if (result.length > 0) {
      for (const row of result[0].values) {
        const flds = String(row[0]);
        const fields = flds.split("\x1f");
        const front = stripHtml(fields[0] ?? "");
        const back = stripHtml(fields[1] ?? "");
        if (front || back) {
          cards.push({ front, back });
        }
      }
    }

    db.close();

    const isPlaceholderOnly =
      cards.length === 1 &&
      /update to the latest anki version/i.test(cards[0].front + cards[0].back);

    if (cards.length === 0 || isPlaceholderOnly) {
      return NextResponse.json(
        {
          error:
            'This file only contains a placeholder note, which usually means it was exported with a newer Anki database format. In Anki, use File → Export, choose "Anki Deck Package", and check "Support older Anki versions" before exporting — then try again.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ cards });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Could not read that file." },
      { status: 500 }
    );
  }
}