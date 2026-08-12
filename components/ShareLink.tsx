"use client";

import { useEffect, useState } from "react";

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
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "");
    setCanShare(eligible && isMobile && typeof navigator.share === "function");
  }, [eligible]);

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
