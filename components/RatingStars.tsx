export default function RatingStars({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n <= full ? "text-margin" : "text-muted/30"}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </div>
  );
}
