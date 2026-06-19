import { ImageResponse } from "next/og";
import { getPoliticianFinance } from "@/lib/data";
import { formatCompactUsd } from "@/lib/format";

export const alt = "Money map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic social-share card per member. When someone pastes a profile link into
 * iMessage / Slack / X, this is what unfurls — the headline money fact, branded.
 */
export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const finance = await getPoliticianFinance(params.slug);
  const name = finance?.politician.name ?? "Member of Congress";
  const office = finance?.politician.office ?? "";
  const raised = finance ? formatCompactUsd(finance.totalRaised) : "—";
  const topIndustry = finance?.topIndustries[0]?.name ?? "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#0d1321 0%,#1d2433 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, opacity: 0.8 }}>
          ⚖️ &nbsp;Accountable · Money &amp; Power
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
          <div style={{ fontSize: 34, opacity: 0.7 }}>{office}</div>
        </div>
        <div style={{ display: "flex", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, opacity: 0.6 }}>Total raised</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#60a5fa" }}>{raised}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, opacity: 0.6 }}>Top industry</div>
            <div style={{ fontSize: 56, fontWeight: 800 }}>{topIndustry}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
