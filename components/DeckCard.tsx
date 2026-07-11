import Link from "next/link";
import RatingStars from "./RatingStars";

export type DeckSummary = {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  cardCount: number;
};

export default function DeckCard({ deck }: { deck: DeckSummary }) {
  return (
    <Link
      href={`/deck/${deck.id}`}
      className="group block focus-ring rounded-sm"
    >
      <div className="ruled margin-rule bg-card border border-ink/10 rounded-sm p-5 pl-11 h-full transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-[3px_4px_0_0_rgba(30,42,68,0.15)]">
        <p className="font-display text-xs text-muted uppercase tracking-wide mb-2">
          {deck.cardCount} cards · by {deck.author}
        </p>
        <h3 className="font-display font-bold text-ink text-base leading-snug mb-2">
          {deck.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
          {deck.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {deck.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-rule border border-rule/40 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>

        <RatingStars rating={deck.rating} count={deck.ratingCount} />
      </div>
    </Link>
  );
}
