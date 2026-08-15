"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { confidenceCaption, confirmedDateLabel, COPY, reportWord, WORDMARK } from "@/lib/copy";
import { formatAmount, formatRange } from "@/lib/range";
import { getOfficialTariff, isSameZone, NIGHT_SURCHARGE, officialTariffAmountLabel } from "@/lib/routes";
import type { DisplayRange, Locale, PlaceId } from "@/lib/routes";

type UiState = "closed" | "open" | "submitting" | "confirmed";

// navigator.share is a browser capability, not React state — subscribing
// via useSyncExternalStore (no-op subscribe, since it never changes after
// mount) reads it safely without a hydration mismatch, and without the
// effect+setState render-cascade that a plain useEffect check would cause.
function subscribeToNothing() {
  return () => {};
}

function canShareSnapshot() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "") && typeof navigator.share === "function";
}

// Native share is mobile-only — no system share sheet worth surfacing on
// desktop. The only remaining consumer of this is ReportForm itself
// (closed and confirmed states, always with a route that has reports), so
// it lives here as a local helper rather than its own file.
function ShareLink({ originLabel, destinationLabel, rangeLabel, shareLabel }: { originLabel: string; destinationLabel: string; rangeLabel: string; shareLabel: string }) {
  const canShare = useSyncExternalStore(subscribeToNothing, canShareSnapshot, () => false);
  if (!canShare) return null;

  return (
    <span
      onClick={() => {
        track("share initiated");
        navigator
          .share({
            title: "cuánto cuesta cartagena",
            text: `${originLabel} → ${destinationLabel}: ${rangeLabel}`,
            url: window.location.href,
          })
          .catch(() => {});
      }}
      className="cursor-pointer text-[10.5px] font-medium underline opacity-50"
    >
      {shareLabel}
    </span>
  );
}

function cartagenaHourSnapshot(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", hourCycle: "h23", hour: "numeric" }).format(new Date()),
  );
}

function isNightSurchargeActiveSnapshot(): boolean {
  const hour = cartagenaHourSnapshot();
  return hour >= NIGHT_SURCHARGE.startHour || hour < NIGHT_SURCHARGE.endHour;
}

// Cartagena's own clock (America/Bogota, no DST) — not the viewer's. A
// tourist checking the site from abroad needs Cartagena's night-surcharge
// window, not whatever timezone their own device is set to. Same
// once-on-mount useSyncExternalStore pattern as ShareLink above.
function NightSurchargeBadge({ label }: { label: string }) {
  const active = useSyncExternalStore(subscribeToNothing, isNightSurchargeActiveSnapshot, () => false);
  if (!active) return null;
  return <div className="mx-auto w-fit rounded-full bg-ink px-[10px] py-[4px] text-[9.5px] font-semibold text-surface">{label}</div>;
}

