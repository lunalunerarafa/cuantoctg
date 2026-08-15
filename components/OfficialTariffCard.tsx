import { COPY, WORDMARK } from "@/lib/copy";
import { officialTariffAmountLabel } from "@/lib/routes";
import type { OfficialTariff } from "@/lib/routes";
import type { Locale } from "@/lib/routes";

// A distinct, government-branded rendering of a fixed decree fare — for
// routes with an OFFICIAL_TARIFFS entry, alongside (not instead of) the
// normal crowd-sourced card. Not yet wired into any page; built ahead of
// deciding where it should actually appear.
export default function OfficialTariffCard({
  originLabel,
  destinationLabel,
  tariff,
  locale,
}: {
  originLabel: string;
  destinationLabel: string;
  tariff: OfficialTariff;
  locale: Locale;
}) {
  const t = COPY[locale];

  return (
    <div className="flex w-full flex-col gap-[7px] rounded-[8px] border-4 border-double border-ink p-[20px_16px] text-center">
      <div className="mx-auto w-fit rounded-full bg-accent px-[10px] py-[4px] text-[9.5px] font-bold tracking-[.02em] text-ink uppercase">
        {t.officialTariffPill}
      </div>
      <div className="text-[9.5px] font-semibold opacity-50">
        {originLabel} → {destinationLabel}
      </div>
      <div className="fare-num text-[36px] font-extrabold text-ink md:text-[48px]">{officialTariffAmountLabel(tariff)}</div>
      <div className="text-[10px] font-semibold opacity-70">{t.municipalityLine}</div>
      <div className="text-[10px] opacity-55">{t.decreeCitation}</div>
      {tariff.zoneNote && <div className="text-[9.5px] opacity-50">{tariff.zoneNote}</div>}
      <div className="mt-[6px] text-[8.5px] font-bold tracking-[.02em] opacity-40">{WORDMARK}</div>
    </div>
  );
}
