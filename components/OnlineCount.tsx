"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function getStableVisitorId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("anon_visitor_id");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("anon_visitor_id", id);
  }
  return id;
}

export default function OnlineCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const topic = "online-visitors";

    let channel = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:${topic}`);

    if (!channel) {
      channel = supabase.channel(topic, {
        config: { presence: { key: getStableVisitorId() } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel!.presenceState();
          setCount(Object.keys(state).length);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel!.track({ online_at: new Date().toISOString() });
          }
        });
    } else {
      const state = channel.presenceState();
      setCount(Object.keys(state).length);
    }

    return () => {
      supabase.removeChannel(channel!);
    };
  }, []);

  if (count === null || count < 1) return null;

  return (
    <span className="text-sm text-muted flex items-center gap-1.5">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      {count}
    </span>
  );
}