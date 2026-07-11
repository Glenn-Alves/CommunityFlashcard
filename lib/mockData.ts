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

export const decks: Deck[] = [
  {
    id: "ap-bio-cellular-respiration",
    title: "AP Biology — Cellular Respiration",
    description: "Glycolysis, the Krebs cycle, and the electron transport chain, broken into exam-sized pieces.",
    author: "mei.chen",
    tags: ["biology", "ap-bio", "exam-prep"],
    rating: 4.6,
    ratingCount: 128,
    cardCount: 42,
    cards: [
      { id: "c1", front: "What are the 3 stages of cellular respiration?", back: "Glycolysis, the Krebs cycle, and the electron transport chain." },
      { id: "c2", front: "Where does glycolysis take place?", back: "The cytoplasm." },
    ],
    comments: [
      { id: "m1", author: "study_with_jae", body: "The ETC cards saved my midterm, thank you." },
    ],
  },
  {
    id: "jlpt-n3-vocab",
    title: "JLPT N3 Vocabulary",
    description: "Core vocabulary list for the N3 exam with example sentences on the back.",
    author: "tomo_k",
    tags: ["japanese", "jlpt", "vocabulary"],
    rating: 4.8,
    ratingCount: 305,
    cardCount: 620,
    cards: [
      { id: "c1", front: "経験", back: "keiken — experience" },
    ],
    comments: [],
  },
  {
    id: "orgo-reaction-mechanisms",
    title: "Organic Chemistry — Reaction Mechanisms",
    description: "SN1, SN2, E1, E2 — when each one happens and why.",
    author: "premedmarcus",
    tags: ["chemistry", "organic-chem", "mcat"],
    rating: 4.3,
    ratingCount: 89,
    cardCount: 55,
    cards: [
      { id: "c1", front: "SN1 or SN2: tertiary carbon, weak nucleophile?", back: "SN1." },
    ],
    comments: [],
  },
  {
    id: "us-history-1865-1900",
    title: "US History: Reconstruction to 1900",
    description: "Key events, amendments, and figures from Reconstruction through the Gilded Age.",
    author: "historybuffhannah",
    tags: ["history", "us-history", "apush"],
    rating: 4.1,
    ratingCount: 47,
    cardCount: 38,
    cards: [
      { id: "c1", front: "What did the 14th Amendment guarantee?", back: "Citizenship and equal protection under the law." },
    ],
    comments: [],
  },
];
