import { getDeckForStudy } from "@/lib/getDeckForStudy";
import StudyMode from "@/components/StudyMode";
import { createClient } from "@/lib/supabase/server";
import { decks as sampleDecks } from "@/lib/mockData";
import { notFound } from "next/navigation";

export default async function StudyPage({
  params,
}: {
  params: { id: string };
}) {
  const deck = await getDeckForStudy(params.id);
  if (!deck) return notFound();

  const isSample = sampleDecks.some((d) => d.id === params.id);

  if (!isSample && deck.tags.length > 0) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (user) {
      await supabase.from("tag_activity").insert(
        deck.tags.map((tag) => ({ user_id: user.id, tag }))
      );
    }
  }

  return <StudyMode deckId={params.id} title={deck.title} cards={deck.cards} />;
}