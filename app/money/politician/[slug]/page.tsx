import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarList } from "@/components/BarList";
import { DataModeBanner } from "@/components/DataModeBanner";
import { ShareButton } from "@/components/ShareButton";
import { SourceBadge } from "@/components/SourceBadge";
import { getPolitician, getPoliticianFinance, listPoliticians } from "@/lib/data";
import { formatCompactUsd, formatDate, formatPct } from "@/lib/format";
import type { SourceCitation } from "@/lib/provenance";

export function generateStaticParams() {
  return listPoliticians().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPolitician(slug);
  if (!p) return { title: "Member not found" };
  return {
    title: `${p.name} — money map`,
    description: `Who funds ${p.name} (${p.office}) and where federal money flows. Top donors, industries, and spending — with a source on every figure.`,
  };
}

function Stat({
  label,
  value,
  citation,
}: {
  label: string;
  value: string;
  citation?: SourceCitation;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-ink">
        {value}
      </div>
      {citation && (
        <div className="mt-2">
          <SourceBadge citation={citation} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  citation,
  note,
  children,
}: {
  title: string;
  citation: SourceCitation;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold text-ink">{title}</h2>
        <SourceBadge citation={citation} />
      </div>
      {note && <p className="mb-3 text-xs text-slate-500">{note}</p>}
      {children}
    </section>
  );
}

export default async function PoliticianPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const finance = await getPoliticianFinance(slug);
  if (!finance) notFound();

  const { politician: p } = finance;
  const partyLabel = p.party === "D" ? "Democrat" : p.party === "R" ? "Republican" : "Independent";
  const size = finance.bySize;
  const sizeTotal = size.small + size.medium + size.large;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/money" className="text-sm text-slate-500 hover:text-accent">
            ← All members
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {p.name}
          </h1>
          <p className="text-slate-600">
            {p.office} · {partyLabel} · {finance.cycle} cycle
          </p>
        </div>
        <ShareButton
          title={`${p.name} — money map`}
          text={`See who funds ${p.name} →`}
        />
      </div>

      <DataModeBanner mode={finance.dataMode} />
      <p className="text-sm text-slate-500">
        Data as of {formatDate(finance.lastUpdated)}.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total raised"
          value={formatCompactUsd(finance.totalRaised)}
          citation={finance.citations.totals}
        />
        <Stat label="Total spent" value={formatCompactUsd(finance.totalSpent)} />
        <Stat label="Cash on hand" value={formatCompactUsd(finance.cashOnHand)} />
        <Stat
          label="PAC share"
          value={formatPct(finance.pacTotal, finance.totalRaised)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Top donors" citation={finance.citations.donors}>
          <BarList entries={finance.topDonors} linkBase="/money/donor" />
        </Section>

        <Section title="Top industries" citation={finance.citations.industries}>
          <BarList entries={finance.topIndustries} linkBase="/money/industry" />
        </Section>

        <Section title="Top employers of donors" citation={finance.citations.donors}>
          <BarList entries={finance.topEmployers} />
        </Section>

        <Section
          title="Contributions by size"
          citation={finance.citations.donors}
          note="Small-dollar (<$200), mid-size, and large/max-out contributions."
        >
          <div className="space-y-3">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-emerald-500"
                style={{ width: `${formatPct(size.small, sizeTotal)}` }}
                title="Small-dollar"
              />
              <div
                className="bg-accent"
                style={{ width: `${formatPct(size.medium, sizeTotal)}` }}
                title="Mid-size"
              />
              <div
                className="bg-indigo-600"
                style={{ width: `${formatPct(size.large, sizeTotal)}` }}
                title="Large"
              />
            </div>
            <ul className="grid grid-cols-3 gap-2 text-center text-sm">
              <li>
                <div className="font-bold text-ink">{formatCompactUsd(size.small)}</div>
                <div className="text-xs text-slate-500">Small-dollar</div>
              </li>
              <li>
                <div className="font-bold text-ink">{formatCompactUsd(size.medium)}</div>
                <div className="text-xs text-slate-500">Mid-size</div>
              </li>
              <li>
                <div className="font-bold text-ink">{formatCompactUsd(size.large)}</div>
                <div className="text-xs text-slate-500">Large</div>
              </li>
            </ul>
          </div>
        </Section>
      </div>

      <Section
        title={`Federal money flowing to ${p.state}`}
        citation={finance.citations.spending}
        note="Contextual flow of federal contracts and grants to the member's state — this is NOT a direct or causal link to their campaign donations."
      >
        <BarList entries={finance.districtSpending} />
      </Section>
    </div>
  );
}
