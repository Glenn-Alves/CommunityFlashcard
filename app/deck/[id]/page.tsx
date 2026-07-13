import { decks as sampleDecks } from "@/lib/mockData";
import RatingStars from "@/components/RatingStars";
import RatingWidget from "@/components/RatingWidget";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type ViewDeck = {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  cardCount: number;
  cards: { id: string; front: string; back: string }[];
  comments: { id: string; author: string; body: string; userId: string | null }[];
};

async function getRealDeck(id: string): Promise<ViewDeck | null> {
  const supabase = await createClient();

  const { data: deck, error } = await supabase
    .from("decks")
    .select(
      "id, title, description, tags, profiles(username), cards(id, front_text, back_text), ratings(score), comments(id, body, created_at, user_id, profiles(username))"
    )
    .eq("id", id)
    .single();

  if (error || !deck) return null;

  const scores: number[] = (deck.ratings ?? []).map((r: any) => r.score);
  const avgRating = scores.length
    ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    : 0;

  const sortedComments = [...(deck.comments ?? [])].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    id: deck.id,
    title: deck.title,
    description: deck.description ?? "",
    author: (deck as any).profiles?.username ?? "a deckbox user",
    tags: deck.tags ?? [],
    rating: avgRating,
    ratingCount: scores.length,
    cardCount: deck.cards?.length ?? 0,
    cards: (deck.cards ?? []).map((c: any) => ({
      id: c.id,
      front: c.front_text,
      back: c.back_text,
    })),
    comments: sortedComments.map((c: any) => ({
      id: c.id,
      author: c.profiles?.username ?? "a deckbox user",
      body: c.body,
      userId: c.user_id ?? null,
    })),
  };
}

export default async function DeckDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const sample = sampleDecks.find((d) => d.id === params.id);
  const isSample = Boolean(sample);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const deck: ViewDeck | null = sample
    ? {
        id: sample.id,
        title: sample.title,
        description: sample.description,
        author: sample.author,
        tags: sample.tags,
        rating: sample.rating,
        ratingCount: sample.ratingCount,
        cardCount: sample.cardCount,
        cards: sample.cards.map((c) => ({
          id: c.id,
          front: c.front,
          back: c.back,
        })),
        comments: sample.comments.map((c) => ({
          id: c.id,
          author: c.author,
          body: c.body,
          userId: null,
        })),
      }
    : await getRealDeck(params.id);

  if (!deck) return notFound();

  return (
    <div className="pt-12">
      {/* Header */}
      <div className="border-b border-ink/10 pb-8 mb-8">
        <p className="font-display text-xs text-muted uppercase tracking-wide mb-3">
          {deck.cardCount} cards · by {deck.author}
        </p>
        <h1 className="font-display font-bold text-ink text-2xl md:text-3xl mb-3">
          {deck.title}
        </h1>
        <p className="text-muted max-w-2xl mb-5">{deck.description}</p>

        <div className="flex flex-wrap items-center gap-4 mb-5">
          <RatingStars rating={deck.rating} count={deck.ratingCount} />
          <div className="flex flex-wrap gap-1.5">
            {deck.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-rule border border-rule/40 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring">
            Study this deck
          </button>
          <button className="border border-ink/20 text-ink px-5 py-2.5 rounded-sm text-sm font-medium hover:border-ink transition-colors focus-ring">
            Export as CSV
          </button>
        </div>
      </div>

      {/* Card preview list */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-ink text-sm uppercase tracking-wide mb-4">
          Preview
        </h2>
        <div className="space-y-3">
          {deck.cards.map((card) => (
            <div
              key={card.id}
              className="ruled margin-rule bg-card border border-ink/10 rounded-sm p-4 pl-11 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <p className="text-sm text-ink font-medium">{card.front}</p>
              <p className="text-sm text-muted">{card.back}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rate + comment */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-ink text-sm uppercase tracking-wide mb-4">
          Rate this deck
        </h2>
        {isSample ? (
          <p className="text-sm text-muted mb-8">
            This is a sample deck — rating is disabled for demo content.
          </p>
        ) : (
          <RatingWidget deckId={deck.id} />
        )}

        <h2 className="font-display font-bold text-ink text-sm uppercase tracking-wide mb-4">
          Comments ({deck.comments.length})
        </h2>

        {isSample ? (
          <p className="text-sm text-muted mb-6">
            This is a sample deck — commenting is disabled for demo content.
          </p>
        ) : (
          <CommentForm deckId={deck.id} />
        )}

        <div className="space-y-4">
          {deck.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))}
          {deck.comments.length === 0 && (
            <p className="text-sm text-muted">No comments yet — be the first to say something.</p>
          )}
        </div>
      </section>
    </div>
  );
}