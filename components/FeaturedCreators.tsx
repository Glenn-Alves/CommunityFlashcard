import type { FeaturedCreator } from "@/lib/getDiscoverySections";

export default function FeaturedCreators({
  creators,
}: {
  creators: FeaturedCreator[];
}) {
  if (creators.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="font-display font-bold text-ink text-sm uppercase tracking-wide mb-4">
        Featured Creators
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {creators.map((creator) => (
          <div
            key={creator.username}
            className="min-w-[160px] flex-shrink-0 bg-card border border-ink/10 rounded-sm px-4 py-3"
          >
            <p className="font-display font-bold text-ink text-sm truncate">
              {creator.username}
            </p>
            <p className="text-xs text-muted mt-1">
              {creator.deckCount} deck{creator.deckCount !== 1 ? "s" : ""}
            </p>
            {creator.avgRating > 0 && (
              <p className="text-xs text-margin mt-0.5">
                ★ {creator.avgRating.toFixed(1)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}