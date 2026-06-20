import { ENDPOINTS } from "@/lib/sources/config";

/**
 * Minimal USAspending.gov client. Base: https://api.usaspending.gov/api/v2
 * No API key, no auth. Data is recipient/agency-centric, NOT politician-centric,
 * so we use it to show federal money flowing to a member's state/district —
 * contextual flow, never a direct causal link (the UI says so explicitly).
 */

export function usaspendingStatePageUrl(stateCode: string): string {
  return `https://www.usaspending.gov/state/${stateCode.toLowerCase()}`;
}

interface AwardSearchResponse {
  results: Array<{
    "Award ID"?: string;
    "Recipient Name"?: string;
    "Award Amount"?: number;
    "Awarding Agency"?: string;
  }>;
}

/** Top awards (contracts/grants) flowing to recipients in a given state. */
export async function getTopAwardsByState(
  stateCode: string,
  fiscalYear: number,
) {
  const body = {
    filters: {
      time_period: [
        { start_date: `${fiscalYear - 1}-10-01`, end_date: `${fiscalYear}-09-30` },
      ],
      place_of_performance_locations: [{ country: "USA", state: stateCode }],
      award_type_codes: ["A", "B", "C", "D"],
    },
    fields: ["Award ID", "Recipient Name", "Award Amount", "Awarding Agency"],
    sort: "Award Amount",
    order: "desc",
    limit: 10,
  };
  const res = await fetch(`${ENDPOINTS.usaspending}/search/spending_by_award/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 604_800 }, // weekly
  });
  if (!res.ok) throw new Error(`USAspending ${res.status}`);
  const data = (await res.json()) as AwardSearchResponse;
  return data.results ?? [];
}
