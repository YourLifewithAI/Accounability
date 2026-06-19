import type { Chamber, Party } from "@/lib/data/types";

/**
 * SAMPLE DATA — illustrative figures only.
 *
 * These records let the app run and render end-to-end where the live FEC /
 * USAspending / FollowTheMoney APIs are unreachable (missing keys, or a network
 * egress allowlist). They are NOT real reported totals. The UI always labels
 * pages built from this data as "sample" so nothing fabricated is ever shown as
 * verified fact. Identity fields (names, states, FEC/bioguide IDs) are real and
 * come from the public congress-legislators dataset; the dollar figures are not.
 */
export interface RawMember {
  slug: string;
  bioguideId: string;
  fecIds: string[];
  name: string;
  firstName: string;
  lastName: string;
  party: Party;
  state: string;
  district?: number;
  chamber: Chamber;
  office: string;
  cycle: number;
  totalRaised: number;
  totalSpent: number;
  cashOnHand: number;
  individualTotal: number;
  pacTotal: number;
  topDonors: { name: string; slug?: string; amount: number; kind: string }[];
  topIndustries: { name: string; slug: string; amount: number }[];
  topEmployers: { name: string; amount: number }[];
  bySize: { small: number; medium: number; large: number };
  districtSpending: { name: string; amount: number; kind: string }[];
}

export const SAMPLE_CYCLE = 2024;

