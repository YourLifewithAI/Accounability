import { ENDPOINTS, fetchJson } from "@/lib/sources/config";
import type { Chamber, Party } from "@/lib/data/types";

/**
 * Identity crosswalk from the public @unitedstates/congress-legislators dataset.
 * This is the backbone that maps a member -> FEC IDs (links campaign finance),
 * -> state/district (links USAspending), -> bio. No auth; just fetch the JSON.
 */

interface RawLegislator {
  id: { bioguide: string; fec?: string[] };
  name: { first: string; last: string; official_full?: string };
  terms: Array<{
    type: "sen" | "rep";
    state: string;
    district?: number;
    party: string;
  }>;
}

export interface LegislatorIdentity {
  slug: string;
  bioguideId: string;
  fecIds: string[];
  name: string;
  firstName: string;
  lastName: string;
  party: Party;
  state: string;
  district?: number;
  chamber: Chamber;
  office: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeParty(p: string): Party {
  if (p === "Democrat") return "D";
  if (p === "Republican") return "R";
  return "I";
}

/** Fetch and normalize the current members of Congress. */
export async function getCurrentLegislators(): Promise<LegislatorIdentity[]> {
  const raw = await fetchJson<RawLegislator[]>(ENDPOINTS.legislators);
  return raw.map((leg) => {
    const term = leg.terms[leg.terms.length - 1];
    const chamber: Chamber = term.type === "sen" ? "senate" : "house";
    const name = leg.name.official_full ?? `${leg.name.first} ${leg.name.last}`;
    const office =
      chamber === "senate"
        ? `U.S. Senator (${term.state})`
        : `U.S. Representative (${term.state}-${term.district})`;
    return {
      slug: slugify(name),
      bioguideId: leg.id.bioguide,
      fecIds: leg.id.fec ?? [],
      name,
      firstName: leg.name.first,
      lastName: leg.name.last,
      party: normalizeParty(term.party),
      state: term.state,
      district: term.district,
      chamber,
      office,
    };
  });
}
