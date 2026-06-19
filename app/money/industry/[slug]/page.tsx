import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarList } from "@/components/BarList";
import { DataModeBanner } from "@/components/DataModeBanner";
import { ShareButton } from "@/components/ShareButton";
import { SourceBadge } from "@/components/SourceBadge";
import { getIndustry } from "@/lib/data";
import { formatCompactUsd, formatDate, formatPct } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  return {
    title: industry ? `${industry.name} — political giving` : "Industry not found",
    description: industry
      ? `How the ${industry.name} industry's contributions split across members and parties.`
      : undefined,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const { partySplit } = industry;
  const total = partySplit.D + partySplit.R + partySplit.I || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/money" className="text-sm text-slate-500 hover:text-accent">
            ← Money &amp; Power
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {industry.name}
          </h1>
          <p className="text-slate-600">
            {formatCompactUsd(industry.totalGiven)} to tracked members
          </p>
        </div>
        <ShareButton
          title={industry.name}
          text={`How the ${industry.name} industry gives →`}
        />
      </div>

      <DataModeBanner mode={industry.dataMode} />
      <p className="text-sm text-slate-500">
        Data as of {formatDate(industry.lastUpdated)}.
      </p>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink">Party split</h2>
          <SourceBadge citation={industry.citations.industry} />
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="bg-blue-600" style={{ width: formatPct(partySplit.D, total) }} />
          <div className="bg-red-600" style={{ width: formatPct(partySplit.R, total) }} />
          <div className="bg-purple-600" style={{ width: formatPct(partySplit.I, total) }} />
        </div>
        <div className="mt-2 flex gap-4 text-sm text-slate-600">
          <span>D {formatPct(partySplit.D, total)}</span>
          <span>R {formatPct(partySplit.R, total)}</span>
          <span>I {formatPct(partySplit.I, total)}</span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink">Top recipients</h2>
          <SourceBadge citation={industry.citations.industry} />
        </div>
        <BarList entries={industry.topRecipients} linkBase="/money/politician" />
      </section>
    </div>
  );
}
