/**
 * Ingestion job. Materializes the money-map data into the SQLite store the app
 * reads from. Run with `npm run ingest` (offline sample data) or, with live
 * access configured, `ACCOUNTABILITY_LIVE=1 npm run ingest`.
 *
 * In production this is what a nightly Vercel Cron would invoke (pointed at
 * Postgres instead of SQLite). It is idempotent: re-running replaces each
 * member's rows for the cycle.
 *
 * Env:
 *   ACCOUNTABILITY_LIVE=1   pull from live FEC/USAspending APIs (default: sample)
 *   INGEST_CYCLE=2026       election cycle to ingest
 *   INGEST_LIMIT=50         cap members in live mode (FEC rate limits)
 *   ACCOUNTABLE_DB=path     override the SQLite file location
 */
import { getDb, closeDb, dbPath } from "@/lib/db/client";
import { finishRun, startRun, writeMember } from "@/lib/db/ingest";
import { liveProvider, sampleProvider } from "@/lib/db/providers";
import { SAMPLE_CYCLE } from "@/lib/fixtures/members";
import { liveEnabled } from "@/lib/sources/config";

async function main() {
  const live = liveEnabled();
  const cycle = Number(process.env.INGEST_CYCLE) || (live ? 2026 : SAMPLE_CYCLE);
  const limit = Number(process.env.INGEST_LIMIT) || 0;
  const mode = live ? "live" : "sample";

  console.log(`[ingest] mode=${mode} cycle=${cycle} db=${dbPath()}`);
  const db = getDb();
  const runId = startRun(db, mode);

  try {
    const members = live ? await liveProvider(cycle, limit) : sampleProvider();
    let n = 0;
    for (const m of members) {
      writeMember(db, m);
      n += 1;
      console.log(`[ingest]  ✓ ${m.politician.name} (${m.politician.office})`);
    }
    finishRun(db, runId, n, true);
    console.log(`[ingest] done — wrote ${n} members in ${mode} mode.`);
    if (live && n === 0) {
      console.warn(
        "[ingest] WARNING: live mode wrote 0 members. Check FEC_API_KEY and network egress.",
      );
    }
  } catch (err) {
    finishRun(db, runId, 0, false, String(err));
    console.error("[ingest] FAILED:", err);
    process.exitCode = 1;
  } finally {
    closeDb();
  }
}

main();
