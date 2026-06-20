import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/Nav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Accountable — civic accountability, easy to share",
    template: "%s · Accountable",
  },
  description:
    "Make power legible. See who funds your representatives and where federal money flows — with a source on every figure.",
  openGraph: {
    title: "Accountable — civic accountability, easy to share",
    description:
      "See who funds your representatives and where federal money flows — with a source on every figure.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Accountable — built on public data. Every figure links to its
                primary source.
              </p>
              <Link href="/methodology" className="font-medium hover:text-accent">
                Methodology &amp; sources
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
