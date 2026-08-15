import seedData from "@/data/seed-routes.json";
import { trimOutliers } from "./range";

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

export const PLACE_IDS: PlaceId[] = [
  "airport",
  "centro",
  "getsemani",
  "bocagrande",
  "manga",
  "manzanillo",
  "castillogrande",
  "bazurto",
  "serenadelmar",
];

const LOCALIZED_LABELS: Record<"airport" | "centro", Record<Locale, string>> = {
  airport: { es: "Aeropuerto", en: "Airport", fr: "Aéroport" },
  centro: { es: "Centro", en: "Downtown", fr: "Centre" },
};

// The other 7 places use one label across all three languages (per the design doc).
const FIXED_LABELS: Record<Exclude<PlaceId, "airport" | "centro">, string> = {
  getsemani: "Getsemaní",
  bocagrande: "Bocagrande",
  manga: "Manga",
  manzanillo: "Manzanillo del Mar",
  castillogrande: "Castillogrande",
  bazurto: "Bazurto",
  serenadelmar: "Serena del Mar",
};

export function placeLabel(id: PlaceId, locale: Locale): string {
  if (id === "airport" || id === "centro") return LOCALIZED_LABELS[id][locale];
  return FIXED_LABELS[id];
}

// Every valid origin-destination pair: any two distinct places, plus
// centro->centro (short intra-Centro rides — the one deliberate same-place
// exception). Any other same-place pair is not a real route.
export function isValidRoute(origin: PlaceId, destination: PlaceId): boolean {
  if (!PLACE_IDS.includes(origin) || !PLACE_IDS.includes(destination)) return false;
  if (origin === destination) return origin === "centro";
  return true;
}

export const VALID_ROUTES: { origin: PlaceId; destination: PlaceId }[] = PLACE_IDS.flatMap((origin) =>
  PLACE_IDS.filter((destination) => isValidRoute(origin, destination)).map((destination) => ({
    origin,
    destination,
  })),
);

const SEED_ROUTES = seedData as SeedStat[];

export function getSeedStat(origin: PlaceId, destination: PlaceId): SeedStat | null {
  return SEED_ROUTES.find((r) => r.origin === origin && r.destination === destination) ?? null;
}

// Combines the founder's vetted seed number with live user reports without
// ever collapsing which is which (see CLAUDE.md: seed vs. real reports must
// never be flattened into one opaque figure).
//
// - "certainty" (estimated vs. confirmed) is a confidence read on the TOTAL
//   report count — source-agnostic.
// - The displayed NUMBER stays the seed range until user reports are
//   THEMSELVES independently >= 5, at which point live, fresher data takes
//   over the number. The seed count keeps contributing to the total either
//   way — it's superseded as the number source, never discarded.
export function computeDisplayRange(seed: SeedStat | null, userReports: UserReport[]): DisplayRange {
  const seedReportCount = seed?.reportCount ?? 0;
  const userReportCount = userReports.length;
  const totalReportCount = seedReportCount + userReportCount;

  if (totalReportCount === 0) {
    return { kind: "zero", seedReportCount: 0, userReportCount: 0, totalReportCount: 0 };
  }

  const certainty: "estimated" | "confirmed" = totalReportCount >= 5 ? "confirmed" : "estimated";

  if (userReportCount >= 5) {
    const amounts = userReports.map((r) => r.amountCop);
    const { min, max } = trimOutliers(amounts);
    const updatedAt = userReports.reduce((latest, r) => (r.createdAt > latest ? r.createdAt : latest), userReports[0].createdAt);
    return { kind: "value", min, max, certainty, updatedAt, seedReportCount, userReportCount, totalReportCount };
  }

  if (seed) {
    return {
      kind: "value",
      min: seed.min,
      max: seed.max,
      certainty,
      updatedAt: certainty === "confirmed" ? seed.updatedAt : undefined,
      seedReportCount,
      userReportCount,
      totalReportCount,
    };
  }

  // No seed, 1-4 raw user reports: plain spread of the raw amounts, no trim.
  const amounts = userReports.map((r) => r.amountCop);
  return {
    kind: "value",
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    certainty: "estimated",
    seedReportCount,
    userReportCount,
    totalReportCount,
  };
}

export function getRouteDisplay(origin: PlaceId, destination: PlaceId, userReports: UserReport[] = []): DisplayRange {
  return computeDisplayRange(getSeedStat(origin, destination), userReports);
}
