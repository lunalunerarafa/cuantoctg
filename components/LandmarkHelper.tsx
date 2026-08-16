"use client";

import { useState } from "react";
import { placeLabel } from "@/lib/routes";
import type { Locale, PlaceId } from "@/lib/routes";

// Landmark names are real proper nouns (hotels, plazas, beaches) that don't
// change across languages — only the place labels themselves (via
// placeLabel) need to stay locale-aware, matching the rest of the page.
const LANDMARKS: Partial<Record<PlaceId, string[]>> = {
  centro: ["Torre del Reloj", "Plaza Santo Domingo", "Castillo San Felipe de Barajas", "Sofitel Legend Santa Clara"],
  getsemani: ["Plaza de la Trinidad", "Cartagena Convention Center", "Café Havana", "Celele"],
  bocagrande: ["Hotel Caribe", "Nao Shopping Mall", "Playa de Bocagrande"],
  manga: ["Club de Pesca", "Cruise Terminal"],
  manzanillo: ["Manzanillo del Mar beach", "Grand Sirenis"],
  crespo: ["Crespo Beach"],
  "zona-norte": ["Universidad Tadeo Lozano", "Colegio George Washington", "Barceloneta"],
  "muelle-de-la-bodeguita": ["Boat dock for Islas del Rosario tours"],
  "cielo-mar": ["Las Américas Torre del Mar"],
  "la-boquilla": ["La Boquilla Beach", "Caribe Kitesurf"],
};

export default function LandmarkHelper({ toggleLabel, locale }: { toggleLabel: string; locale: Locale }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full border border-ink px-[12px] py-[5px] text-[10.5px] font-semibold ${open ? "bg-ink text-surface" : "bg-white"}`}
      >
        {toggleLabel}
      </button>
      {open && (
        <div className="mt-2 w-full max-w-[520px] rounded-[6px] border border-black/15 bg-[#fafaf8] p-[12px_14px] text-[11px] leading-[1.65]">
          {(Object.entries(LANDMARKS) as [PlaceId, string[]][]).map(([id, names]) => (
            <div key={id} className="mb-[5px] last:mb-0">
              <b>{placeLabel(id, locale)}</b> — {names.join(", ")}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
