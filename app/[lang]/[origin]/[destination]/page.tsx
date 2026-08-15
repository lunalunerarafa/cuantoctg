import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LangSwitch from "@/components/LangSwitch";
import ReportForm from "@/components/ReportForm";
import { COPY, routeDescription, routeTitle } from "@/lib/copy";
import { formatRange } from "@/lib/range";
import { computeDisplayRange, getSeedStat, isValidRoute, LOCALES, placeLabel, VALID_ROUTES } from "@/lib/routes";
import { getUserReports } from "@/lib/supabase";
import type { Locale, PlaceId } from "@/lib/routes";

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
    <div className="flex min-h-dvh flex-col md:min-h-0">
      <header className="flex items-center justify-between border-b border-ink px-[18px] py-[14px] md:px-[28px] md:py-[18px]">
        <div className="flex items-center gap-[10px]">
          <Link href={`/${locale}`} className="flex items-center gap-[4px] text-[13px] font-semibold">
            <span style={{ fontSize: "16px" }}>←</span> {t.backHome}
          </Link>
          <Link href={`/${locale}`} className="text-[15px] leading-none font-bold tracking-[-0.01em]">
            cuánto cuesta
            <small className="mt-1 block text-[9px] font-medium tracking-[.06em] uppercase opacity-55">Cartagena</small>
          </Link>
        </div>
        <LangSwitch locale={locale} segments={[originId, destinationId]} />
      </header>

      <div className="flex-1 px-[18px] py-[18px] md:px-[28px]">
        <div className="flex flex-col items-center gap-2">
          <ReportForm
            locale={locale}
            originId={originId}
            destinationId={destinationId}
            initialDisplay={display}
            originLabel={originLabel}
            destinationLabel={destinationLabel}
            rangeLabel={rangeLabel}
          />
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
