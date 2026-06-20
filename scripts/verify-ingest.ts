/**
 * Round-trip check for the ingestion layer: ingest sample data into a throwaway
 * DB, then assert the repository reads back consistent, provenance-stamped
 * results. Exits non-zero on any failure. Run with `npm run verify:ingest`.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Point the store at a throwaway file BEFORE the client opens it (getDb is lazy).
process.env.ACCOUNTABLE_DB = path.join(
  mkdtempSync(path.join(tmpdir(), "acc-verify-")),
  "test.db",
);

import { getDb, closeDb } from "@/lib/db/client";
import { writeMember } from "@/lib/db/ingest";
import { sampleProvider } from "@/lib/db/providers";
import * as repo from "@/lib/db/repository";

let failures = 0;
function check(label: string, cond: boolean) {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}`);
    failures += 1;
  }
}

function main() {
  const db = getDb();
  const members = sampleProvider();
  for (const m of members) writeMember(db, m);

  console.log("politicians");
  const all = repo.listPoliticians();
  check(`ingested ${members.length} members`, all.length === members.length);
  check("sorted by last name", all[0].lastName <= all[all.length - 1].lastName);

  console.log("search");
  check(
    "search 'warren' finds Warren",
    repo.searchPoliticians("warren").some((p) => p.name === "Elizabeth Warren"),
  );
  check("search by state 'TX'", repo.searchPoliticians("TX").length > 0);
  check("empty query returns nothing", repo.searchPoliticians("").length === 0);

  console.log("money map");
  const fin = repo.getPoliticianFinance("elizabeth-warren");
  check("Warren finance present", !!fin);
  check("totals match fixture", fin?.totalRaised === 24_300_000);
  check("has top donors", (fin?.topDonors.length ?? 0) > 0);
  check("has industries", (fin?.topIndustries.length ?? 0) > 0);
  check("has district spending", (fin?.districtSpending.length ?? 0) > 0);
  check(
    "every section cited",
    ["totals", "donors", "industries", "spending"].every((s) => !!fin?.citations[s]),
  );
  check(
    "citation links to FEC primary source",
    fin?.citations.totals.sourceUrl.includes("fec.gov") ?? false,
  );
  check("data mode is sample", fin?.dataMode === "sample");

  console.log("cross-entity aggregates");
  const industry = repo.getIndustry("securities-investment");
  check("industry aggregates >1 recipient", (industry?.topRecipients.length ?? 0) >= 2);
  check(
    "party split sums to total",
    !!industry &&
      Math.abs(
        industry.partySplit.D + industry.partySplit.R + industry.partySplit.I - industry.totalGiven,
      ) < 1,
  );
  const donor = repo.getDonor("alphabet-inc");
  check("donor 'Alphabet Inc' aggregates recipients", (donor?.recipients.length ?? 0) >= 2);

  console.log("idempotency");
  for (const m of members) writeMember(db, m);
  check("re-ingest keeps member count stable", repo.listPoliticians().length === members.length);

  closeDb();

  if (failures > 0) {
    console.error(`\nFAILED: ${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll ingestion checks passed.");
}

main();
