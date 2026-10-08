"use client";

import { useEffect } from "react";

/**
 * Counts one menu view per browser session and slug. Renders nothing. The owner's own visits
 * (preview or regular) are not counted, so the page simply does not mount the beacon for them.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `menura:viewed:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked (private mode); counting a view twice beats never counting it.
    }
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface errors to guests.
    });
  }, [slug]);

  return null;
}