export default function ReportForm({
  locale,
  originId,
  destinationId,
  initialDisplay,
  originLabel,
  destinationLabel,
  rangeLabel,
}: {
  locale: Locale;
  originId: PlaceId;
  destinationId: PlaceId;
  initialDisplay: DisplayRange;
  originLabel: string;
  destinationLabel: string;
  rangeLabel: string;
}) {
  const t = COPY[locale];
  const officialTariff = getOfficialTariff(originId, destinationId);
  const sameZone = isSameZone(originId, destinationId);

  const fareCard = (
    <div className="mb-4 flex w-full flex-col gap-[7px] rounded-[8px] border border-ink p-[20px_16px] text-center">
      <div className="text-[9.5px] font-semibold opacity-50">
        {originLabel} → {destinationLabel}
      </div>
      {sameZone && officialTariff ? (
        <>
          <div className="fare-num text-[36px] font-extrabold text-ink md:text-[48px]">{officialTariffAmountLabel(officialTariff)}</div>
          <div className="text-[10px] leading-[1.4] opacity-55">{t.sameZoneMessage}</div>
        </>
      ) : initialDisplay.kind === "zero" && officialTariff ? (
        <>
          <div className="fare-num text-[36px] font-extrabold text-ink md:text-[48px]">{officialTariffAmountLabel(officialTariff)}</div>
          <div className="text-[10px] font-semibold" style={{ color: "#8a6300" }}>
            {t.officialTariffCaption} · {officialTariff.decree}
          </div>
          <div className="mt-1 text-[10.5px] leading-[1.4] opacity-60">{t.officialOnlyNote}</div>
          {officialTariff.zoneNote && <div className="mt-1 text-[9.5px] leading-[1.4] opacity-50">{officialTariff.zoneNote}</div>}
        </>
      ) : initialDisplay.kind === "zero" ? (
        <div className="text-[11px] leading-[1.4] opacity-60">
          {t.zeroState}
          <br />
          <span className="font-semibold opacity-90">{t.zeroStateCta}</span>
        </div>
      ) : (
        <>
          <div className="fare-num text-[36px] font-extrabold text-ink md:text-[48px]">{rangeLabel}</div>
          {officialTariff && <NightSurchargeBadge label={t.nightSurchargeBadge} />}
          <div className="text-[10px] opacity-55">{confidenceCaption(initialDisplay, locale)}</div>
          <div className="mt-[6px] text-[8.5px] font-bold tracking-[.02em] opacity-40">{WORDMARK}</div>
          {officialTariff && (
            <>
              <div className="text-[10px] font-semibold opacity-50">
                {t.officialTariffLabel} {officialTariffAmountLabel(officialTariff)} · {officialTariff.decree}
              </div>
              {officialTariff.zoneNote && <div className="text-[9.5px] leading-[1.4] opacity-50">{officialTariff.zoneNote}</div>}
            </>
          )}
        </>
      )}
    </div>
  );
  const [uiState, setUiState] = useState<UiState>("open");
  const [formOpenedAt, setFormOpenedAt] = useState<number | null>(() => Date.now());
  const [amountDigits, setAmountDigits] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [confirmedDisplay, setConfirmedDisplay] = useState<DisplayRange | null>(null);

  function openForm() {
    setErrorMsg(null);
    setAmountDigits("");
    setHoneypot("");
    setFormOpenedAt(Date.now());
    setUiState("open");
  }

  async function submit() {
    if (!amountDigits) return; // matches spec: invalid click safely does nothing
    setUiState("submitting");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originId,
          destination: destinationId,
          amountCop: Number(amountDigits),
          notes: honeypot,
          formOpenedAt,
        }),
      });
      if (!res.ok) throw new Error("rejected");
      const { display } = (await res.json()) as { display: DisplayRange };
      track("submission completed");
      setConfirmedDisplay(display);
      setPaidAmount(Number(amountDigits));
      setUiState("confirmed");
    } catch {
      setErrorMsg(t.submitError);
      setUiState("open");
    }
  }

  if (uiState === "confirmed" && confirmedDisplay && confirmedDisplay.kind === "value" && paidAmount !== null) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-full flex-col gap-[6px] rounded-[8px] border border-ink p-[20px_16px] text-center">
          <div className="text-[10px] opacity-50">{t.youPaid}</div>
          <div className="fare-num text-[32px] font-extrabold">{formatAmount(paidAmount)}</div>
          <div className="text-[10.5px] opacity-60">
            {t.mostPay} {formatRange(confirmedDisplay.min, confirmedDisplay.max)}
          </div>
          <div className="relative flex items-center justify-center gap-[5px] text-[10px] opacity-55">
            <span className="fare-num cc-pulse font-bold">{confirmedDisplay.totalReportCount}</span>
            <span>
              {reportWord(confirmedDisplay.totalReportCount, locale)} · {confirmedDateLabel(confirmedDisplay, locale)}
            </span>
            <span className="cc-badge absolute -top-[14px] left-[calc(50%+2px)] text-[10px] font-extrabold text-accent">+1</span>
          </div>
          <div className="mt-[6px] text-[8.5px] font-bold tracking-[.02em] opacity-40">{WORDMARK}</div>
        </div>

        <div className="text-center text-[11px] font-semibold">{t.thanks}</div>

        <Link
          href={`/${locale}?origin=${originId}`}
          className="rounded-[5px] bg-ink px-[20px] py-[11px] text-[12.5px] font-bold text-surface"
        >
          {t.reportAnother}
        </Link>
        {confirmedDisplay.totalReportCount >= 5 && (
          <ShareLink
            originLabel={t.origin}
            destinationLabel={t.destination}
            rangeLabel={formatRange(confirmedDisplay.min, confirmedDisplay.max)}
            shareLabel={t.share}
          />
        )}
      </div>
    );
  }

  if (uiState === "open" || uiState === "submitting") {
    return (
      <>
        {fareCard}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex w-full flex-col gap-2 rounded-[6px] border border-ink p-[14px]"
        >
          {errorMsg && <div className="text-[10.5px] text-black/60">{errorMsg}</div>}
          <div className="text-[10.5px] font-semibold">{t.howMuchPaid}</div>
          <div className="flex gap-2">
            <input
              value={amountDigits ? formatAmount(Number(amountDigits)) : ""}
              onChange={(e) => setAmountDigits(e.target.value.replace(/\D/g, ""))}
              placeholder="18.000"
              inputMode="numeric"
              autoFocus
              className="fare-num flex-1 rounded-[3px] border border-ink px-[9px] py-[9px] text-[13px] outline-none"
            />
            {/* Honeypot: visually hidden, real input (not type="hidden" — some
                simple bots skip those), neutral name so autofill can't
                silently populate it and false-positive-reject a real user. */}
            <input
              type="text"
              name="notes"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] opacity-0"
            />
            <button
              type="submit"
              disabled={uiState === "submitting"}
              className={`flex items-center rounded-[3px] bg-ink px-[14px] py-[9px] text-[11px] font-semibold text-surface ${amountDigits ? "" : "opacity-35"}`}
            >
              {t.send}
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      {fareCard}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={openForm}
          className="rounded-[5px] bg-ink px-[18px] py-[11px] text-[12.5px] font-bold text-surface"
        >
          {t.reportPrice}
        </button>
        {initialDisplay.kind === "value" && (
          <ShareLink
            originLabel={t.origin}
            destinationLabel={t.destination}
            rangeLabel={formatRange(initialDisplay.min, initialDisplay.max)}
            shareLabel={t.share}
          />
        )}
      </div>
    </>
  );
}
