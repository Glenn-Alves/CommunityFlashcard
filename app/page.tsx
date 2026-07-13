import Link from "next/link";
import DeckCard, { type DeckSummary } from "@/components/DeckCard";
import { decks as sampleDecks } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";

async function getRealDecks(): Promise<DeckSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select(
      "id, title, description, tags, created_at, cards(count), ratings(score), profiles(username)"
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load decks:", error?.message);
    return [];
  }

  return data.map((row: any) => {
    const scores: number[] = (row.ratings ?? []).map((r: any) => r.score);
    const avgRating = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      author: row.profiles?.username ?? "a deckbox user",
      tags: row.tags ?? [],
      rating: avgRating,
      ratingCount: scores.length,
      cardCount: row.cards?.[0]?.count ?? 0,
    };
  });
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const activeTag = searchParams.tag ?? "";

  const realDecks = await getRealDecks();

  const sampleAsSummaries: DeckSummary[] = sampleDecks.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    author: d.author,
    tags: d.tags,
    rating: d.rating,
    ratingCount: d.ratingCount,
    cardCount: d.cardCount,
  }));

  const allDecks = [...realDecks, ...sampleAsSummaries];
  const allTags = Array.from(new Set(allDecks.flatMap((d) => d.tags))).sort();

  const filteredDecks = allDecks.filter((deck) => {
    const matchesTag = activeTag ? deck.tags.includes(activeTag) : true;
    const matchesQuery = q
      ? deck.title.toLowerCase().includes(q) ||
        deck.description.toLowerCase().includes(q) ||
        deck.tags.some((t) => t.toLowerCase().includes(q))
      : true;
    return matchesTag && matchesQuery;
  });

  function tagHref(tag: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div>
      {/* Hero */}
      <section className="pt-16 pb-10 border-b border-ink/10 mb-10">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          a box of decks, open to everyone
        </p>
        <h1 className="font-display font-bold text-ink text-3xl md:text-4xl leading-tight max-w-2xl mb-5">
          Find a flashcard deck someone already made for the thing you're studying.
        </h1>
        <p className="text-muted max-w-xl mb-8">
          Browse decks other students published, or bring your own from Anki
          and share it back.
        </p>

        <form className="flex gap-2 max-w-xl" role="search">
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search decks — try &ldquo;organic chemistry&rdquo;"
            className="flex-1 bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
          <button
            type="submit"
            className="bg-ink text-paper px-5 py-3 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring"
          >
            Search
          </button>
        </form>
      </section>

      {/* Tag filter row */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={tagHref("")}
          className={`text-xs rounded-full px-3 py-1.5 focus-ring transition-colors ${
            !activeTag
              ? "bg-ink text-paper"
              : "text-muted border border-ink/15 hover:border-rule hover:text-ink"
          }`}
        >
          All decks
        </Link>
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={tagHref(tag)}
            className={`text-xs rounded-full px-3 py-1.5 focus-ring transition-colors ${
              activeTag === tag
                ? "bg-ink text-paper"
                : "text-muted border border-ink/15 hover:border-rule hover:text-ink"
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Deck grid */}
      {filteredDecks.length > 0 ? (
        <section aria-label="Decks" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </section>
      ) : (
        <p className="text-sm text-muted">
          No decks match{q ? ` "${q}"` : ""}{activeTag ? ` in "${activeTag}"` : ""}. Try a different search or{" "}
          <Link href="/" className="text-rule hover:text-ink transition-colors focus-ring">
            clear filters
          </Link>
          .
        </p>
      )}
    </div>
  );
}