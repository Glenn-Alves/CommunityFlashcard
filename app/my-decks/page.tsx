import Link from "next/link";
import DeckCard, { type DeckSummary } from "@/components/DeckCard";
import { createClient } from "@/lib/supabase/server";

export default async function MyDecksPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="pt-16 max-w-md">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          my decks
        </p>
        <h1 className="font-display font-bold text-ink text-2xl mb-4">
          Log in to see your decks
        </h1>
        <Link
          href="/login"
          className="inline-block bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("decks")
    .select(
      "id, title, description, tags, cards(count), ratings(score), profiles(username)"
    )
    .eq("owner_id", user.id)
    .is("parent_deck_id", null)
    .order("created_at", { ascending: false });

  const myDecks: DeckSummary[] = (data ?? []).map((d: any) => {
    const scores: number[] = (d.ratings ?? []).map((r: any) => r.score);
    const avgRating = scores.length
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    return {
      id: d.id,
      title: d.title,
      description: d.description ?? "",
      author: d.profiles?.username ?? "you",
      tags: d.tags ?? [],
      rating: avgRating,
      ratingCount: scores.length,
      cardCount: d.cards?.[0]?.count ?? 0,
    };
  });

  return (
    <div className="pt-16">
      <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
        your creations
      </p>
      <h1 className="font-display font-bold text-ink text-2xl md:text-3xl mb-8">
        My decks
      </h1>

      {error && (
        <p className="text-sm text-margin">Could not load your decks: {error.message}</p>
      )}

      {myDecks.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </section>
      ) : (
        <p className="text-sm text-muted">
          You haven&rsquo;t created any decks yet.{" "}
          <Link href="/create" className="text-rule hover:text-ink transition-colors focus-ring">
            Create your first one
          </Link>
          .
        </p>
      )}
    </div>
  );
}