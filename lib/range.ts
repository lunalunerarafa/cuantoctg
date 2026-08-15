import type { Locale } from "./routes";

// Tukey fences: drop amounts outside 1.5x the interquartile range. Applied
// only to raw report rows — pre-aggregated seed stats are used as-is.
export function trimOutliers(amounts: number[]): { min: number; max: number } {
  const sorted = [...amounts].sort((a, b) => a - b);
  const percentile = (p: number) => {
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const q1 = percentile(0.25);
  const q3 = percentile(0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const kept = sorted.filter((a) => a >= lowerBound && a <= upperBound);
  const survivors = kept.length > 0 ? kept : sorted;
  return { min: survivors[0], max: survivors[survivors.length - 1] };
}

// Fare amounts always use the Colombian "." thousands separator, regardless
// of the page's UI language — this is a currency convention, not a copy string.
export function formatAmount(amountCop: number): string {
  return new Intl.NumberFormat("es-CO").format(amountCop);
}

export function formatRange(min: number, max: number): string {
  return min === max ? formatAmount(min) : `${formatAmount(min)}–${formatAmount(max)}`;
}

export function relativeTime(updatedAt: string, locale: Locale, now: Date = new Date()): string {
  const days = Math.max(1, Math.round((now.getTime() - new Date(updatedAt).getTime()) / 86_400_000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  if (days < 30) return rtf.format(-days, "day");
  return rtf.format(-Math.max(1, Math.round(days / 30)), "month");
}
