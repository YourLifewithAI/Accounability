import type { DatabaseSync } from "node:sqlite";
import type { DataMode, SourceCitation } from "@/lib/provenance";
import type { Chamber, Party } from "@/lib/data/types";

/**
 * Normalized input the ingestion writer consumes. Both the sample provider and
 * the live (FEC/USAspending) provider produce this shape, so the storage logic
 * is identical regardless of where the figures came from.
 */
export interface IngestMember {
  politician: {
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
  };
  cycle: number;
  totals: {
    totalRaised: number;
    totalSpent: number;
    cashOnHand: number;
    individualTotal: number;
    pacTotal: number;
  };
  bySize: { small: number; medium: number; large: number };
  donors: { name: string; slug: string; amount: number; kind?: string }[];
  employers: { name: string; amount: number }[];
  industries: { name: string; slug: string; amount: number }[];
  awards: { name: string; amount: number; kind: string }[];
  dataMode: DataMode;
  lastUpdated: string;
  citations: {
    totals: SourceCitation;
    donors: SourceCitation;
    industries: SourceCitation;
    spending: SourceCitation;
  };
}

/** Insert/replace one member's full money map for a cycle, transactionally. */
export function writeMember(db: DatabaseSync, m: IngestMember): void {
  const { politician: p, cycle } = m;
  const tx = db.prepare("BEGIN");
  tx.run();
  try {
    db.prepare(
      `INSERT INTO politician (slug, bioguide_id, name, first_name, last_name, party, state, district, chamber, office)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         bioguide_id=excluded.bioguide_id, name=excluded.name, first_name=excluded.first_name,
         last_name=excluded.last_name, party=excluded.party, state=excluded.state,
         district=excluded.district, chamber=excluded.chamber, office=excluded.office`,
    ).run(
      p.slug,
      p.bioguideId,
      p.name,
      p.firstName,
      p.lastName,
      p.party,
      p.state,
      p.district ?? null,
      p.chamber,
      p.office,
    );

    // Replace child rows for this member+cycle so re-ingestion is idempotent.
    db.prepare("DELETE FROM politician_fec_id WHERE slug = ?").run(p.slug);
    const insFec = db.prepare(
      "INSERT INTO politician_fec_id (slug, fec_id) VALUES (?, ?)",
    );
    for (const id of p.fecIds) insFec.run(p.slug, id);

    db.prepare(
      `INSERT INTO finance_snapshot
         (politician_slug, cycle, total_raised, total_spent, cash_on_hand, individual_total, pac_total, size_small, size_medium, size_large, data_mode, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(politician_slug, cycle) DO UPDATE SET
         total_raised=excluded.total_raised, total_spent=excluded.total_spent, cash_on_hand=excluded.cash_on_hand,
         individual_total=excluded.individual_total, pac_total=excluded.pac_total,
         size_small=excluded.size_small, size_medium=excluded.size_medium, size_large=excluded.size_large,
         data_mode=excluded.data_mode, last_updated=excluded.last_updated`,
    ).run(
      p.slug,
      cycle,
      m.totals.totalRaised,
      m.totals.totalSpent,
      m.totals.cashOnHand,
      m.totals.individualTotal,
      m.totals.pacTotal,
      m.bySize.small,
      m.bySize.medium,
      m.bySize.large,
      m.dataMode,
      m.lastUpdated,
    );

    for (const table of ["contribution", "industry_contribution", "award"]) {
      db.prepare(
        `DELETE FROM ${table} WHERE politician_slug = ? AND cycle = ?`,
      ).run(p.slug, cycle);
    }

    const insContrib = db.prepare(
      `INSERT INTO contribution (politician_slug, cycle, category, name, entity_slug, amount, kind, rank)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    m.donors.forEach((d, i) =>
      insContrib.run(p.slug, cycle, "donor", d.name, d.slug, d.amount, d.kind ?? null, i),
    );
    m.employers.forEach((e, i) =>
      insContrib.run(p.slug, cycle, "employer", e.name, null, e.amount, null, i),
    );

    const insIndustry = db.prepare(
      `INSERT INTO industry_contribution (politician_slug, cycle, industry_slug, industry_name, amount, rank)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    m.industries.forEach((ind, i) =>
      insIndustry.run(p.slug, cycle, ind.slug, ind.name, ind.amount, i),
    );

    const insAward = db.prepare(
      `INSERT INTO award (politician_slug, cycle, name, amount, kind, rank)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    m.awards.forEach((a, i) =>
      insAward.run(p.slug, cycle, a.name, a.amount, a.kind, i),
    );

    const insCite = db.prepare(
      `INSERT INTO citation (politician_slug, cycle, section, source, source_url, fetched_at, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(politician_slug, cycle, section) DO UPDATE SET
         source=excluded.source, source_url=excluded.source_url, fetched_at=excluded.fetched_at, note=excluded.note`,
    );
    for (const [section, c] of Object.entries(m.citations)) {
      insCite.run(p.slug, cycle, section, c.source, c.sourceUrl, c.fetchedAt, c.note ?? null);
    }

    db.prepare("COMMIT").run();
  } catch (err) {
    db.prepare("ROLLBACK").run();
    throw err;
  }
}

/** Record the start of an ingestion run; returns its id. */
export function startRun(db: DatabaseSync, dataMode: DataMode): number {
  const res = db
    .prepare("INSERT INTO ingest_run (started_at, data_mode) VALUES (?, ?)")
    .run(new Date().toISOString(), dataMode);
  return Number(res.lastInsertRowid);
}

export function finishRun(
  db: DatabaseSync,
  id: number,
  members: number,
  ok: boolean,
  note?: string,
): void {
  db.prepare(
    "UPDATE ingest_run SET finished_at = ?, members = ?, ok = ?, note = ? WHERE id = ?",
  ).run(new Date().toISOString(), members, ok ? 1 : 0, note ?? null, id);
}
