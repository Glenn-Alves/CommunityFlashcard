"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ExpandableField from "./ExpandableField";

type Row = {
  id: string | null;
  front: string;
  back: string;
  saving: boolean;
  error: string | null;
};

export default function CardManager({
  deckId,
  initialCards,
}: {
  deckId: string;
  initialCards: { id: string; front: string; back: string }[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [rows, setRows] = useState<Row[]>(
    initialCards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      saving: false,
      error: null,
    }))
  );

  function updateRow(index: number, field: "front" | "back", value: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: null, front: "", back: "", saving: false, error: null },
    ]);
  }

  async function saveRow(index: number) {
    const row = rows[index];
    if (!row.front.trim() || !row.back.trim()) {
      setRows((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, error: "Both front and back are required." } : r
        )
      );
      return;
    }

    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, saving: true, error: null } : r))
    );

    if (row.id) {
      const { error } = await supabase
        .from("cards")
        .update({ front_text: row.front.trim(), back_text: row.back.trim() })
        .eq("id", row.id);

      setRows((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, saving: false, error: error?.message ?? null } : r
        )
      );
    } else {
      const { data, error } = await supabase
        .from("cards")
        .insert({
          deck_id: deckId,
          front_text: row.front.trim(),
          back_text: row.back.trim(),
        })
        .select()
        .single();

      setRows((prev) =>
        prev.map((r, i) =>
          i === index
            ? { ...r, id: data?.id ?? null, saving: false, error: error?.message ?? null }
            : r
        )
      );
    }

    router.refresh();
  }

  async function deleteRow(index: number) {
    const row = rows[index];

    if (row.id) {
      if (!confirm("Delete this card? This can't be undone.")) return;
      await supabase.from("cards").delete().eq("id", row.id);
      router.refresh();
    }

    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div
          key={row.id ?? `new-${i}`}
          className="bg-card border border-ink/10 rounded-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative"
        >
          <ExpandableField
            label="Front"
            value={row.front}
            onChange={(v) => updateRow(i, "front", v)}
            placeholder="Front"
            compact
          />
          <ExpandableField
            label="Back"
            value={row.back}
            onChange={(v) => updateRow(i, "back", v)}
            placeholder="Back"
            compact
          />

          {row.error && (
            <p className="md:col-span-2 text-xs text-margin">{row.error}</p>
          )}

          <div className="md:col-span-2 flex gap-3">
            <button
              type="button"
              onClick={() => saveRow(i)}
              disabled={row.saving}
              className="bg-ink text-paper px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-margin transition-colors focus-ring disabled:opacity-50"
            >
              {row.saving ? "Saving..." : row.id ? "Save changes" : "Add card"}
            </button>
            <button
              type="button"
              onClick={() => deleteRow(i)}
              className="text-xs text-muted hover:text-margin transition-colors focus-ring"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-rule hover:text-ink transition-colors focus-ring"
      >
        + Add another card
      </button>
    </div>
  );
}