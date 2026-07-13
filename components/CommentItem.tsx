"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CommentBody from "./CommentBody";

const WORD_LIMIT = 150;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

type Comment = {
  id: string;
  author: string;
  body: string;
  userId: string | null;
};

export default function CommentItem({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();

  const isOwner = Boolean(currentUserId) && currentUserId === comment.userId;

  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(body);
  const overLimit = wordCount > WORD_LIMIT;

  async function handleSave() {
    if (!body.trim() || overLimit) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("comments")
      .update({ body: body.trim() })
      .eq("id", comment.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this comment? This can't be undone.")) return;
    setDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);

    setDeleting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="border-b border-ink/10 pb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-xs text-ink font-bold">{comment.author}</p>
        {isOwner && !editing && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setBody(comment.body);
                setEditing(true);
              }}
              className="text-xs text-muted hover:text-ink transition-colors focus-ring"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-muted hover:text-margin transition-colors focus-ring disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full bg-card border-2 border-ink rounded-sm px-3 py-2 text-sm text-ink focus-ring mb-1"
          />
          <p className={`text-xs mb-2 ${overLimit ? "text-margin" : "text-muted"}`}>
            {wordCount}/{WORD_LIMIT} words
            {overLimit && " — please shorten your comment"}
          </p>
          {error && <p className="text-xs text-margin mb-2">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !body.trim() || overLimit}
              className="bg-ink text-paper px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-margin transition-colors focus-ring disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="text-xs text-muted hover:text-ink transition-colors focus-ring"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <CommentBody body={comment.body} />
          {error && <p className="text-xs text-margin mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}