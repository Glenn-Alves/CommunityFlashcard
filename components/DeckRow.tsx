import DeckCard, { type DeckSummary } from "./DeckCard";

export default function DeckRow({
  title,
  decks,
}: {
  title: string;
  decks: DeckSummary[];
}) {
  if (decks.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="font-display font-bold text-ink text-sm uppercase tracking-wide mb-4">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {decks.map((deck) => (
          <div key={deck.id} className="min-w-[260px] max-w-[260px] flex-shrink-0">
            <DeckCard deck={deck} />
          </div>
        ))}
      </div>
    </section>
  );
}