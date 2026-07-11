"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type CardInput = { front: string; back: string };

export default function CreateDeckPage() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [cards, setCards] = useState<CardInput[]>([{ front: "", back: "" }]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedDeckId, setPublishedDeckId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, [supabase]);

  function updateCard(index: number, field: "front" | "back", value: string) {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addCard() {
    setCards((prev) => [...prev, { front: "", back: "" }]);
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You need to be logged in to publish a deck.");
      return;
    }
    if (!title.trim()) {
      setError("Give your deck a title.");
      return;
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError("Add at least one card with both a front and back.");
      return;
    }

    setSubmitting(true);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim(),
        tags: tagList,
        visibility: "public",
      })
      .select()
      .single();

    if (deckError || !deck) {
      setSubmitting(false);
      setError(deckError?.message ?? "Could not create the deck.");
      return;
    }

    const { error: cardsError } = await supabase.from("cards").insert(
      validCards.map((c) => ({
        deck_id: deck.id,
        front_text: c.front.trim(),
        back_text: c.back.trim(),
      }))
    );

    setSubmitting(false);

    if (cardsError) {
      setError(
        `Deck was created, but cards failed to save: ${cardsError.message}`
      );
      return;
    }

    setPublishedDeckId(deck.id);
  }

  if (checkingAuth) {
    return <div className="pt-16 text-sm text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="pt-16 max-w-md">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          new deck
        </p>
        <h1 className="font-display font-bold text-ink text-2xl mb-4">
          Log in to publish a deck
        </h1>
        <p className="text-muted text-sm mb-6">
          You need an account so decks are tied to you and you can edit them
          later.
        </p>
        <Link
          href="/login"
          className="inline-block bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (publishedDeckId) {
    return (
      <div className="pt-16 max-w-md">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          published
        </p>
        <h1 className="font-display font-bold text-ink text-2xl mb-4">
          Deck saved
        </h1>
        <p className="text-muted text-sm mb-2">
          Your deck is now stored in the database. The browse page still
          shows sample decks for now — that's the next thing to wire up so
          real decks show there too.
        </p>
        <p className="text-xs text-muted mb-6">
          Deck ID: <code className="text-ink">{publishedDeckId}</code>
        </p>
        <button
          onClick={() => {
            setPublishedDeckId(null);
            setTitle("");
            setDescription("");
            setTags("");
            setCards([{ front: "", back: "" }]);
          }}
          className="text-sm text-rule hover:text-ink transition-colors focus-ring"
        >
          Create another deck
        </button>
      </div>
    );
  }

  return (
    <div className="pt-12 max-w-2xl">
      <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
        new deck
      </p>
      <h1 className="font-display font-bold text-ink text-2xl md:text-3xl mb-8">
        Publish a deck
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="AP Biology — Cellular Respiration"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's in this deck and who is it for?"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="biology, ap-bio, exam-prep"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
          <p className="text-xs text-muted mt-1.5">Separate tags with commas.</p>
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Cards
          </label>
          <div className="space-y-3">
            {cards.map((card, i) => (
              <div
                key={i}
                className="ruled margin-rule bg-card border border-ink/10 rounded-sm p-4 pl-11 grid grid-cols-1 md:grid-cols-2 gap-4 relative"
              >
                <input
                  type="text"
                  value={card.front}
                  onChange={(e) => updateCard(i, "front", e.target.value)}
                  placeholder="Front"
                  className="bg-transparent text-sm text-ink placeholder:text-muted focus-ring rounded-sm"
                />
                <input
                  type="text"
                  value={card.back}
                  onChange={(e) => updateCard(i, "back", e.target.value)}
                  placeholder="Back"
                  className="bg-transparent text-sm text-ink placeholder:text-muted focus-ring rounded-sm"
                />
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
                    className="absolute top-2 right-3 text-xs text-muted hover:text-margin transition-colors focus-ring"
                    aria-label="Remove card"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCard}
            className="text-sm text-rule hover:text-ink transition-colors focus-ring mt-3"
          >
            + Add another card
          </button>
        </div>

        {error && (
          <p className="text-sm text-margin border border-margin/30 bg-margin/5 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-paper px-6 py-3 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish deck"}
          </button>
        </div>
      </form>
    </div>
  );
}