import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { COPY } from "@/lib/copy";
import { formatRange } from "@/lib/range";
import { computeDisplayRange, getSeedStat, isValidRoute, placeLabel } from "@/lib/routes";
import { getUserReports } from "@/lib/supabase";
import { LOCALES } from "@/lib/types";
import type { Locale, PlaceId } from "@/lib/types";

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
  const t = COPY[locale];

  const userReports = await getUserReports(originId, destinationId);
  const display = computeDisplayRange(getSeedStat(originId, destinationId), userReports);
  const rangeText = display.kind === "value" ? `${formatRange(display.min, display.max)} COP` : t.zeroState;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#eeece7",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 42, fontWeight: 600, color: "#17181c" }}>
          {placeLabel(originId, locale)} → {placeLabel(destinationId, locale)}
        </div>
        <div style={{ display: "flex", fontSize: display.kind === "value" ? 96 : 44, fontWeight: 800, color: "#17181c", textAlign: "center" }}>
          {rangeText}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#17181c", opacity: 0.6 }}>cuánto cuesta cartagena</div>
      </div>
    ),
    { ...size },
  );
}
