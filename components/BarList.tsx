import Link from "next/link";
import type { MoneyEntry } from "@/lib/data/types";
import { formatCompactUsd } from "@/lib/format";

/**
 * A dependency-free horizontal bar list for money breakdowns (donors, industries,
 * employers, spending). Bars are sized relative to the largest entry.
 */
export function BarList({
  entries,
  linkBase,
}: {
  entries: MoneyEntry[];
  /** When set, entry names link to `${linkBase}/${slug}`. */
  linkBase?: string;
}) {
  const max = Math.max(1, ...entries.map((e) => e.amount));
  return (
    <ul className="space-y-2.5">
      {entries.map((e, i) => {
        const pct = Math.max(2, Math.round((e.amount / max) * 100));
        const label =
          linkBase && e.slug ? (
            <Link
              href={`${linkBase}/${e.slug}`}
              className="font-medium text-ink hover:text-accent hover:underline"
            >
              {e.name}
            </Link>
          ) : (
            <span className="font-medium text-ink">{e.name}</span>
          );
        return (
          <li key={`${e.name}-${i}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {label}
                {e.kind ? (
                  <span className="ml-2 text-xs text-slate-500">{e.kind}</span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-ink">
                {formatCompactUsd(e.amount)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent/80"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
