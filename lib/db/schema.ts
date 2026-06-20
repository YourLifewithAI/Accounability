/**
 * Schema for the materialized ingestion store.
 *
 * This is plain SQL run against an embedded SQLite database (Node's built-in
 * `node:sqlite`). It is deliberately written with portable types (TEXT / INTEGER
 * / REAL) and no SQLite-only features so the same shape maps cleanly onto
 * Postgres/Neon in production — see lib/db/README for the swap point.
 *
 * Provenance is modeled as a first-class table: every section of a money map
 * (totals, donors, industries, spending) carries its own source citation.
 */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS politician (
  slug        TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL,
  name        TEXT NOT NULL,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  party       TEXT NOT NULL,
  state       TEXT NOT NULL,
  district    INTEGER,
  chamber     TEXT NOT NULL,
  office      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS politician_fec_id (
  slug   TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  fec_id TEXT NOT NULL,
  PRIMARY KEY (slug, fec_id)
);

CREATE TABLE IF NOT EXISTS finance_snapshot (
  politician_slug  TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  cycle            INTEGER NOT NULL,
  total_raised     REAL NOT NULL,
  total_spent      REAL NOT NULL,
  cash_on_hand     REAL NOT NULL,
  individual_total REAL NOT NULL,
  pac_total        REAL NOT NULL,
  size_small       REAL NOT NULL,
  size_medium      REAL NOT NULL,
  size_large       REAL NOT NULL,
  data_mode        TEXT NOT NULL,
  last_updated     TEXT NOT NULL,
  PRIMARY KEY (politician_slug, cycle)
);

-- Top contributors. category distinguishes a donor entity (linkable) from an
-- employer rollup (FEC's "by employer" aggregate).
CREATE TABLE IF NOT EXISTS contribution (
  id              INTEGER PRIMARY KEY,
  politician_slug TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  cycle           INTEGER NOT NULL,
  category        TEXT NOT NULL,            -- 'donor' | 'employer'
  name            TEXT NOT NULL,
  entity_slug     TEXT,                     -- donor page slug
  amount          REAL NOT NULL,
  kind            TEXT,                     -- 'Individual' | 'PAC' | ...
  rank            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contribution_entity ON contribution(entity_slug);
CREATE INDEX IF NOT EXISTS idx_contribution_pol ON contribution(politician_slug, cycle);

CREATE TABLE IF NOT EXISTS industry_contribution (
  id              INTEGER PRIMARY KEY,
  politician_slug TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  cycle           INTEGER NOT NULL,
  industry_slug   TEXT NOT NULL,
  industry_name   TEXT NOT NULL,
  amount          REAL NOT NULL,
  rank            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_industry_slug ON industry_contribution(industry_slug);
CREATE INDEX IF NOT EXISTS idx_industry_pol ON industry_contribution(politician_slug, cycle);

-- Federal money flowing to the member's state/district (USAspending) — contextual.
CREATE TABLE IF NOT EXISTS award (
  id              INTEGER PRIMARY KEY,
  politician_slug TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  cycle           INTEGER NOT NULL,
  name            TEXT NOT NULL,
  amount          REAL NOT NULL,
  kind            TEXT NOT NULL,
  rank            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_award_pol ON award(politician_slug, cycle);

-- Per-section provenance for a member's money map.
CREATE TABLE IF NOT EXISTS citation (
  politician_slug TEXT NOT NULL REFERENCES politician(slug) ON DELETE CASCADE,
  cycle           INTEGER NOT NULL,
  section         TEXT NOT NULL,            -- 'totals' | 'donors' | 'industries' | 'spending'
  source          TEXT NOT NULL,
  source_url      TEXT NOT NULL,
  fetched_at      TEXT NOT NULL,
  note            TEXT,
  PRIMARY KEY (politician_slug, cycle, section)
);

-- Audit log of ingestion runs.
CREATE TABLE IF NOT EXISTS ingest_run (
  id            INTEGER PRIMARY KEY,
  started_at    TEXT NOT NULL,
  finished_at   TEXT,
  data_mode     TEXT NOT NULL,
  members       INTEGER NOT NULL DEFAULT 0,
  ok            INTEGER NOT NULL DEFAULT 0,
  note          TEXT
);
`;
