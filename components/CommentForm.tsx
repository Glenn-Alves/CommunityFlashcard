"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const WORD_LIMIT = 150;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function CommentForm({ deckId }: { deckId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: checking } = useAuth();

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(body);
  const overLimit = wordCount > WORD_LIMIT;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim() || overLimit) return;

    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("comments").insert({
      deck_id: deckId,
      user_id: user.id,
      body: body.trim(),
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setBody("");
    router.refresh();
  }

  if (checking) return null;

  if (!user) {
    return (
      <p className="text-sm text-muted mb-6">
        <Link href="/login" className="text-rule hover:text-ink transition-colors focus-ring">
          Log in
        </Link>{" "}
        to leave a comment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ask a question or say what helped you..."
        rows={3}
        className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring mb-1"
      />
      <p className={`text-xs mb-2 ${overLimit ? "text-margin" : "text-muted"}`}>
        {wordCount}/{WORD_LIMIT} words
        {overLimit && " — please shorten your comment"}
      </p>
      {error && <p className="text-xs text-margin mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !body.trim() || overLimit}
        className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}