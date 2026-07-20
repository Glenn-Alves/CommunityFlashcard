"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudyCard } from "@/lib/getDeckForStudy";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Difficulty = "try" | "answered" | "easy";

export default function StudyMode({
  deckId,
  title,
  cards,
}: {
  deckId: string;
  title: string;
  cards: StudyCard[];
}) {
  const [queue, setQueue] = useState<StudyCard[]>(cards);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="pt-16 max-w-md">
        <p className="text-sm text-muted mb-4">This deck has no cards yet.</p>
        <Link
          href={`/deck/${deckId}`}
          className="text-sm text-rule hover:text-ink transition-colors focus-ring"
        >
          Back to deck
        </Link>
      </div>
    );
  }

  const finished = queue.length === 0;

  function handleDifficulty(level: Difficulty) {
    const [current, ...rest] = queue;

    if (level === "easy") {
      // Mastered — drop it from this session's queue entirely.
      setQueue(rest);
    } else {
      // "try" comes back almost immediately; "answered" comes back
      // further down the queue.
      const insertPos =
        level === "try" ? Math.min(1, rest.length) : Math.min(4, rest.length);
      setQueue([...rest.slice(0, insertPos), current, ...rest.slice(insertPos)]);
    }

    setFlipped(false);
  }

  function restart(shuffled: boolean) {
    setQueue(shuffled ? shuffle(cards) : cards);
    setFlipped(false);
  }

  if (finished) {
    return (
      <div className="pt-16 max-w-md">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          nice work
        </p>
        <h1 className="font-display font-bold text-ink text-2xl mb-6">
          You finished {title}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => restart(false)}
            className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring"
          >
            Study again
          </button>
          <button
            onClick={() => restart(true)}
            className="border border-ink/20 text-ink px-5 py-2.5 rounded-sm text-sm font-medium hover:border-ink transition-colors focus-ring"
          >
            Shuffle and retry
          </button>
        </div>
        <Link
          href={`/deck/${deckId}`}
          className="block mt-6 text-sm text-muted hover:text-ink transition-colors focus-ring"
        >
          Back to deck
        </Link>
      </div>
    );
  }

  const current = queue[0];

  return (
    <div className="pt-12 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/deck/${deckId}`}
          className="text-sm text-muted hover:text-ink transition-colors focus-ring"
        >
          ← Back to deck
        </Link>
        <p className="font-display text-xs text-muted uppercase tracking-wide">
          {queue.length} card{queue.length !== 1 ? "s" : ""} left
        </p>
      </div>

      <h1 className="font-display font-bold text-ink text-xl mb-8">{title}</h1>

      {/* Flip card */}
      <div
        className="[perspective:1200px] mb-8 cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative h-80 transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-card border-2 border-ink rounded-lg shadow-sm p-10 flex flex-col items-center justify-center gap-4 overflow-y-auto [backface-visibility:hidden]">
            {current.frontImage && (
              <img
                src={current.frontImage}
                alt="Front"
                className="max-h-40 rounded-sm"
              />
            )}
            <p className="text-xl text-ink font-medium text-center leading-relaxed">{current.front}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-card border-2 border-rule rounded-lg shadow-sm p-10 flex flex-col items-center justify-center gap-4 overflow-y-auto [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            {current.backImage && (
              <img
                src={current.backImage}
                alt="Back"
                className="max-h-40 rounded-sm"
              />
            )}
            <p className="text-xl text-muted text-center leading-relaxed">{current.back}</p>
          </div>
        </div>
      </div>

      {!flipped ? (
        <p className="text-xs text-muted text-center">Click the card to flip it</p>
      ) : (
        <div>
          <p className="text-xs text-muted text-center mb-3">How well did you know it?</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDifficulty("try")}
              className="bg-margin text-paper px-4 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity focus-ring"
            >
              Try
              <span className="block text-[11px] font-normal opacity-80 mt-0.5">
                show again soon
              </span>
            </button>
            <button
              onClick={() => handleDifficulty("easy")}
              className="bg-ink text-paper px-4 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity focus-ring"
            >
              Easy
              <span className="block text-[11px] font-normal opacity-80 mt-0.5">
                done for now
              </span>
            </button>
            <button
              onClick={() => handleDifficulty("answered")}
              className="bg-rule text-paper px-4 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity focus-ring"
            >
              Answered
              <span className="block text-[11px] font-normal opacity-80 mt-0.5">
                show again later
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}