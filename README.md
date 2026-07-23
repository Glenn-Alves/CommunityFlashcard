# # # OpenDeck — UI base

This is the base UI for the flashcard-sharing site: browse decks, view a deck
with rating/comments, and a create-deck form. It runs on mock data
(`lib/mockData.ts`) — no database wired up yet, by design, so you can review
the UI on its own before connecting Supabase/Postgres.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's here

- `app/page.tsx` — browse/search page (hero + tag filters + deck grid)
- `app/deck/[id]/page.tsx` — deck detail (card preview, rating, comments)
- `app/create/page.tsx` — create-deck form (manual entry + import placeholder)
- `components/DeckCard.tsx`, `RatingStars.tsx`, `Navbar.tsx` — reusable pieces
- `lib/mockData.ts` — swap this out for real Supabase queries later

## Design system

- Colors, fonts, and the ruled-paper/margin-rule classes are defined in
  `tailwind.config.ts` and `app/globals.css` — reuse `.ruled` and
  `.margin-rule` on any new card-like surface to stay consistent.
- Display font (headings) is Space Mono; body font is Inter.

## Next steps (from the build plan)

1. Wire up Supabase Auth for login/signup
2. Replace `mockData.ts` with real deck/card queries
3. Make the search bar and tag filters actually filter (Postgres full-text
   search to start — no AI needed yet)
4. Wire the rating/comment forms to write to the database
5. CSV export, then Anki `.apkg` import/export
