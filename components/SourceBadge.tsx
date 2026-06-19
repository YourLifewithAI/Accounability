import type { SourceCitation } from "@/lib/provenance";
import { SOURCE_LABELS } from "@/lib/provenance";
import { formatDate } from "@/lib/format";

/**
 * Renders next to every figure so a reader can verify it against the primary
 * source. This is the core trust affordance of an accountability app.
 */
export function SourceBadge({ citation }: { citation: SourceCitation }) {
  const title = `${SOURCE_LABELS[citation.source]} — retrieved ${formatDate(
    citation.fetchedAt,
  )}${citation.note ? ` · ${citation.note}` : ""}`;
  return (
    <a
      href={citation.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-accent hover:text-accent"
    >
      <span aria-hidden>↗</span>
      <span>Source: {citation.source}</span>
    </a>
  );
}
