/**
 * Approximate employer → industry mapping used to roll up live FEC contributor
 * data into industry buckets. This is the function the OpenSecrets API used to
 * provide; since that API was discontinued (April 2025), we compute a coarse
 * rollup here and clearly label it approximate. For production fidelity this
 * would be replaced/augmented by FollowTheMoney or a licensed CRP industry map.
 */

interface IndustryRule {
  slug: string;
  name: string;
  keywords: string[];
}

const RULES: IndustryRule[] = [
  { slug: "education", name: "Education", keywords: ["universit", "college", "school", "academ"] },
  { slug: "securities-investment", name: "Securities & Investment", keywords: ["goldman", "morgan", "capital", "partners", "investment", "blackrock", "citadel", "hedge"] },
  { slug: "oil-gas", name: "Oil & Gas", keywords: ["exxon", "chevron", "energy transfer", "oil", "petroleum", "halliburton"] },
  { slug: "real-estate", name: "Real Estate", keywords: ["realty", "real estate", "properties", "development"] },
  { slug: "health-professionals", name: "Health Professionals", keywords: ["health", "hospital", "kaiser", "medical", "clinic", "pharma"] },
  { slug: "lawyers-law-firms", name: "Lawyers & Law Firms", keywords: ["law", "attorney", "legal", "llp"] },
  { slug: "technology", name: "Technology", keywords: ["alphabet", "google", "microsoft", "apple", "amazon", "meta", "salesforce", "tech"] },
  { slug: "retired", name: "Retired", keywords: ["retired"] },
];

export function employerToIndustry(
  employer: string,
): { slug: string; name: string } | null {
  const e = employer.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => e.includes(k))) {
      return { slug: rule.slug, name: rule.name };
    }
  }
  return null;
}

/** Aggregate employer rollups into industry totals (descending). */
export function rollUpIndustries(
  employers: { name: string; amount: number }[],
): { slug: string; name: string; amount: number }[] {
  const totals = new Map<string, { slug: string; name: string; amount: number }>();
  for (const e of employers) {
    const ind = employerToIndustry(e.name);
    if (!ind) continue;
    const cur = totals.get(ind.slug);
    if (cur) cur.amount += e.amount;
    else totals.set(ind.slug, { ...ind, amount: e.amount });
  }
  return [...totals.values()].sort((a, b) => b.amount - a.amount);
}
