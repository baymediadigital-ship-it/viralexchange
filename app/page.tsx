import type { Metadata } from "next";
import HomeClient, { type HomeData } from "./HomeClient";
import { FAQ } from "@/lib/faq";
import { JsonLd, faqJsonLd } from "@/lib/seo";
import { getPipeline, getPublicListings } from "@/lib/publicData";

// Rebuilt at most once a minute, so new deals and listings show up quickly
// while the page is still served as fast, cached HTML.
export const revalidate = 60;

const title = "Buy & Sell YouTube Channels Safely | ViralExchange";
const description =
  "Buy or sell a monetized YouTube channel through escrow. Verified buyers, private listings and a public record of real sales. Free channel valuation.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "https://viralexchange.io/", title, description, images: ["/logo.jpg"] },
  twitter: { card: "summary", title, description, images: ["/logo.jpg"] },
};

export default async function Home() {
  const [pipeline, listings] = await Promise.all([getPipeline(), getPublicListings(3)]);
  const data: HomeData = {
    pipeline: pipeline as HomeData["pipeline"],
    listings: listings?.rows ?? [],
    listedCount: listings?.count ?? 0,
  };
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <HomeClient data={data} />
    </>
  );
}
