"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Search input that routes to /money?q=... — server renders the results. */
export function SearchBox({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/money?q=${encodeURIComponent(query)}` : "/money");
  }

  return (
    <form onSubmit={submit} className="flex w-full gap-2">
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a senator, representative, or state…"
        aria-label="Search members of Congress"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-ink shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      <button
        type="submit"
        className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
      >
        Search
      </button>
    </form>
  );
}
