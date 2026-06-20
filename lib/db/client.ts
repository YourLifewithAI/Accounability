import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "@/lib/db/schema";

/**
 * Thin wrapper around the embedded SQLite store. This is the single place that
 * knows about the database engine — the rest of the app talks to the repository
 * (lib/db/repository.ts). To move to Postgres/Neon in production, reimplement
 * this module + the repository against `pg`/Prisma; nothing else changes.
 *
 * `node:sqlite` is synchronous, which keeps the read API simple (no async DB
 * calls in server components).
 */

export function dbPath(): string {
  return (
    process.env.ACCOUNTABLE_DB ||
    path.join(process.cwd(), "data", "accountable.db")
  );
}

let cached: DatabaseSync | null = null;

/** Open (creating the file + schema if needed) and memoize the connection. */
export function getDb(): DatabaseSync {
  if (cached) return cached;
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA_SQL);
  cached = db;
  return db;
}

/**
 * Whether a materialized store exists with at least one ingested member. When
 * false, the data facade falls back to in-memory sample fixtures so the app
 * still runs with zero setup (no ingestion required to boot).
 */
export function dbAvailable(): boolean {
  try {
    const file = dbPath();
    if (!existsSync(file)) return false;
    const db = getDb();
    const row = db
      .prepare("SELECT COUNT(*) AS c FROM politician")
      .get() as { c: number };
    return row.c > 0;
  } catch {
    return false;
  }
}

/** Close + reset (used by the ingestion script between runs / in tests). */
export function closeDb(): void {
  if (cached) {
    cached.close();
    cached = null;
  }
}
