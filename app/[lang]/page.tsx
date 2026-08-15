import Link from "next/link";
import { notFound } from "next/navigation";
import LangSwitch from "@/components/LangSwitch";
import { COPY } from "@/lib/copy";
import { isValidRoute, PLACE_IDS, placeLabel } from "@/lib/routes";
import { LOCALES } from "@/lib/types";
import type { Locale, PlaceId } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ origin?: string }>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const t = COPY[locale];

  const { origin: originParam } = await searchParams;
  const origin: PlaceId = PLACE_IDS.includes(originParam as PlaceId) ? (originParam as PlaceId) : "airport";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Cuánto Cuesta Cartagena",
            url: "https://cuantocuestacartagena.com",
            description: "Tarifas reales de taxi en Cartagena reportadas por viajeros.",
            inLanguage: ["es", "en", "fr"],
          }),
        }}
      />
      <div className="flex min-h-dvh flex-col md:min-h-0">
        <header className="flex items-center justify-between border-b border-ink px-[18px] py-[14px] md:px-[28px] md:py-[18px]">
          <div className="text-[15px] font-bold leading-none tracking-[-0.01em]">
            cuánto cuesta
            <small className="mt-1 block text-[9px] font-medium uppercase tracking-[.06em] opacity-55">Cartagena</small>
          </div>
          <LangSwitch locale={locale} segments={[]} />
        </header>

        <div className="px-[18px] pt-4 pb-1">
          <p className="text-[12px] leading-[1.4] font-semibold text-black/65 md:text-[16px]">{t.intro}</p>
          <p className="mt-[3px] text-[10.5px] opacity-45 md:text-[12px]">{t.tagline}</p>
        </div>

        <div className="mx-[18px] mt-[14px] mb-[6px] md:mx-[28px]">
          <div className="mb-2 text-[9px] font-bold tracking-[.08em] text-black/40 uppercase md:text-[10px]">{t.origin}</div>
          <div className="flex flex-wrap gap-[6px] md:gap-[8px]">
            {PLACE_IDS.map((id) => (
              <Link
                key={id}
                href={`/${locale}?origin=${id}`}
                className={`rounded-[3px] border border-ink px-[13px] py-[7px] text-[12px] font-medium md:px-[16px] md:py-[9px] md:text-[13px] ${
                  id === origin ? "bg-ink text-surface" : ""
                }`}
              >
                {placeLabel(id, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-[18px] mt-4 mb-[10px] md:mx-[28px]">
          <div className="mb-2 text-[9px] font-bold tracking-[.08em] text-black/40 uppercase md:text-[10px]">{t.destination}</div>
          <div className="flex flex-wrap gap-[6px] md:gap-[8px]">
            {PLACE_IDS.map((id) => {
              if (!isValidRoute(origin, id)) {
                return (
                  <span
                    key={id}
                    className="rounded-[3px] border border-ink px-[13px] py-[7px] text-[12px] font-medium opacity-[.32] md:px-[16px] md:py-[9px] md:text-[13px]"
                  >
                    {placeLabel(id, locale)}
                  </span>
                );
              }
              return (
                <Link
                  key={id}
                  href={`/${locale}/${origin}/${id}`}
                  className="rounded-[3px] border border-ink px-[13px] py-[7px] text-[12px] font-medium md:px-[16px] md:py-[9px] md:text-[13px]"
                >
                  {placeLabel(id, locale)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-[18px] py-[18px] text-center text-[11px] opacity-40">{t.chooseDestination}</div>

        <div className="mt-auto flex flex-col gap-3 border-t border-black/10 px-[18px] py-4">
          <Link href={`/${locale}/como-funciona`} className="text-center text-[9px] opacity-40">
            {t.howItWorks}
          </Link>
        </div>
      </div>
    </>
  );
}
