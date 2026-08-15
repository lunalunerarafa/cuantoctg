import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { formatRange } from "@/lib/range";
import {
  computeDisplayRange,
  getOfficialTariff,
  getSeedStat,
  isSameZone,
  isValidRoute,
  LOCALES,
  officialTariffAmountLabel,
  placeLabel,
} from "@/lib/routes";
import { getUserReports } from "@/lib/supabase";
import type { Locale, PlaceId } from "@/lib/routes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deliberately NOT statically generated (no generateStaticParams): the
// design spec calls for this to reflect the route's CURRENT range on every
// request, same as the page itself — a build-time-baked image would go
// stale exactly like a static asset, which is the thing this is meant to
// avoid (see Handoff Notes' OG image spec).
export default async function OgImage({
  params,
}: {
  params: Promise<{ lang: string; origin: string; destination: string }>;
}) {
  const { lang, origin, destination } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  if (!isValidRoute(origin as PlaceId, destination as PlaceId)) notFound();
  const locale = lang as Locale;
  const originId = origin as PlaceId;
  const destinationId = destination as PlaceId;

  const officialTariff = getOfficialTariff(originId, destinationId);
  const sameZone = isSameZone(originId, destinationId);
  const userReports = await getUserReports(originId, destinationId);
  const display = computeDisplayRange(getSeedStat(originId, destinationId), userReports);

  // Mirrors the fareCard branch order in ReportForm.tsx: same-zone fixed
  // fare, then a zero-state route that still has a decree tariff, then the
  // crowd range, then a plain dash when there's genuinely nothing to show.
  const fareText =
    sameZone && officialTariff
      ? officialTariffAmountLabel(officialTariff)
      : display.kind === "zero" && officialTariff
        ? officialTariffAmountLabel(officialTariff)
        : display.kind === "value"
          ? formatRange(display.min, display.max)
          : "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "rgba(23,24,28,0.55)", marginBottom: 16 }}>
          {placeLabel(originId, locale)} → {placeLabel(destinationId, locale)}
        </div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, color: "#17181c", letterSpacing: "-0.02em" }}>{fareText}</div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "rgba(23,24,28,0.4)", marginTop: 40, letterSpacing: "0.04em" }}>
          CUÁNTO CUESTA CARTAGENA
        </div>
      </div>
    ),
    { ...size },
  );
}
