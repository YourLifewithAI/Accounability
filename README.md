# Accountable

A civic **accountability platform** — tools that make power legible and are easy to
share with a friend via a link. US federal scope to start.

It's a shared shell that hosts three modules, built incrementally:

| Module | Status | What it does |
| --- | --- | --- |
| 💰 **Money & Power** | **Live (flagship)** | Look up a member of Congress → see who funds them (donors, PACs, industries) and where federal money flows. |
| 📍 **Hyperlocal Hub** | Coming soon | Geofenced neighborhood feed for proposed developments, local meetings, and organizing. |
| 🔎 **Live Fact-Checker** | Coming soon | Real-time claim detection + verification during debates and speeches. |

Modules register in [`lib/module-registry.ts`](lib/module-registry.ts) — the platform
extension point. Adding modules 2 and 3 means fleshing out their route folder and flipping
`enabled` to `true`; no shell changes required.

## Tech stack

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS** — server-rendered for SEO and rich
  social-share unfurls (dynamic Open Graph cards per profile via `next/og`).
- Deployable to **Vercel**. A Postgres + nightly-ingestion layer is the planned next step
  (see `lib/sources`) once we need cross-entity joins and full coverage.

## Data sources (all public)

| Source | Used for | Auth |
| --- | --- | --- |
| [FEC / OpenFEC](https://api.open.fec.gov/developers/) | Campaign finance: donors, PACs, totals | Free key (api.data.gov); 1,000 req/hr |
| [USAspending.gov](https://api.usaspending.gov/) | Federal contracts/grants by state | None |
| [FollowTheMoney](https://www.followthemoney.org/) | Aggregated industry influence | Free account |
| [congress-legislators](https://github.com/unitedstates/congress-legislators) | Identity crosswalk (FEC ↔ bioguide ↔ state) | None |

> The OpenSecrets API was discontinued in April 2025; industry rollups are computed from FEC
> employer/occupation data and supplemented by FollowTheMoney.

Every figure carries a **source badge** linking to the primary record and a "data as of"
date. See [`/methodology`](app/methodology/page.tsx).

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — defaults to sample data
npm run dev                  # http://localhost:3000
```

### Live vs. sample data

By default the app renders **clearly-labeled sample figures** so it runs anywhere — the UI
flags every such page as "sample" and never presents placeholder numbers as verified fact
(identity data is real). To load **live** data:

1. Set `ACCOUNTABILITY_LIVE=1` and add `FEC_API_KEY` (and optionally `FTM_API_KEY`) in `.env.local`.
2. Ensure network egress to `api.open.fec.gov`, `api.usaspending.gov`, and
   `unitedstates.github.io` (these are blocked in some sandboxes by an egress allowlist).

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build of all routes
npm run dev         # then open a money map, e.g. /money/politician/elizabeth-warren
```

Check the OG card renders at `/money/politician/elizabeth-warren/opengraph-image`.
