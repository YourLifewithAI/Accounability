import type { DataMode, SourceCitation } from "@/lib/provenance";

export type Chamber = "senate" | "house";
export type Party = "D" | "R" | "I";

/** Identity of a member of Congress / federal candidate. */
export interface Politician {
  /** URL slug, e.g. "elizabeth-warren". Stable; generated from identity data. */
  slug: string;
  bioguideId: string;
  /** FEC candidate IDs (a member can have several across offices/cycles). */
  fecIds: string[];
  name: string;
  firstName: string;
  lastName: string;
  party: Party;
  state: string;
  /** House district number; undefined for senators. */
  district?: number;
  chamber: Chamber;
  /** Human-readable office, e.g. "U.S. Senator (MA)". */
  office: string;
}

export interface MoneyEntry {
  /** Display name of the donor / industry / employer / recipient. */
  name: string;
  /** Slug for linking to a detail page, when we have one. */
  slug?: string;
  amount: number;
  /** Optional secondary classification (e.g. "PAC", "Individual"). */
  kind?: string;
}

export interface ContributionsBySize {
  /** Unitemized / small-dollar (< $200). */
  small: number;
  /** Itemized mid-size. */
  medium: number;
  /** Large / max-out. */
  large: number;
}

/** A member's money map for a given two-year cycle. */
export interface PoliticianFinance {
  politician: Politician;
  cycle: number;
  totalRaised: number;
  totalSpent: number;
  cashOnHand: number;
  individualTotal: number;
  pacTotal: number;
  topDonors: MoneyEntry[];
  topIndustries: MoneyEntry[];
  topEmployers: MoneyEntry[];
  bySize: ContributionsBySize;
  /** Federal money flowing to the member's state/district — contextual, not causal. */
  districtSpending: MoneyEntry[];
  citations: Record<string, SourceCitation>;
  dataMode: DataMode;
  /** ISO date the underlying data was last refreshed. */
  lastUpdated: string;
}

export interface Donor {
  slug: string;
  name: string;
  kind: string;
  totalGiven: number;
  recipients: MoneyEntry[];
  citations: Record<string, SourceCitation>;
  dataMode: DataMode;
  lastUpdated: string;
}

export interface Industry {
  slug: string;
  name: string;
  totalGiven: number;
  topRecipients: MoneyEntry[];
  partySplit: { D: number; R: number; I: number };
  citations: Record<string, SourceCitation>;
  dataMode: DataMode;
  lastUpdated: string;
}
