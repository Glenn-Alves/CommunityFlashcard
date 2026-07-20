"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ImportCardsIntoDeck({ deckId }: { deckId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/anki/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not import that file.");
      } else if (data.mode === "created") {
        setError(
          "This file has subdecks of its own. Export just this single subdeck from Anki (select only this one in the dropdown) and try again."
        );
      } else {
        const cards = data.cards as {
          front: string;
          back: string;
          frontImage?: string | null;
          backImage?: string | null;
        }[];
        if (cards.length === 0) {
          setError("No cards were found in that file.");
        } else {
          const { error: insertError } = await supabase.from("cards").insert(
            cards.map((c) => ({
              deck_id: deckId,
              front_text: c.front,
              back_text: c.back,
              front_image_url: c.frontImage ?? null,
              back_image_url: c.backImage ?? null,
            }))
          );
          if (insertError) {
            setError(insertError.message);
          } else {
            setSuccess(`Added ${cards.length} cards.`);
            router.refresh();
          }
        }
      }
    } catch {
      setError("Could not import that file.");
    }

    setImporting(false);
    e.target.value = "";
  }

  return (
    <div className="border-2 border-dashed border-ink/25 rounded-sm p-4 mb-4">
      <p className="text-sm text-ink font-medium mb-1">
        Import cards from Anki into this deck
      </p>
      <p className="text-xs text-muted mb-3">
        Upload a .apkg export of a single subdeck (no further subdecks
        inside it) to add its cards here.
      </p>
      <input
        type="file"
        accept=".apkg"
        onChange={handleFile}
        disabled={importing}
        className="text-sm text-ink"
      />
      {importing && <p className="text-xs text-muted mt-2">Reading file...</p>}
      {error && <p className="text-xs text-margin mt-2">{error}</p>}
      {success && <p className="text-xs text-rule mt-2">{success}</p>}
    </div>
  );
}