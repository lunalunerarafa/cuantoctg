"use client";

import { useSyncExternalStore } from "react";

// navigator.share is a browser capability, not React state — subscribing
// via useSyncExternalStore (no-op subscribe, since it never changes after
// mount) reads it safely without a hydration mismatch, and without the
// effect+setState render-cascade that a plain useEffect check would cause.
function subscribe() {
  return () => {};
}

function canShareSnapshot(eligible: boolean) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "");
  return eligible && isMobile && typeof navigator.share === "function";
}

// Native share is mobile-only, and only once a route has real reports —
// there's no system share sheet worth surfacing on desktop, and nothing
// worth sharing on a route nobody's reported yet.
export default function ShareLink({
  originLabel,
  destinationLabel,
  rangeLabel,
  shareLabel,
  eligible,
}: {
  originLabel: string;
  destinationLabel: string;
  rangeLabel: string;
  shareLabel: string;
  eligible: boolean;
}) {
  const canShare = useSyncExternalStore(
    subscribe,
    () => canShareSnapshot(eligible),
    () => false,
  );

  if (!canShare) return null;

  return (
    <span
      onClick={() => {
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
