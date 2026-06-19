import type { Metadata } from "next";
import Link from "next/link";
import { getModule } from "@/lib/module-registry";

export const metadata: Metadata = {
  title: "Hyperlocal Hub — coming soon",
  description:
    "A geofenced neighborhood feed for proposed developments, local meetings, and organizing.",
};

export default function LocalPage() {
  const mod = getModule("local")!;
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-10 text-center">
      <div className="text-5xl">{mod.icon}</div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        {mod.title}
      </h1>
      <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Coming soon
      </span>
      <p className="text-slate-600">{mod.tagline}</p>
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-left text-sm text-slate-600">
        <p className="font-semibold text-ink">Planned for this module</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Geofenced neighborhood feed (browser geolocation + PostGIS).</li>
          <li>Proposed-development and public-meeting records for a pilot area.</li>
          <li>Lightweight tools to organize and respond as neighbors.</li>
        </ul>
      </div>
      <Link
        href="/money"
        className="inline-block text-sm font-semibold text-accent hover:underline"
      >
        Explore the live Money &amp; Power module →
      </Link>
    </div>
  );
}
