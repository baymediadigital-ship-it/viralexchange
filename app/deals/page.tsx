import type { Metadata } from "next";
import DealsClient, { type Deal } from "./DealsClient";
import { getPipeline, getPublicListings } from "@/lib/publicData";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "YouTube Channel Sales: Recent Deals & Prices | ViralExchange" },
  description:
    "Real YouTube channel sales and what they sold for, plus the deals in progress right now. A public record of every channel we have brokered.",
  alternates: { canonical: "/deals" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/deals",
    title: "YouTube Channel Sales & Deal Pipeline | ViralExchange",
    description:
      "Real YouTube channel sales and what they sold for, plus the deals in progress right now. A public record of every channel we have brokered.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "YouTube Channel Sales & Deal Pipeline | ViralExchange",
    description:
      "Real YouTube channel sales and what they sold for, plus the deals in progress right now. A public record of every channel we have brokered.",
    images: ["/logo.jpg"],
  },
};

export default async function DealsPage() {
  const [listings, pipeline] = await Promise.all([getPublicListings(), getPipeline()]);
  const rows = (pipeline ?? []) as Deal[];
  // Live deals first (the actual pipeline), then closed sales; newest first within each.
  const deals = [...rows.filter((d) => d.stage !== "closed"), ...rows.filter((d) => d.stage === "closed")];
  return <DealsClient listings={listings?.rows ?? []} deals={deals} failed={!listings || !pipeline} />;
}
