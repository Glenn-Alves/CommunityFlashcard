export function estimateStudyTime(cardCount: number): string {
  const totalSeconds = cardCount * 30;
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `~${hours} hr` : `~${hours} hr ${mins} min`;
}