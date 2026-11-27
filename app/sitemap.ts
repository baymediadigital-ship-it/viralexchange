import type { MetadataRoute } from "next";

const SITE = "https://viralexchange.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "daily"],
    ["/listings", 0.9, "daily"],
    ["/valuation", 0.8, "monthly"],
    ["/deals", 0.7, "daily"],
    ["/acquire", 0.7, "monthly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
  ];
  return pages.map(([path, priority, changeFrequency]) => ({ url: `${SITE}${path}`, priority, changeFrequency }));
}
