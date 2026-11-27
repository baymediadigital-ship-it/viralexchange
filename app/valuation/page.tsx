import type { Metadata } from "next";
import ValuationClient from "./ValuationClient";

export const metadata: Metadata = {
  title: { absolute: "YouTube Channel Valuation Calculator: What's Your Channel Worth? | ViralExchange" },
  description:
    "Free YouTube channel valuation calculator. See what your monetized channel could sell for, based on monthly profit, niche and real sale multiples. No signup needed.",
  alternates: { canonical: "/valuation" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/valuation",
    title: "What's Your YouTube Channel Worth? Free Valuation | ViralExchange",
    description:
      "Free YouTube channel valuation calculator. See what your monetized channel could sell for, based on monthly profit, niche and real sale multiples. No signup needed.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "What's Your YouTube Channel Worth? Free Valuation | ViralExchange",
    description:
      "Free YouTube channel valuation calculator. See what your monetized channel could sell for, based on monthly profit, niche and real sale multiples. No signup needed.",
    images: ["/logo.jpg"],
  },
};

export default function ValuationPage() {
  return <ValuationClient />;
}
