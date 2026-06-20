import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarList } from "@/components/BarList";
import { DataModeBanner } from "@/components/DataModeBanner";
import { ShareButton } from "@/components/ShareButton";
import { SourceBadge } from "@/components/SourceBadge";
import { getDonor } from "@/lib/data";
import { formatCompactUsd, formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const donor = getDonor(slug);
  return {
    title: donor ? `${donor.name} — who they fund` : "Donor not found",
    description: donor
      ? `Where contributions associated with ${donor.name} go.`
      : undefined,
  };
}

export default async function DonorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const donor = getDonor(slug);
  if (!donor) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/money" className="text-sm text-slate-500 hover:text-accent">
            ← Money &amp; Power
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {donor.name}
          </h1>
          <p className="text-slate-600">
            {donor.kind} · {formatCompactUsd(donor.totalGiven)} across tracked
            members
          </p>
        </div>
        <ShareButton title={donor.name} text={`See who ${donor.name} funds →`} />
      </div>

      <DataModeBanner mode={donor.dataMode} />
      <p className="text-sm text-slate-500">Data as of {formatDate(donor.lastUpdated)}.</p>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-ink">Recipients</h2>
          <SourceBadge citation={donor.citations.contributions} />
        </div>
        <BarList entries={donor.recipients} linkBase="/money/politician" />
      </section>
    </div>
  );
}
