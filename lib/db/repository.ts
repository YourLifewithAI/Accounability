import { getDb } from "@/lib/db/client";
import type {
  Donor,
  Industry,
  MoneyEntry,
  Party,
  Politician,
  PoliticianFinance,
} from "@/lib/data/types";
import type { DataMode, SourceCitation, SourceName } from "@/lib/provenance";

/**
 * Read side of the ingestion store. Returns the same domain types as the
 * in-memory facade so pages are agnostic to where the data came from.
 */

interface PoliticianRow {
  slug: string;
  bioguide_id: string;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  state: string;
  district: number | null;
  chamber: string;
  office: string;
}

function toPolitician(row: PoliticianRow, fecIds: string[]): Politician {
  return {
    slug: row.slug,
    bioguideId: row.bioguide_id,
    fecIds,
    name: row.name,
    firstName: row.first_name,
    lastName: row.last_name,
    party: row.party as Party,
    state: row.state,
    district: row.district ?? undefined,
    chamber: row.chamber as Politician["chamber"],
    office: row.office,
  };
}

function fecIdsFor(slug: string): string[] {
  const rows = getDb()
    .prepare("SELECT fec_id FROM politician_fec_id WHERE slug = ?")
    .all(slug) as { fec_id: string }[];
  return rows.map((r) => r.fec_id);
}

export function listPoliticians(): Politician[] {
  const rows = getDb()
    .prepare("SELECT * FROM politician ORDER BY last_name")
    .all() as PoliticianRow[];
  return rows.map((r) => toPolitician(r, fecIdsFor(r.slug)));
}

export function getPolitician(slug: string): Politician | null {
  const row = getDb()
    .prepare("SELECT * FROM politician WHERE slug = ?")
    .get(slug) as PoliticianRow | undefined;
  return row ? toPolitician(row, fecIdsFor(slug)) : null;
}

export function searchPoliticians(query: string): Politician[] {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const rows = getDb()
    .prepare(
      `SELECT * FROM politician
       WHERE name LIKE ? COLLATE NOCASE
          OR state LIKE ? COLLATE NOCASE
          OR office LIKE ? COLLATE NOCASE
       ORDER BY last_name`,
    )
    .all(like, like, like) as PoliticianRow[];
  return rows.map((r) => toPolitician(r, fecIdsFor(r.slug)));
}

function latestCycle(slug: string): number | null {
  const row = getDb()
    .prepare("SELECT MAX(cycle) AS cycle FROM finance_snapshot WHERE politician_slug = ?")
    .get(slug) as { cycle: number | null };
  return row.cycle ?? null;
}

function citationsFor(slug: string, cycle: number): Record<string, SourceCitation> {
  const rows = getDb()
    .prepare(
      "SELECT section, source, source_url, fetched_at, note FROM citation WHERE politician_slug = ? AND cycle = ?",
    )
    .all(slug, cycle) as {
    section: string;
    source: string;
    source_url: string;
    fetched_at: string;
    note: string | null;
  }[];
  const out: Record<string, SourceCitation> = {};
  for (const r of rows) {
    out[r.section] = {
      source: r.source as SourceName,
      sourceUrl: r.source_url,
      fetchedAt: r.fetched_at,
      note: r.note ?? undefined,
    };
  }
  return out;
}

export function getPoliticianFinance(
  slug: string,
  cycle?: number,
): PoliticianFinance | null {
  const politician = getPolitician(slug);
  if (!politician) return null;
  const c = cycle ?? latestCycle(slug);
  if (c == null) return null;

  const db = getDb();
  const snap = db
    .prepare(
      "SELECT * FROM finance_snapshot WHERE politician_slug = ? AND cycle = ?",
    )
    .get(slug, c) as
    | {
        total_raised: number;
        total_spent: number;
        cash_on_hand: number;
        individual_total: number;
        pac_total: number;
        size_small: number;
        size_medium: number;
        size_large: number;
        data_mode: string;
        last_updated: string;
      }
    | undefined;
  if (!snap) return null;

  const donors = db
    .prepare(
      "SELECT name, entity_slug, amount, kind FROM contribution WHERE politician_slug = ? AND cycle = ? AND category = 'donor' ORDER BY rank",
    )
    .all(slug, c) as {
    name: string;
    entity_slug: string | null;
    amount: number;
    kind: string | null;
  }[];
  const employers = db
    .prepare(
      "SELECT name, amount FROM contribution WHERE politician_slug = ? AND cycle = ? AND category = 'employer' ORDER BY rank",
    )
    .all(slug, c) as { name: string; amount: number }[];
  const industries = db
    .prepare(
      "SELECT industry_name AS name, industry_slug AS slug, amount FROM industry_contribution WHERE politician_slug = ? AND cycle = ? ORDER BY rank",
    )
    .all(slug, c) as { name: string; slug: string; amount: number }[];
  const awards = db
    .prepare(
      "SELECT name, amount, kind FROM award WHERE politician_slug = ? AND cycle = ? ORDER BY rank",
    )
    .all(slug, c) as { name: string; amount: number; kind: string }[];

  return {
    politician,
    cycle: c,
    totalRaised: snap.total_raised,
    totalSpent: snap.total_spent,
    cashOnHand: snap.cash_on_hand,
    individualTotal: snap.individual_total,
    pacTotal: snap.pac_total,
    topDonors: donors.map((d) => ({
      name: d.name,
      slug: d.entity_slug ?? undefined,
      amount: d.amount,
      kind: d.kind ?? undefined,
    })),
    topIndustries: industries,
    topEmployers: employers,
    bySize: { small: snap.size_small, medium: snap.size_medium, large: snap.size_large },
    districtSpending: awards.map((a) => ({ name: a.name, amount: a.amount, kind: a.kind })),
    citations: citationsFor(slug, c),
    dataMode: snap.data_mode as DataMode,
    lastUpdated: snap.last_updated,
  };
}

