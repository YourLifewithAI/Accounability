"use client";

import { useState } from "react";

/**
 * Share affordance: uses the Web Share API on mobile, falls back to copy-link.
 * "Easy to share with friends" is the whole point — keep this on every profile.
 */
export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; nothing else to do
    }
  }

  return (
    <button
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      <span aria-hidden>↗</span>
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
