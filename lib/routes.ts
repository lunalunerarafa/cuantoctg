import seedData from "@/data/seed-routes.json";
import { formatAmount, formatRange, trimOutliers } from "./range";

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
  | "crespo"
  | "zona-norte"
  | "muelle-de-la-bodeguita"
  | "cielo-mar"
  | "la-boquilla";

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
  "crespo",
  "zona-norte",
  "muelle-de-la-bodeguita",
  "cielo-mar",
  "la-boquilla",
];

const LOCALIZED_LABELS: Record<"airport" | "centro" | "zona-norte" | "muelle-de-la-bodeguita", Record<Locale, string>> = {
  airport: { es: "Aeropuerto", en: "Airport", fr: "Aéroport" },
  centro: { es: "Centro", en: "Downtown", fr: "Centre" },
  "zona-norte": { es: "Zona Norte", en: "North Zone", fr: "Zone Nord" },
  "muelle-de-la-bodeguita": { es: "Muelle de la Bodeguita", en: "Bodeguita Pier", fr: "Quai de la Bodeguita" },
};

// The rest use one label across all three languages (per the design doc).
const FIXED_LABELS: Record<Exclude<PlaceId, "airport" | "centro" | "zona-norte" | "muelle-de-la-bodeguita">, string> = {
  getsemani: "Getsemaní",
  bocagrande: "Bocagrande",
  manga: "Manga",
  manzanillo: "Manzanillo del Mar",
  castillogrande: "Castillogrande",
  crespo: "Crespo",
  "cielo-mar": "Cielo Mar",
  "la-boquilla": "La Boquilla",
};

export function placeLabel(id: PlaceId, locale: Locale): string {
  if (id === "airport" || id === "centro" || id === "zona-norte" || id === "muelle-de-la-bodeguita") return LOCALIZED_LABELS[id][locale];
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

// Legally fixed fares from Decreto 0051 de 2026 (Alcaldía Distrital de
// Cartagena de Indias), a second, authoritative reference point shown
// alongside crowd-sourced ranges — never merged into them.
// A tariff is either a single fixed amount, or a min/max range for zones
// wide enough that the decree itself lists a spread of destination-specific
// figures (e.g. Zona Norte) rather than one flat rate.
export type OfficialTariff = { amount?: number; min?: number; max?: number; decree: string; zoneNote?: string };

export function officialTariffAmountLabel(tariff: OfficialTariff): string {
  if (tariff.min != null && tariff.max != null) return formatRange(tariff.min, tariff.max);
  return formatAmount(tariff.amount!);
}

const OFFICIAL_TARIFFS: Record<string, OfficialTariff> = {
  "airport:centro": {
    amount: 20200,
    decree: "Decreto 0051 de 2026",
    zoneNote: "Zona 1 · Centro – San Diego – La Matuna – Getsemaní",
  },
  "airport:getsemani": {
    amount: 20200,
    decree: "Decreto 0051 de 2026",
    zoneNote: "Zona 1 · Centro – San Diego – La Matuna – Getsemaní",
  },
  "airport:bocagrande": { amount: 34400, decree: "Decreto 0051 de 2026" },
  "airport:castillogrande": { amount: 34400, decree: "Decreto 0051 de 2026" },
  "airport:manga": { amount: 28500, decree: "Decreto 0051 de 2026" },
  "airport:manzanillo": { amount: 42000, decree: "Decreto 0051 de 2026" },
  "centro:bocagrande": { amount: 12250, decree: "Decreto 0051 de 2026" },
  "centro:castillogrande": { amount: 12250, decree: "Decreto 0051 de 2026" },
  "centro:manga": { amount: 12250, decree: "Decreto 0051 de 2026" },
  "centro:manzanillo": { amount: 54900, decree: "Decreto 0051 de 2026" },
  // Same figure as Centro's other Zone-1 rows — the decree's stated tarifa mínima.
  "centro:getsemani": { amount: 12250, decree: "Decreto 0051 de 2026" },
  // A direct fare from the decree's own "Bocagrande directo y viceversa" table —
  // not derived from the Centro/Aeropuerto zone system.
  "bocagrande:manga": { amount: 18300, decree: "Decreto 0051 de 2026" },
  "centro:crespo": { amount: 12250, decree: "Decreto 0051 de 2026" },
  "airport:crespo": { amount: 20200, decree: "Decreto 0051 de 2026" },
  "airport:muelle-de-la-bodeguita": { amount: 24300, decree: "Decreto 0051 de 2026" },
  // No centro:muelle-de-la-bodeguita entry — that pair isn't in the decree.
  "airport:cielo-mar": { amount: 24300, decree: "Decreto 0051 de 2026" },
  // Cielo Mar also appears in the Centro table (Zona 4), unlike Muelle de la
  // Bodeguita above — both entries are real, not just the Aeropuerto one.
  "centro:cielo-mar": { amount: 16900, decree: "Decreto 0051 de 2026" },
  "airport:la-boquilla": { amount: 24300, decree: "Decreto 0051 de 2026" },
  // Also in the Centro table (Zona 8), same pattern as Cielo Mar above —
  // not omitted despite the request saying it wasn't listed.
  "centro:la-boquilla": { amount: 30600, decree: "Decreto 0051 de 2026" },
  "centro:zona-norte": {
    min: 50800,
    max: 54900,
    decree: "Decreto 0051 de 2026",
    zoneNote:
      "Incluye C.R. Barceloneta, Conjunto Residencial Barcelona, Colegio George Washington y Universidad Tadeo Lozano — la tarifa varía según el punto exacto.",
  },
  "airport:zona-norte": {
    min: 42000,
    max: 44000,
    decree: "Decreto 0051 de 2026",
    zoneNote:
      "Incluye C.R. Barceloneta, Conjunto Residencial Barcelona, Colegio George Washington y Universidad Tadeo Lozano — la tarifa varía según el punto exacto.",
  },
};

const SAME_ZONE_GROUPS: PlaceId[][] = [["centro", "getsemani"]];

export const NIGHT_SURCHARGE = { amount: 1100, startHour: 19, endHour: 5 };

function tariffKey(a: PlaceId, b: PlaceId): string {
  return [a, b].sort().join(":");
}

export function getOfficialTariff(origin: PlaceId, destination: PlaceId): OfficialTariff | null {
  return OFFICIAL_TARIFFS[tariffKey(origin, destination)] ?? null;
}

export function isSameZone(origin: PlaceId, destination: PlaceId): boolean {
  return SAME_ZONE_GROUPS.some((group) => group.includes(origin) && group.includes(destination) && origin !== destination);
}
