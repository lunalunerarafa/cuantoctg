export type Locale = "es" | "en" | "fr";
export const LOCALES: Locale[] = ["es", "en", "fr"];

export type PlaceId =
  | "airport"
  | "centro"
  | "getsemani"
  | "bocagrande"
  | "manga"
  | "manzanillo"
  | "castillogrande"
  | "bazurto"
  | "serenadelmar";

// Pre-aggregated founder-verified numbers, committed as JSON for now.
// Never raw per-report rows — those don't exist yet (see CLAUDE.md).
export type SeedStat = {
  origin: PlaceId;
  destination: PlaceId;
  min: number;
  max: number;
  reportCount: number;
  updatedAt: string; // ISO date
};

// A single real submission, source of truth once Supabase exists (phase 3).
export type UserReport = {
  amountCop: number;
  createdAt: string; // ISO date
};

// What a route page actually renders. Seed and user counts are kept
// separate all the way through — never flattened into one opaque number.
export type DisplayRange =
  | {
      kind: "zero";
      seedReportCount: 0;
      userReportCount: 0;
      totalReportCount: 0;
    }
  | {
      kind: "value";
      min: number;
      max: number; // min === max renders as a single amount, not a range
      certainty: "estimated" | "confirmed"; // confirmed once totalReportCount >= 5
      updatedAt?: string; // present only when certainty === "confirmed"
      seedReportCount: number;
      userReportCount: number;
      totalReportCount: number;
    };
