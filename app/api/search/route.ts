import { NextResponse } from "next/server";
import { searchPoliticians } from "@/lib/data";

/** Lightweight JSON search endpoint for client-side autocomplete (future use). */
export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = searchPoliticians(q).map((p) => ({
    name: p.name,
    office: p.office,
    slug: p.slug,
    party: p.party,
  }));
  return NextResponse.json({ query: q, results });
}
