import { decks as sampleDecks } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";

export type StudyCard = { id: string; front: string; back: string };

export async function getDeckForStudy(
  id: string
): Promise<{ title: string; cards: StudyCard[] } | null> {
  const sample = sampleDecks.find((d) => d.id === id);
  if (sample) {
    return {
      title: sample.title,
      cards: sample.cards.map((c) => ({ id: c.id, front: c.front, back: c.back })),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select("title, cards(id, front_text, back_text)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    title: data.title,
    cards: (data.cards ?? []).map((c: any) => ({
      id: c.id,
      front: c.front_text,
      back: c.back_text,
    })),
  };
}