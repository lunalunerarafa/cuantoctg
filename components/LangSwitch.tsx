import Link from "next/link";
import type { Locale } from "@/lib/types";

const LOCALES: Locale[] = ["es", "en", "fr"];

// Plain links to the sibling-language URL for the same route — no client JS
// needed, language switching is a real navigation to a real URL.
export default function LangSwitch({ locale, segments }: { locale: Locale; segments: string[] }) {
  const suffix = segments.length ? `/${segments.join("/")}` : "";
  return (
    <div className="flex overflow-hidden rounded-[3px] border border-ink">
      {LOCALES.map((l, i) => (
        <Link
          key={l}
          href={`/${l}${suffix}`}
          className={`px-[6px] py-[2px] text-[10px] font-semibold ${
            l === locale ? "bg-ink text-surface" : "text-ink opacity-55"
          } ${i > 0 ? "border-l border-ink" : ""}`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
