import { ENDPOINTS, fecApiKey, fetchJson } from "@/lib/sources/config";

/**
 * Minimal OpenFEC client. Base: https://api.open.fec.gov/v1
 * Auth: `api_key` query param (free from api.data.gov; DEMO_KEY at low limits).
 * Rate limit: 1,000 requests/hour per key — callers must cache aggressively
 * (see fetchJson's ISR revalidate) and prefer batch ingestion for full coverage.
 */

function fecUrl(path: string, params: Record<string, string | number> = {}) {
  const usp = new URLSearchParams({ api_key: fecApiKey() });
  for (const [k, v] of Object.entries(params)) usp.set(k, String(v));
  return `${ENDPOINTS.fec}${path}?${usp.toString()}`;
}

/** Human link to the same data on fec.gov, for source citations. */
export function fecCandidatePageUrl(candidateId: string): string {
  return `https://www.fec.gov/data/candidate/${candidateId}/`;
}

interface FecTotalsResponse {
  results: Array<{
    receipts?: number;
    disbursements?: number;
    last_cash_on_hand_end_period?: number;
    individual_itemized_contributions?: number;
    political_party_committee_contributions?: number;
    other_political_committee_contributions?: number;
    cycle?: number;
  }>;
}

/** Receipts / disbursements / cash-on-hand for a candidate in a cycle. */
export async function getCandidateTotals(candidateId: string, cycle: number) {
  const data = await fetchJson<FecTotalsResponse>(
    fecUrl(`/candidate/${candidateId}/totals/`, { cycle, per_page: 1 }),
  );
  return data.results?.[0] ?? null;
}

interface FecByEmployerResponse {
  results: Array<{ employer?: string; total?: number }>;
}

/** Top contributing employers (a proxy for "who funds them"). */
export async function getContributionsByEmployer(
  committeeId: string,
  cycle: number,
) {
  const data = await fetchJson<FecByEmployerResponse>(
    fecUrl(`/schedules/schedule_a/by_employer/`, {
      committee_id: committeeId,
      cycle,
      per_page: 10,
      sort: "-total",
    }),
  );
  return data.results ?? [];
}
