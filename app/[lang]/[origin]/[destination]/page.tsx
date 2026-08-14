import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LangSwitch from "@/components/LangSwitch";
import ReportForm from "@/components/ReportForm";
import { confidenceCaption, COPY, routeDescription, routeTitle, WORDMARK } from "@/lib/copy";
import { formatRange } from "@/lib/range";
import { computeDisplayRange, getSeedStat, isValidRoute, placeLabel, PLACE_IDS, VALID_ROUTES } from "@/lib/routes";
import { getUserReports } from "@/lib/supabase";
import { LOCALES } from "@/lib/types";
import type { Locale, PlaceId } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => VALID_ROUTES.map(({ origin, destination }) => ({ lang, origin, destination })));
}

function parseParams(lang: string, origin: string, destination: string) {
  if (!LOCALES.includes(lang as Locale)) return null;
  if (!isValidRoute(origin as PlaceId, destination as PlaceId)) return null;
  return { locale: lang as Locale, originId: origin as PlaceId, destinationId: destination as PlaceId };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; origin: string; destination: string }>;
}): Promise<Metadata> {
  const { lang, origin, destination } = await params;
  const parsed = parseParams(lang, origin, destination);
  if (!parsed) return {};
  const { locale, originId, destinationId } = parsed;

  const userReports = await getUserReports(originId, destinationId);
  const display = computeDisplayRange(getSeedStat(originId, destinationId), userReports);
  const title = routeTitle(originId, destinationId, locale);
  const description = routeDescription(originId, destinationId, display, locale);
  const path = `/${originId}/${destinationId}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: { title, description },
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ lang: string; origin: string; destination: string }>;
}) {
  const { lang, origin, destination } = await params;
  const parsed = parseParams(lang, origin, destination);
  if (!parsed) notFound();
  const { locale, originId, destinationId } = parsed;

  const t = COPY[locale];
  const userReports = await getUserReports(originId, destinationId);
  const display = computeDisplayRange(getSeedStat(originId, destinationId), userReports);
  const originLabel = placeLabel(originId, locale);
  const destinationLabel = placeLabel(destinationId, locale);
  const rangeLabel = display.kind === "value" ? formatRange(display.min, display.max) : "—";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink px-[18px] py-[14px]">
        <Link href={`/${locale}`} className="text-[15px] leading-none font-bold tracking-[-0.01em]">
          cuánto cuesta
          <small className="mt-1 block text-[9px] font-medium tracking-[.06em] uppercase opacity-55">Cartagena</small>
        </Link>
        <LangSwitch locale={locale} segments={[originId, destinationId]} />
      </header>

      <div className="flex-1 px-[18px] py-[18px]">
        <div className="flex flex-col gap-[7px] rounded-[8px] border border-ink p-[20px_16px] text-center">
          <div className="text-[9.5px] font-semibold opacity-50">
            {originLabel} → {destinationLabel}
          </div>

          {display.kind === "zero" ? (
            <div className="text-[11px] leading-[1.4] opacity-60">
              {t.zeroState}
              <br />
              <span className="font-semibold opacity-90">{t.zeroStateCta}</span>
            </div>
          ) : (
            <>
              <div className="fare-num text-[36px] font-extrabold text-ink">{rangeLabel}</div>
              <div className="text-[10px] opacity-55">{confidenceCaption(display, locale)}</div>
              <div className="mt-[6px] text-[8.5px] font-bold tracking-[.02em] opacity-40">{WORDMARK}</div>
            </>
          )}

          <div className="mt-3 flex flex-wrap justify-center gap-[6px]">
            {PLACE_IDS.filter((id) => isValidRoute(originId, id)).map((id) => (
              <Link
                key={id}
                href={`/${locale}/${originId}/${id}`}
                className={`rounded-[3px] border border-ink px-[10px] py-[5px] text-[11px] font-medium ${
                  id === destinationId ? "bg-ink text-surface" : ""
                }`}
              >
                {placeLabel(id, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <ReportForm locale={locale} originId={originId} destinationId={destinationId} initialDisplay={display} />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-black/10 px-[18px] py-4">
        <Link href={`/${locale}/como-funciona`} className="text-center text-[9px] opacity-40">
          {t.howItWorks}
        </Link>
      </div>
    </div>
  );
}
