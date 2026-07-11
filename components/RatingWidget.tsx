"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function RatingWidget({ deckId }: { deckId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecking(false);
    });
  }, [supabase]);

  async function handleRate(score: number) {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase
      .from("ratings")
      .upsert(
        { deck_id: deckId, user_id: user.id, score },
        { onConflict: "deck_id,user_id" }
      );

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMyScore(score);
    router.refresh();
  }

  if (checking) return null;

  if (!user) {
    return (
      <p className="text-sm text-muted mb-8">
        <Link href="/login" className="text-rule hover:text-ink transition-colors focus-ring">
          Log in
        </Link>{" "}
        to rate this deck.
      </p>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex gap-1 text-2xl" aria-label="Rate this deck">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={submitting}
            onClick={() => handleRate(n)}
            className={`transition-colors focus-ring disabled:opacity-50 ${
              myScore && n <= myScore ? "text-margin" : "text-muted/30 hover:text-margin"
            }`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      {myScore && (
        <p className="text-xs text-muted mt-1">You rated this {myScore} star{myScore > 1 ? "s" : ""}.</p>
      )}
      {error && <p className="text-xs text-margin mt-1">{error}</p>}
    </div>
  );
}