"use client";

import { useState } from "react";

const PREVIEW_WORD_LIMIT = 50;

export default function CommentBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);

  const words = body.trim().split(/\s+/);
  const isLong = words.length > PREVIEW_WORD_LIMIT;
  const preview = words.slice(0, PREVIEW_WORD_LIMIT).join(" ");

  const displayText = expanded || !isLong ? body : `${preview}...`;

  return (
    <p className="text-sm text-muted break-words">
      {displayText}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-rule hover:text-ink transition-colors focus-ring ml-1 font-medium"
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </p>
  );
}