"use client";

import Link from "next/link";
import { useState } from "react";
import ShareLink from "./ShareLink";
import { confirmedDateLabel, COPY, reportWord, WORDMARK } from "@/lib/copy";
import { formatAmount, formatRange } from "@/lib/range";
import type { DisplayRange, Locale, PlaceId } from "@/lib/types";

type UiState = "closed" | "open" | "submitting" | "confirmed";

export default function ReportForm({
  locale,
  originId,
  destinationId,
  initialDisplay,
}: {
  locale: Locale;
  originId: PlaceId;
  destinationId: PlaceId;
  initialDisplay: DisplayRange;
}) {
  const t = COPY[locale];
  const [uiState, setUiState] = useState<UiState>("closed");
  const [formOpenedAt, setFormOpenedAt] = useState<number | null>(null);
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
        <ShareLink
          originLabel={t.origin}
          destinationLabel={t.destination}
          rangeLabel={formatRange(confirmedDisplay.min, confirmedDisplay.max)}
          shareLabel={t.share}
          eligible
        />
      </div>
    );
  }

  if (uiState === "open" || uiState === "submitting") {
    return (
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
    );
  }

  return (
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
          eligible
        />
      )}
    </div>
  );
}
