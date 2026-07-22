export type Card = {
  id: string;
  front: string;
  back: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  cardCount: number;
  cards: Card[];
  comments: { id: string; author: string; body: string }[];
};

export const decks: Deck[] = [];