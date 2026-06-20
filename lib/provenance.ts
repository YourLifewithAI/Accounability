/**
 * Provenance is a first-class feature of an accountability app: no figure should
 * ever render without an attached source and a timestamp. These types are the
 * contract every data source and UI component agrees on.
 */

export type SourceName =
  | "FEC"
  | "USAspending"
  | "FollowTheMoney"
  | "congress-legislators";

/** Where a single figure came from, and when we fetched it. */
export interface SourceCitation {
  source: SourceName;
  /** Link to the primary source a reader can verify against. */
  sourceUrl: string;
  /** ISO-8601 timestamp of when this figure was retrieved. */
  fetchedAt: string;
  /** Optional caveat shown next to the figure (e.g. methodology note). */
  note?: string;
}

/**
 * Whether a page is backed by live API data or clearly-labeled sample data.
 * Sample mode keeps the app demonstrable where live sources are unreachable
 * (missing keys, or a network egress allowlist) WITHOUT ever passing fabricated
 * numbers off as real — the UI always surfaces this flag.
 */
export type DataMode = "live" | "sample";

export const SOURCE_LABELS: Record<SourceName, string> = {
  FEC: "Federal Election Commission",
  USAspending: "USAspending.gov",
  FollowTheMoney: "FollowTheMoney.org",
  "congress-legislators": "@unitedstates/congress-legislators",
};

export const SOURCE_HOMEPAGES: Record<SourceName, string> = {
  FEC: "https://www.fec.gov/data/",
  USAspending: "https://www.usaspending.gov/",
  FollowTheMoney: "https://www.followthemoney.org/",
  "congress-legislators":
    "https://github.com/unitedstates/congress-legislators",
};

/** Convenience constructor that stamps `fetchedAt` to now. */
export function cite(
  source: SourceName,
  sourceUrl: string,
  note?: string,
): SourceCitation {
  return { source, sourceUrl, fetchedAt: new Date().toISOString(), note };
}
