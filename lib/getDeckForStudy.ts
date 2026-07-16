import { decks as sampleDecks } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";

export type StudyCard = { id: string; front: string; back: string };

export async function getDeckForStudy(
  id: string
): Promise<{ title: string; cards: StudyCard[]; tags: string[] } | null> {
  const sample = sampleDecks.find((d) => d.id === id);
  if (sample) {
    return {
      title: sample.title,
      cards: sample.cards.map((c) => ({ id: c.id, front: c.front, back: c.back })),
      tags: sample.tags,
    };
  }

  const supabase = await createClient();

  const { data: rootDeck, error } = await supabase
    .from("decks")
    .select("title, tags")
    .eq("id", id)
    .single();

  if (error || !rootDeck) return null;

  // Walk the subsection tree to collect every descendant deck id
  const allDeckIds = [id];
  let frontier = [id];

  while (frontier.length > 0) {
    const { data: children } = await supabase
      .from("decks")
      .select("id")
      .in("parent_deck_id", frontier);

    if (!children || children.length === 0) break;

    const childIds = children.map((c: any) => c.id);
    allDeckIds.push(...childIds);
    frontier = childIds;
  }

  const { data: cardsData } = await supabase
    .from("cards")
    .select("id, front_text, back_text")
    .in("deck_id", allDeckIds);

  return {
    title: rootDeck.title,
    cards: (cardsData ?? []).map((c: any) => ({
      id: c.id,
      front: c.front_text,
      back: c.back_text,
    })),
    tags: rootDeck.tags ?? [],
  };
}