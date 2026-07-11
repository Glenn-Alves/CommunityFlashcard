export default function CreateDeckPage() {
  return (
    <div className="pt-12 max-w-2xl">
      <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
        new deck
      </p>
      <h1 className="font-display font-bold text-ink text-2xl md:text-3xl mb-8">
        Publish a deck
      </h1>

      <form className="space-y-6">
        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="AP Biology — Cellular Respiration"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What's in this deck and who is it for?"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="biology, ap-bio, exam-prep"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
          <p className="text-xs text-muted mt-1.5">Separate tags with commas.</p>
        </div>

        {/* Import option */}
        <div className="border-2 border-dashed border-ink/25 rounded-sm p-6 text-center">
          <p className="text-sm text-ink font-medium mb-1">
            Import cards from a file
          </p>
          <p className="text-xs text-muted mb-4">
            Supports CSV now. Anki .apkg import is coming soon.
          </p>
          <button
            type="button"
            className="border border-ink/20 text-ink px-4 py-2 rounded-sm text-sm font-medium hover:border-ink transition-colors focus-ring"
          >
            Choose file
          </button>
        </div>

        {/* Manual card entry */}
        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Or add cards manually
          </label>
          <div className="ruled margin-rule bg-card border border-ink/10 rounded-sm p-4 pl-11 grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              placeholder="Front"
              className="bg-transparent text-sm text-ink placeholder:text-muted focus-ring rounded-sm"
            />
            <input
              type="text"
              placeholder="Back"
              className="bg-transparent text-sm text-ink placeholder:text-muted focus-ring rounded-sm"
            />
          </div>
          <button
            type="button"
            className="text-sm text-rule hover:text-ink transition-colors focus-ring"
          >
            + Add another card
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-ink text-paper px-6 py-3 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring"
          >
            Publish deck
          </button>
          <button
            type="button"
            className="text-sm text-muted hover:text-ink transition-colors focus-ring"
          >
            Save as draft
          </button>
        </div>
      </form>
    </div>
  );
}
