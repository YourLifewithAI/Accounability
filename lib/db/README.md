# Ingestion store (`lib/db`)

The money module reads from a **materialized store** rather than calling the FEC /
USAspending APIs on every page view. This is required, not an optimization: the
FEC API allows only **1,000 requests/hour**, so public pages must be served from
ingested data.

## How it works

```
sources (FEC / USAspending / FollowTheMoney / congress-legislators)
        │   lib/db/providers.ts  (sampleProvider | liveProvider)
        ▼
   scripts/ingest.ts ──writeMember──▶  SQLite store (lib/db/ingest.ts + schema.ts)
                                              │
                                   lib/db/repository.ts (reads)
                                              │
                                   lib/data/index.ts (facade) ──▶ pages
```

- **`schema.ts`** — table definitions (portable types only).
- **`client.ts`** — opens the embedded SQLite database (`node:sqlite`), the one
  place that knows the engine. `dbAvailable()` decides whether the facade reads
  the DB or falls back to in-memory fixtures (so the app boots with no setup).
- **`ingest.ts`** — transactional, idempotent upserts (`writeMember`) + run audit.
- **`providers.ts`** — turn each source into the normalized `IngestMember` shape.
- **`repository.ts`** — typed reads returning the app's domain types, including the
  cross-entity aggregates (a donor's recipients, an industry's party split).

Run it:

```bash
npm run ingest          # offline sample data → data/accountable.db
npm run verify:ingest   # round-trip assertions against a throwaway DB
ACCOUNTABILITY_LIVE=1 FEC_API_KEY=... INGEST_LIMIT=50 npm run ingest   # live
```

## Why SQLite here, Postgres in production

SQLite (via Node's built-in `node:sqlite`) is the local/dev/CI ingestion target:
zero external services, fully verifiable. On Vercel's serverless runtime the
deployed filesystem is read-only, so a nightly cron can't write a SQLite file the
functions read — production should use **Postgres (Neon)**.

The swap is contained to **two files**: `client.ts` and `repository.ts`. The
schema (`schema.ts`) uses only portable column types, and `providers.ts`,
`ingest.ts`'s `IngestMember` contract, and the entire app above the repository
stay unchanged. With Postgres you would also make the politician pages use ISR
(`export const revalidate = ...`) so a nightly cron's fresh data surfaces without
a rebuild.
