import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { listPoliticians, searchPoliticians } from "@/lib/data";
import type { Politician } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Money & Power — who funds Congress",
  description:
    "Search a member of Congress to see their top donors, industries, and the federal money flowing to their state.",
};

function PartyDot({ party }: { party: Politician["party"] }) {
  const color =
    party === "D" ? "bg-blue-600" : party === "R" ? "bg-red-600" : "bg-purple-600";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function ResultRow({ p }: { p: Politician }) {
  return (
    <Link
      href={`/money/politician/${p.slug}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-accent hover:shadow-sm"
    >
      <span className="flex items-center gap-2.5">
        <PartyDot party={p.party} />
        <span className="font-semibold text-ink">{p.name}</span>
      </span>
      <span className="text-sm text-slate-500">{p.office}</span>
    </Link>
  );
}

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? searchPoliticians(query) : listPoliticians();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          💰 Money &amp; Power
        </h1>
        <p className="text-slate-600">
          Search a member of Congress to see who funds them and where federal
          money flows.
        </p>
      </div>

      <SearchBox initialQuery={query} />

      <div>
        <p className="mb-3 text-sm text-slate-500">
          {query
            ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`
            : `Browse ${results.length} members`}
        </p>
        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            No members matched “{query}”. This preview covers a sample set of
            members of Congress.
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((p) => (
              <ResultRow key={p.slug} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
