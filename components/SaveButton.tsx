"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function SaveButton({ deckId }: { deckId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [saved, setSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCheckingSaved(false);
      return;
    }

    setCheckingSaved(true);
    supabase
      .from("saved_decks")
      .select("id")
      .eq("user_id", user.id)
      .eq("deck_id", deckId)
      .maybeSingle()
      .then(({ data }) => {
        setSaved(Boolean(data));
        setCheckingSaved(false);
      });
  }, [supabase, deckId, user, authLoading]);

  async function toggleSave() {
    if (!user) return;
    setBusy(true);

    if (saved) {
      await supabase
        .from("saved_decks")
        .delete()
        .eq("user_id", user.id)
        .eq("deck_id", deckId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_decks")
        .insert({ user_id: user.id, deck_id: deckId });
      setSaved(true);
    }

    setBusy(false);
    router.refresh();
  }

  if (authLoading || checkingSaved) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="border border-ink/20 text-ink px-5 py-2.5 rounded-sm text-sm font-medium hover:border-ink transition-colors focus-ring"
      >
        Log in to save
      </Link>
    );
  }

  return (
    <button
      onClick={toggleSave}
      disabled={busy}
      className={`px-5 py-2.5 rounded-sm text-sm font-medium transition-colors focus-ring disabled:opacity-50 ${
        saved
          ? "bg-margin text-paper hover:bg-ink"
          : "border border-ink/20 text-ink hover:border-ink"
      }`}
    >
      {saved ? "Saved ✓" : "Save for later"}
    </button>
  );
}