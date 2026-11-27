import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const SITE = "https://viralexchange.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "daily"],
    ["/listings", 0.9, "daily"],
    ["/valuation", 0.8, "monthly"],
    ["/deals", 0.7, "daily"],
    ["/acquire", 0.7, "monthly"],
    ["/guides", 0.7, "weekly"],
    ...GUIDES.map((g) => [`/guides/${g.slug}`, 0.6, "monthly"] as [string, number, "monthly"]),
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
  ];
  const updated = new Map(GUIDES.map((g) => [`/guides/${g.slug}`, g.updated]));
  return pages.map(([path, priority, changeFrequency]) => ({
    url: `${SITE}${path}`,
    priority,
    changeFrequency,
    ...(updated.has(path) ? { lastModified: updated.get(path) } : {}),
  }));
}
