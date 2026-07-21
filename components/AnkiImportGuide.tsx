"use client";

import { useState } from "react";

export default function AnkiImportGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-ink/10 rounded-sm mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-ink hover:bg-card transition-colors focus-ring"
      >
        <span>How do I export a file from Anki that works here?</span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 text-sm text-muted space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open the Anki desktop app.</li>
            <li>
              In the deck list, click the deck you want to export. If it has
              subdecks (like chapters or sections) and you want all of them,
              pick the <strong className="text-ink">top-level</strong> one:
              exporting a subdeck only brings that one piece, not its
              siblings or parent.
            </li>
            <li>
              Go to <strong className="text-ink">File → Export</strong>.
            </li>
            <li>
              Set the export format to{" "}
              <strong className="text-ink">Anki Deck Package (.apkg)</strong>.
            </li>
            <li>
              Check{" "}
              <strong className="text-ink">
                "Support older Anki versions"
              </strong>
              . This is the <b>important</b> one! Without it, the file uses a
              format we can't read yet, and you'll get an error when
              importing.
            </li>
            <li>Export, then upload that file below.</li>
          </ol>
          <p className="pt-1">
            A deck with no subdecks fills in the card fields below so you can
            review before publishing. A deck with subdecks gets built and
            organized automatically, and takes you straight to it.
          </p>
          <p>
            Card images come through automatically. Audio isn't supported yet.
          </p>
        </div>
      )}
    </div>
  );
}
