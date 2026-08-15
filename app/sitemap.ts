import type { MetadataRoute } from "next";
import { VALID_ROUTES } from "@/lib/routes";
import { LOCALES } from "@/lib/types";

const BASE = "https://cuantocuestacartagena.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({ url: `${BASE}/${locale}`, changeFrequency: "daily", priority: 1 });
    entries.push({ url: `${BASE}/${locale}/como-funciona`, changeFrequency: "monthly", priority: 0.5 });
    for (const { origin, destination } of VALID_ROUTES) {
      entries.push({ url: `${BASE}/${locale}/${origin}/${destination}`, changeFrequency: "weekly", priority: 0.8 });
    }
  }

  return entries;
}
