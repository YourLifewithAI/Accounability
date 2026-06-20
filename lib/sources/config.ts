/** Central switches for live-data access. */

export function liveEnabled(): boolean {
  return process.env.ACCOUNTABILITY_LIVE === "1";
}

export function fecApiKey(): string {
  return process.env.FEC_API_KEY || "DEMO_KEY";
}

export function ftmApiKey(): string | undefined {
  return process.env.FTM_API_KEY || undefined;
}

/** Host base URLs for the public data sources. */
export const ENDPOINTS = {
  fec: "https://api.open.fec.gov/v1",
  usaspending: "https://api.usaspending.gov/api/v2",
  followTheMoney: "https://api.followthemoney.org",
  legislators:
    "https://unitedstates.github.io/congress-legislators/legislators-current.json",
} as const;

/**
 * Fetch wrapper with a sane timeout and Next.js ISR caching. Revalidate daily —
 * federal filings are periodic, so day-old cached data is accurate enough for
 * public pages and keeps us far under the FEC 1,000 req/hour limit.
 */
export async function fetchJson<T>(
  url: string,
  revalidateSeconds = 86_400,
): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`Upstream ${res.status} for ${url}`);
  }
  return (await res.json()) as T;
}