export function getDonor(slug: string): Donor | null {
  const db = getDb();
  const meta = db
    .prepare(
      "SELECT name, kind FROM contribution WHERE entity_slug = ? AND category = 'donor' ORDER BY amount DESC LIMIT 1",
    )
    .get(slug) as { name: string; kind: string | null } | undefined;
  if (!meta) return null;

  const recipients = db
    .prepare(
      `SELECT p.name AS name, p.slug AS slug, SUM(c.amount) AS amount
       FROM contribution c JOIN politician p ON p.slug = c.politician_slug
       WHERE c.entity_slug = ? AND c.category = 'donor'
       GROUP BY p.slug, p.name ORDER BY amount DESC`,
    )
    .all(slug) as MoneyEntry[];

  const mode = db
    .prepare(
      "SELECT data_mode FROM finance_snapshot ORDER BY cycle DESC LIMIT 1",
    )
    .get() as { data_mode: string } | undefined;

  return {
    slug,
    name: meta.name,
    kind: meta.kind ?? "Donor",
    totalGiven: recipients.reduce((s, r) => s + r.amount, 0),
    recipients,
    citations: {
      contributions: {
        source: "FEC",
        sourceUrl: "https://www.fec.gov/data/",
        fetchedAt: new Date().toISOString(),
      },
    },
    dataMode: (mode?.data_mode as DataMode) ?? "sample",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

export function getIndustry(slug: string): Industry | null {
  const db = getDb();
  const meta = db
    .prepare(
      "SELECT industry_name AS name FROM industry_contribution WHERE industry_slug = ? LIMIT 1",
    )
    .get(slug) as { name: string } | undefined;
  if (!meta) return null;

  const topRecipients = db
    .prepare(
      `SELECT p.name AS name, p.slug AS slug, SUM(ic.amount) AS amount
       FROM industry_contribution ic JOIN politician p ON p.slug = ic.politician_slug
       WHERE ic.industry_slug = ?
       GROUP BY p.slug, p.name ORDER BY amount DESC`,
    )
    .all(slug) as MoneyEntry[];

  const splitRows = db
    .prepare(
      `SELECT p.party AS party, SUM(ic.amount) AS amount
       FROM industry_contribution ic JOIN politician p ON p.slug = ic.politician_slug
       WHERE ic.industry_slug = ? GROUP BY p.party`,
    )
    .all(slug) as { party: string; amount: number }[];
  const partySplit = { D: 0, R: 0, I: 0 };
  for (const r of splitRows) {
    if (r.party === "D" || r.party === "R" || r.party === "I") {
      partySplit[r.party] = r.amount;
    }
  }

  const mode = db
    .prepare("SELECT data_mode FROM finance_snapshot ORDER BY cycle DESC LIMIT 1")
    .get() as { data_mode: string } | undefined;

  return {
    slug,
    name: meta.name,
    totalGiven: topRecipients.reduce((s, r) => s + r.amount, 0),
    topRecipients,
    partySplit,
    citations: {
      industry: {
        source: "FollowTheMoney",
        sourceUrl: "https://www.followthemoney.org/",
        fetchedAt: new Date().toISOString(),
        note: "Industry rollups computed from contributor employer/occupation data.",
      },
    },
    dataMode: (mode?.data_mode as DataMode) ?? "sample",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}
