import { cite } from "@/lib/provenance";
import type { IngestMember } from "@/lib/db/ingest";
import { SAMPLE_MEMBERS } from "@/lib/fixtures/members";
import {
  getCandidateTotals,
  getContributionsByEmployer,
  getContributionsBySize,
  getPrincipalCommitteeId,
  fecCandidatePageUrl,
} from "@/lib/sources/fec";
import { getCurrentLegislators } from "@/lib/sources/legislators";
import { rollUpIndustries } from "@/lib/sources/industry-map";
import { getTopAwardsByState, usaspendingStatePageUrl } from "@/lib/sources/usaspending";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build ingest records from the bundled sample fixtures (default, offline). */
export function sampleProvider(): IngestMember[] {
  const today = new Date().toISOString().slice(0, 10);
  return SAMPLE_MEMBERS.map((m) => {
    const fecId = m.fecIds[0];
    const fecUrl = fecId ? fecCandidatePageUrl(fecId) : "https://www.fec.gov/data/";
    return {
      politician: {
        slug: m.slug,
        bioguideId: m.bioguideId,
        fecIds: m.fecIds,
        name: m.name,
        firstName: m.firstName,
        lastName: m.lastName,
        party: m.party,
        state: m.state,
        district: m.district,
        chamber: m.chamber,
        office: m.office,
      },
      cycle: m.cycle,
      totals: {
        totalRaised: m.totalRaised,
        totalSpent: m.totalSpent,
        cashOnHand: m.cashOnHand,
        individualTotal: m.individualTotal,
        pacTotal: m.pacTotal,
      },
      bySize: m.bySize,
      donors: m.topDonors.map((d) => ({
        name: d.name,
        slug: d.slug ?? slugify(d.name),
        amount: d.amount,
        kind: d.kind,
      })),
      employers: m.topEmployers,
      industries: m.topIndustries,
      awards: m.districtSpending,
      dataMode: "sample" as const,
      lastUpdated: today,
      citations: {
        totals: cite("FEC", fecUrl),
        donors: cite("FEC", fecUrl),
        industries: cite("FollowTheMoney", "https://www.followthemoney.org/"),
        spending: cite(
          "USAspending",
          usaspendingStatePageUrl(m.state),
          "Federal money flowing to the member's state — contextual, not a direct link.",
        ),
      },
    } satisfies IngestMember;
  });
}

/**
 * Build ingest records from the live public APIs. Pulls member identities from
 * congress-legislators, then per member fetches FEC totals + contributor
 * employers + size buckets and USAspending awards for their state. Industry
 * rollups are computed from employer data (see industry-map). Members without a
 * usable FEC id, or whose fetches fail, are skipped rather than fabricated.
 *
 * `limit` caps the number of members (FEC allows 1,000 requests/hour; each
 * member costs ~4 calls), so a full run should be chunked across invocations.
 */
export async function liveProvider(
  cycle: number,
  limit = 0,
): Promise<IngestMember[]> {
  const legislators = await getCurrentLegislators();
  const today = new Date().toISOString().slice(0, 10);
  const subset = limit > 0 ? legislators.slice(0, limit) : legislators;
  const out: IngestMember[] = [];

  for (const leg of subset) {
    const fecId = leg.fecIds[0];
    if (!fecId) continue;
    try {
      const totals = await getCandidateTotals(fecId, cycle);
      if (!totals) continue;
      const committeeId = await getPrincipalCommitteeId(fecId, cycle);

      let employers: { name: string; amount: number }[] = [];
      let bySize = { small: 0, medium: 0, large: 0 };
      if (committeeId) {
        const byEmployer = await getContributionsByEmployer(committeeId, cycle);
        employers = byEmployer
          .filter((e) => e.employer)
          .map((e) => ({ name: e.employer as string, amount: e.total ?? 0 }));
        bySize = await getContributionsBySize(committeeId, cycle);
      }

      const awardsRaw = await getTopAwardsByState(leg.state, cycle).catch(() => []);
      const awards = awardsRaw
        .filter((a) => a["Recipient Name"])
        .map((a) => ({
          name: a["Recipient Name"] as string,
          amount: a["Award Amount"] ?? 0,
          kind: a["Awarding Agency"] ?? "Federal award",
        }));

      const fecUrl = fecCandidatePageUrl(fecId);
      out.push({
        politician: {
          slug: leg.slug,
          bioguideId: leg.bioguideId,
          fecIds: leg.fecIds,
          name: leg.name,
          firstName: leg.firstName,
          lastName: leg.lastName,
          party: leg.party,
          state: leg.state,
          district: leg.district,
          chamber: leg.chamber,
          office: leg.office,
        },
        cycle,
        totals: {
          totalRaised: totals.receipts ?? 0,
          totalSpent: totals.disbursements ?? 0,
          cashOnHand: totals.last_cash_on_hand_end_period ?? 0,
          individualTotal: totals.individual_itemized_contributions ?? 0,
          pacTotal: totals.other_political_committee_contributions ?? 0,
        },
        bySize,
        donors: employers.slice(0, 5).map((e) => ({
          name: e.name,
          slug: slugify(e.name),
          amount: e.amount,
          kind: "Individual",
        })),
        employers: employers.slice(0, 5),
        industries: rollUpIndustries(employers).slice(0, 5),
        awards: awards.slice(0, 5),
        dataMode: "live" as const,
        lastUpdated: today,
        citations: {
          totals: cite("FEC", fecUrl),
          donors: cite("FEC", fecUrl, "Top contributors aggregated by employer."),
          industries: cite(
            "FollowTheMoney",
            "https://www.followthemoney.org/",
            "Approximate industry rollup computed from FEC employer data.",
          ),
          spending: cite(
            "USAspending",
            usaspendingStatePageUrl(leg.state),
            "Federal money flowing to the member's state — contextual, not a direct link.",
          ),
        },
      });
    } catch {
      // Skip this member on any upstream error; keep the run going.
      continue;
    }
  }
  return out;
}
