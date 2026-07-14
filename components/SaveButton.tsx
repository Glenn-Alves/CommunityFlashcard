"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function SaveButton({ deckId }: { deckId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        const { data } = await supabase
          .from("saved_decks")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("deck_id", deckId)
          .maybeSingle();
        setSaved(Boolean(data));
      }

      setChecking(false);
    }
    init();
  }, [supabase, deckId]);

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

  if (checking) return null;

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