import { cite, type SourceCitation } from "@/lib/provenance";
import { dbAvailable } from "@/lib/db/client";
import * as repo from "@/lib/db/repository";
import { liveEnabled } from "@/lib/sources/config";
import {
  fecCandidatePageUrl,
  getCandidateTotals,
} from "@/lib/sources/fec";
import { usaspendingStatePageUrl } from "@/lib/sources/usaspending";
import { SAMPLE_MEMBERS, type RawMember } from "@/lib/fixtures/members";
import type {
  Donor,
  Industry,
  MoneyEntry,
  Politician,
  PoliticianFinance,
} from "@/lib/data/types";

/**
 * Single data-access facade for the money module. Pages call only this file.
 *
 * When the ingestion store has been materialized (`npm run ingest`), reads come
 * from the database — the production path. With no DB present, the app falls
 * back to in-memory sample fixtures so it still runs with zero setup; in that
 * fallback, ACCOUNTABILITY_LIVE=1 enriches a member's totals from the live FEC
 * API at request time.
 */

export function listPoliticians(): Politician[] {
  if (dbAvailable()) return repo.listPoliticians();
  return listPoliticiansFromFixtures();
}

export function getPolitician(slug: string): Politician | null {
  if (dbAvailable()) return repo.getPolitician(slug);
  return getPoliticianFromFixtures(slug);
}

export function searchPoliticians(query: string): Politician[] {
  if (dbAvailable()) return repo.searchPoliticians(query);
  return searchPoliticiansFromFixtures(query);
}

export async function getPoliticianFinance(
  slug: string,
): Promise<PoliticianFinance | null> {
  if (dbAvailable()) return repo.getPoliticianFinance(slug);
  return getPoliticianFinanceFromFixtures(slug);
}

export function getDonor(slug: string): Donor | null {
  if (dbAvailable()) return repo.getDonor(slug);
  return getDonorFromFixtures(slug);
}

export function getIndustry(slug: string): Industry | null {
  if (dbAvailable()) return repo.getIndustry(slug);
  return getIndustryFromFixtures(slug);
}

// --- Fixture-backed fallback implementations (no database) ------------------

function toPolitician(m: RawMember): Politician {
  return {
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
  };
}

function listPoliticiansFromFixtures(): Politician[] {
  return SAMPLE_MEMBERS.map(toPolitician).sort((a, b) =>
    a.lastName.localeCompare(b.lastName),
  );
}

function getPoliticianFromFixtures(slug: string): Politician | null {
  const m = SAMPLE_MEMBERS.find((x) => x.slug === slug);
  return m ? toPolitician(m) : null;
}

function searchPoliticiansFromFixtures(query: string): Politician[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listPoliticiansFromFixtures().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.office.toLowerCase().includes(q),
  );
}

async function getPoliticianFinanceFromFixtures(
  slug: string,
): Promise<PoliticianFinance | null> {
  const m = SAMPLE_MEMBERS.find((x) => x.slug === slug);
  if (!m) return null;

  const fecId = m.fecIds[0];
  const fecCite = cite("FEC", fecId ? fecCandidatePageUrl(fecId) : "https://www.fec.gov/data/");
  const usaCite = cite(
    "USAspending",
    usaspendingStatePageUrl(m.state),
    "Federal money flowing to the member's state — contextual, not a direct link.",
  );
  const citations: Record<string, SourceCitation> = {
    totals: fecCite,
    donors: fecCite,
    industries: cite("FollowTheMoney", "https://www.followthemoney.org/"),
    spending: usaCite,
  };

  const base: PoliticianFinance = {
    politician: toPolitician(m),
    cycle: m.cycle,
    totalRaised: m.totalRaised,
    totalSpent: m.totalSpent,
    cashOnHand: m.cashOnHand,
    individualTotal: m.individualTotal,
    pacTotal: m.pacTotal,
    topDonors: m.topDonors,
    topIndustries: m.topIndustries.map((i) => ({
      name: i.name,
      slug: i.slug,
      amount: i.amount,
    })),
    topEmployers: m.topEmployers,
    bySize: m.bySize,
    districtSpending: m.districtSpending.map((d) => ({
      name: d.name,
      amount: d.amount,
      kind: d.kind,
    })),
    citations,
    dataMode: "sample",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  if (liveEnabled() && fecId) {
    try {
      const totals = await getCandidateTotals(fecId, m.cycle);
      if (totals) {
        base.totalRaised = totals.receipts ?? base.totalRaised;
        base.totalSpent = totals.disbursements ?? base.totalSpent;
        base.cashOnHand =
          totals.last_cash_on_hand_end_period ?? base.cashOnHand;
        base.individualTotal =
          totals.individual_itemized_contributions ?? base.individualTotal;
        base.dataMode = "live";
        base.citations.totals = cite("FEC", fecCandidatePageUrl(fecId));
      }
    } catch {
      // Keep sample figures; dataMode stays "sample".
    }
  }

  return base;
}

export function donorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDonorFromFixtures(slug: string): Donor | null {
  const recipients: MoneyEntry[] = [];
  let name = "";
  let kind = "Donor";
  for (const m of SAMPLE_MEMBERS) {
    for (const d of m.topDonors) {
      if (d.slug === slug || donorSlug(d.name) === slug) {
        name = d.name;
        kind = d.kind;
        recipients.push({ name: m.name, slug: m.slug, amount: d.amount });
      }
    }
  }
  if (!name) return null;
  recipients.sort((a, b) => b.amount - a.amount);
  return {
    slug,
    name,
    kind,
    totalGiven: recipients.reduce((s, r) => s + r.amount, 0),
    recipients,
    citations: { contributions: cite("FEC", "https://www.fec.gov/data/") },
    dataMode: "sample",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

function getIndustryFromFixtures(slug: string): Industry | null {
  const topRecipients: MoneyEntry[] = [];
  const partySplit = { D: 0, R: 0, I: 0 };
  let name = "";
  for (const m of SAMPLE_MEMBERS) {
    for (const i of m.topIndustries) {
      if (i.slug === slug) {
        name = i.name;
        topRecipients.push({ name: m.name, slug: m.slug, amount: i.amount });
        partySplit[m.party] += i.amount;
      }
    }
  }
  if (!name) return null;
  topRecipients.sort((a, b) => b.amount - a.amount);
  return {
    slug,
    name,
    totalGiven: topRecipients.reduce((s, r) => s + r.amount, 0),
    topRecipients,
    partySplit,
    citations: {
      industry: cite(
        "FollowTheMoney",
        "https://www.followthemoney.org/",
        "Industry rollups computed from contributor employer/occupation data.",
      ),
    },
    dataMode: "sample",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}
