import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LangSwitch from "@/components/LangSwitch";
import { COPY, methodologyDescription, methodologyTitle } from "@/lib/copy";
import { LOCALES } from "@/lib/types";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const title = methodologyTitle(locale);
  const description = methodologyDescription(locale);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/como-funciona`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/como-funciona`])),
    },
    openGraph: { title, description },
  };
}

export default async function MethodologyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const t = COPY[locale];

  const sections: [string, string][] = [
    [t.whyTitle, t.whyBody],
    [t.reportsTitle, t.reportsBody],
    [t.thinTitle, t.thinBody],
    [t.noneTitle, t.noneBody],
    [t.calcTitle, t.calcBody],
    [t.recencyTitle, t.recencyBody],
    [t.trustTitle, t.trustBody],
    [t.dataTitle, t.dataBody],
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-[10px] border-b border-ink px-[18px] py-[14px]">
        <Link href={`/${locale}`} className="text-[16px]" aria-label={t.howItWorks}>
          ←
        </Link>
        <div className="flex-1 text-[12px] font-semibold">{t.methodTitle}</div>
        <LangSwitch locale={locale} segments={["como-funciona"]} />
      </header>

      <div className="flex flex-1 flex-col gap-[14px] overflow-auto p-[18px] text-[11.5px]">
        {sections.map(([title, body]) => (
          <div key={title}>
            <div className="mb-[3px] text-[12.5px] font-bold">{title}</div>
            <div className="leading-[1.55] opacity-65">{body}</div>
          </div>
        ))}

        <div className="border-t border-black/12 pt-[14px]">
          <div className="mb-[3px] text-[12.5px] font-bold">{t.licenseTitle}</div>
          <div className="leading-[1.55] opacity-65">{t.licenseBody}</div>
          <a href="https://creativecommons.org/licenses/by/4.0/" className="mt-1 inline-block text-[10.5px] underline">
            creativecommons.org/licenses/by/4.0
          </a>
        </div>

        <div className="mt-auto border-t border-black/12 pt-[14px]">
          <div className="mb-[3px] text-[12.5px] font-bold">{t.missingTitle}</div>
          <div className="leading-[1.55] opacity-65">{t.missingBody}</div>
        </div>
      </div>
    </div>
  );
}
