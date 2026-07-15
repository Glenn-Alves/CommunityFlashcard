import { getDeckForStudy } from "@/lib/getDeckForStudy";
import StudyMode from "@/components/StudyMode";
import { notFound } from "next/navigation";

export default async function StudyPage({
  params,
}: {
  params: { id: string };
}) {
  const deck = await getDeckForStudy(params.id);
  if (!deck) return notFound();

  return <StudyMode deckId={params.id} title={deck.title} cards={deck.cards} />;
}