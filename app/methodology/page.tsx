import type { Metadata } from "next";
import { SOURCE_HOMEPAGES, SOURCE_LABELS } from "@/lib/provenance";

export const metadata: Metadata = {
  title: "Methodology & sources",
  description:
    "Where Accountable's data comes from, how it's processed, and its limitations.",
};

const SOURCES = [
  {
    key: "FEC" as const,
    what: "Campaign finance — candidate totals, individual contributions, PAC money, and disbursements. The 'who funds them' layer.",
    note: "Free API key from api.data.gov; limited to 1,000 requests/hour, so figures are cached and refreshed on a schedule. FEC aggregates exclude unitemized contributions.",
  },
  {
    key: "USAspending" as const,
    what: "Federal contracts, grants, and spending flowing to recipients in a member's state or district. The 'where the money goes' layer.",
    note: "No API key required. This is contextual flow — it is NOT a direct or causal link between a member's votes and their donors.",
  },
  {
    key: "FollowTheMoney" as const,
    what: "Aggregated industry and sector influence used to summarize 'which industries fund whom.'",
    note: "Free account for API access. (Note: the OpenSecrets API was discontinued in April 2025, so industry rollups are computed from contributor employer/occupation data and supplemented here.)",
  },
  {
    key: "congress-legislators" as const,
    what: "The identity backbone — maps each member to their FEC IDs, state/district, and bio so the datasets above can be joined.",
    note: "Public dataset, no auth.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Methodology &amp; sources
        </h1>
        <p className="text-slate-600">
          Accountability depends on provenance. Every figure on this site links
          back to a primary source, carries the date it was retrieved, and is
          labeled <strong>sample</strong> or <strong>live</strong> so nothing is
          ever presented as verified when it isn&apos;t.
        </p>
      </header>

      <section className="space-y-4">
        {SOURCES.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <a
              href={SOURCE_HOMEPAGES[s.key]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-ink hover:text-accent"
            >
              {SOURCE_LABELS[s.key]} ↗
            </a>
            <p className="mt-1 text-sm text-slate-700">{s.what}</p>
            <p className="mt-2 text-xs text-slate-500">{s.note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">On limitations</p>
        <p className="mt-1">
          Money flowing to a member&apos;s state does not prove influence. Donor
          totals reflect what was itemized and reported. When data is missing for
          a cycle we show &ldquo;not reported&rdquo; rather than a zero. The goal
          is an honest, verifiable starting point for your own questions — not a
          verdict.
        </p>
      </section>
    </div>
  );
}
