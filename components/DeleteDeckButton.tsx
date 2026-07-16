"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteDeckButton({
  deckId,
  redirectTo,
}: {
  deckId: string;
  redirectTo: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = confirm(
      "Delete this deck? This also deletes its cards, comments, ratings, and any subsections inside it. This can't be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const { error } = await supabase.from("decks").delete().eq("id", deckId);

    if (error) {
      setDeleting(false);
      setError(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
    <button
        onClick={handleDelete}
        disabled={deleting}
        className="bg-margin text-paper px-5 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity focus-ring disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete deck"}
      </button>
      {error && <p className="text-xs text-margin mt-2">{error}</p>}
    </div>
  );
}