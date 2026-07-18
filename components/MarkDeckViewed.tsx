"use client";

import { useEffect } from "react";

export default function MarkDeckViewed({ tags }: { tags: string[] }) {
  useEffect(() => {
    const encoded = encodeURIComponent(JSON.stringify(tags ?? []));
    document.cookie = `recentDeckTags=${encoded}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [tags]);

  return null;
}