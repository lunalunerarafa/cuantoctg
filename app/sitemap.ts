import type { MetadataRoute } from "next";
import { VALID_ROUTES } from "@/lib/routes";
import { LOCALES } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({ url: `${SITE_URL}/${locale}`, changeFrequency: "weekly" });
    entries.push({ url: `${SITE_URL}/${locale}/como-funciona`, changeFrequency: "monthly" });
    for (const { origin, destination } of VALID_ROUTES) {
      entries.push({ url: `${SITE_URL}/${locale}/${origin}/${destination}`, changeFrequency: "daily" });
    }
  }

  return entries;
}
