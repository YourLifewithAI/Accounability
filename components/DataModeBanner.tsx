import type { DataMode } from "@/lib/provenance";

/**
 * Honest labeling: when a page is built from sample data (because live sources
 * are unreachable), say so loudly. An accountability tool must never present
 * placeholder numbers as verified fact.
 */
export function DataModeBanner({ mode }: { mode: DataMode }) {
  if (mode === "live") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
        <strong>Live data.</strong> Figures pulled from public APIs. Click any{" "}
        <em>Source</em> tag to verify against the primary record.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <strong>Sample data.</strong> Dollar figures are illustrative placeholders,
      not real reported totals — live API access is not configured in this
      environment. Identity (names, offices, IDs) is real. Set{" "}
      <code className="rounded bg-amber-100 px-1">ACCOUNTABILITY_LIVE=1</code>{" "}
      with API keys to load verified figures.
    </div>
  );
}