export const SAMPLE_MEMBERS: RawMember[] = [
  {
    slug: "elizabeth-warren",
    bioguideId: "W000817",
    fecIds: ["S2MA00170"],
    name: "Elizabeth Warren",
    firstName: "Elizabeth",
    lastName: "Warren",
    party: "D",
    state: "MA",
    chamber: "senate",
    office: "U.S. Senator (MA)",
    cycle: 2024,
    totalRaised: 24_300_000,
    totalSpent: 16_800_000,
    cashOnHand: 7_500_000,
    individualTotal: 22_100_000,
    pacTotal: 410_000,
    topDonors: [
      { name: "Harvard University", slug: "harvard-university", amount: 198_000, kind: "Individual" },
      { name: "University of California", amount: 142_000, kind: "Individual" },
      { name: "Alphabet Inc", amount: 121_000, kind: "Individual" },
      { name: "Microsoft Corp", amount: 96_000, kind: "Individual" },
      { name: "EMILY's List", amount: 60_000, kind: "PAC" },
    ],
    topIndustries: [
      { name: "Education", slug: "education", amount: 1_240_000 },
      { name: "Lawyers & Law Firms", slug: "lawyers-law-firms", amount: 980_000 },
      { name: "Retired", slug: "retired", amount: 3_100_000 },
      { name: "Securities & Investment", slug: "securities-investment", amount: 520_000 },
    ],
    topEmployers: [
      { name: "Harvard University", amount: 198_000 },
      { name: "Self-Employed", amount: 1_900_000 },
      { name: "Retired", amount: 3_100_000 },
    ],
    bySize: { small: 9_800_000, medium: 7_200_000, large: 5_100_000 },
    districtSpending: [
      { name: "Raytheon Technologies (MA)", amount: 8_900_000_000, kind: "Defense contracts" },
      { name: "MIT — federal research grants", amount: 720_000_000, kind: "Grants" },
      { name: "MBTA transit funding", amount: 1_100_000_000, kind: "Grants" },
    ],
  },
  {
    slug: "bernie-sanders",
    bioguideId: "S000033",
    fecIds: ["S6VT00043"],
    name: "Bernie Sanders",
    firstName: "Bernie",
    lastName: "Sanders",
    party: "I",
    state: "VT",
    chamber: "senate",
    office: "U.S. Senator (VT)",
    cycle: 2024,
    totalRaised: 19_600_000,
    totalSpent: 12_400_000,
    cashOnHand: 14_200_000,
    individualTotal: 18_900_000,
    pacTotal: 12_000,
    topDonors: [
      { name: "University of California", amount: 156_000, kind: "Individual" },
      { name: "Alphabet Inc", amount: 88_000, kind: "Individual" },
      { name: "Kaiser Permanente", amount: 61_000, kind: "Individual" },
      { name: "United States Postal Service", amount: 54_000, kind: "Individual" },
    ],
    topIndustries: [
      { name: "Retired", slug: "retired", amount: 2_800_000 },
      { name: "Education", slug: "education", amount: 1_050_000 },
      { name: "Health Professionals", slug: "health-professionals", amount: 690_000 },
    ],
    topEmployers: [
      { name: "Self-Employed", amount: 2_400_000 },
      { name: "Retired", amount: 2_800_000 },
      { name: "University of California", amount: 156_000 },
    ],
    bySize: { small: 14_900_000, medium: 2_600_000, large: 1_400_000 },
    districtSpending: [
      { name: "University of Vermont — research grants", amount: 210_000_000, kind: "Grants" },
      { name: "Vermont rural broadband", amount: 95_000_000, kind: "Grants" },
    ],
  },
  {
    slug: "ted-cruz",
    bioguideId: "C001098",
    fecIds: ["S2TX00312"],
    name: "Ted Cruz",
    firstName: "Ted",
    lastName: "Cruz",
    party: "R",
    state: "TX",
    chamber: "senate",
    office: "U.S. Senator (TX)",
    cycle: 2024,
    totalRaised: 31_200_000,
    totalSpent: 22_900_000,
    cashOnHand: 6_300_000,
    individualTotal: 25_400_000,
    pacTotal: 2_100_000,
    topDonors: [
      { name: "Club for Growth", amount: 312_000, kind: "PAC" },
      { name: "ExxonMobil", amount: 168_000, kind: "Individual" },
      { name: "Goldman Sachs", amount: 121_000, kind: "Individual" },
      { name: "Energy Transfer Partners", amount: 98_000, kind: "Individual" },
    ],
    topIndustries: [
      { name: "Oil & Gas", slug: "oil-gas", amount: 1_640_000 },
      { name: "Securities & Investment", slug: "securities-investment", amount: 1_220_000 },
      { name: "Real Estate", slug: "real-estate", amount: 910_000 },
      { name: "Retired", slug: "retired", amount: 2_200_000 },
    ],
    topEmployers: [
      { name: "Retired", amount: 2_200_000 },
      { name: "ExxonMobil", amount: 168_000 },
      { name: "Self-Employed", amount: 1_500_000 },
    ],
    bySize: { small: 11_300_000, medium: 8_900_000, large: 5_200_000 },
    districtSpending: [
      { name: "Lockheed Martin (TX)", amount: 12_400_000_000, kind: "Defense contracts" },
      { name: "NASA Johnson Space Center", amount: 4_700_000_000, kind: "Federal spending" },
    ],
  },
  {
    slug: "marco-rubio",
    bioguideId: "R000595",
    fecIds: ["S0FL00338"],
    name: "Marco Rubio",
    firstName: "Marco",
    lastName: "Rubio",
    party: "R",
    state: "FL",
    chamber: "senate",
    office: "U.S. Senator (FL)",
    cycle: 2024,
    totalRaised: 18_100_000,
    totalSpent: 13_300_000,
    cashOnHand: 4_900_000,
    individualTotal: 14_800_000,
    pacTotal: 1_700_000,
    topDonors: [
      { name: "Florida Power & Light", amount: 142_000, kind: "Individual" },
      { name: "NextEra Energy", amount: 118_000, kind: "Individual" },
      { name: "Carnival Corp", amount: 84_000, kind: "Individual" },
    ],
    topIndustries: [
      { name: "Real Estate", slug: "real-estate", amount: 1_120_000 },
      { name: "Securities & Investment", slug: "securities-investment", amount: 980_000 },
      { name: "Health Professionals", slug: "health-professionals", amount: 760_000 },
    ],
    topEmployers: [
      { name: "Retired", amount: 1_800_000 },
      { name: "NextEra Energy", amount: 118_000 },
    ],
    bySize: { small: 6_700_000, medium: 6_200_000, large: 5_200_000 },
    districtSpending: [
      { name: "Port of Miami infrastructure", amount: 640_000_000, kind: "Grants" },
      { name: "NASA Kennedy Space Center", amount: 3_900_000_000, kind: "Federal spending" },
    ],
  },
  {
    slug: "alexandria-ocasio-cortez",
    bioguideId: "O000172",
    fecIds: ["H8NY15148"],
    name: "Alexandria Ocasio-Cortez",
    firstName: "Alexandria",
    lastName: "Ocasio-Cortez",
    party: "D",
    state: "NY",
    district: 14,
    chamber: "house",
    office: "U.S. Representative (NY-14)",
    cycle: 2024,
    totalRaised: 9_800_000,
    totalSpent: 7_100_000,
    cashOnHand: 6_400_000,
    individualTotal: 9_500_000,
    pacTotal: 4_000,
    topDonors: [
      { name: "Alphabet Inc", amount: 74_000, kind: "Individual" },
      { name: "University of California", amount: 58_000, kind: "Individual" },
      { name: "Amazon.com", amount: 41_000, kind: "Individual" },
    ],
    topIndustries: [
      { name: "Education", slug: "education", amount: 720_000 },
      { name: "Retired", slug: "retired", amount: 980_000 },
      { name: "Health Professionals", slug: "health-professionals", amount: 410_000 },
    ],
    topEmployers: [
      { name: "Self-Employed", amount: 980_000 },
      { name: "Retired", amount: 980_000 },
    ],
    bySize: { small: 8_100_000, medium: 1_100_000, large: 600_000 },
    districtSpending: [
      { name: "NYC public housing (HUD)", amount: 1_800_000_000, kind: "Grants" },
      { name: "MTA federal transit funds", amount: 2_100_000_000, kind: "Grants" },
    ],
  },
  {
    slug: "nancy-pelosi",
    bioguideId: "P000197",
    fecIds: ["H8CA05035"],
    name: "Nancy Pelosi",
    firstName: "Nancy",
    lastName: "Pelosi",
    party: "D",
    state: "CA",
    district: 11,
    chamber: "house",
    office: "U.S. Representative (CA-11)",
    cycle: 2024,
    totalRaised: 14_500_000,
    totalSpent: 11_900_000,
    cashOnHand: 1_200_000,
    individualTotal: 9_300_000,
    pacTotal: 3_900_000,
    topDonors: [
      { name: "Alphabet Inc", amount: 96_000, kind: "Individual" },
      { name: "Salesforce", amount: 78_000, kind: "Individual" },
      { name: "Apple Inc", amount: 64_000, kind: "Individual" },
    ],
    topIndustries: [
      { name: "Securities & Investment", slug: "securities-investment", amount: 1_340_000 },
      { name: "Real Estate", slug: "real-estate", amount: 1_010_000 },
      { name: "Lawyers & Law Firms", slug: "lawyers-law-firms", amount: 870_000 },
    ],
    topEmployers: [
      { name: "Self-Employed", amount: 1_100_000 },
      { name: "Alphabet Inc", amount: 96_000 },
    ],
    bySize: { small: 4_200_000, medium: 5_100_000, large: 5_200_000 },
    districtSpending: [
      { name: "San Francisco transit (BART)", amount: 1_400_000_000, kind: "Grants" },
      { name: "UCSF — federal research", amount: 980_000_000, kind: "Grants" },
    ],
  },
];
