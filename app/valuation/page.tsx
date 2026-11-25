import type { Metadata } from "next";
import ValuationClient from "./ValuationClient";

export const metadata: Metadata = {
  title: "Free Channel Valuation",
  description: "Get a free, instant valuation for your YouTube channel based on real market sale data. No signup needed.",
  alternates: { canonical: "/valuation" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/valuation",
    title: "Free Channel Valuation — ViralExchange",
    description: "Get a free, instant valuation for your YouTube channel based on real market sale data. No signup needed.",
    images: ["/brand/viralexchange-icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Free Channel Valuation — ViralExchange",
    description: "Get a free, instant valuation for your YouTube channel based on real market sale data. No signup needed.",
    images: ["/brand/viralexchange-icon.png"],
  },
};

export default function ValuationPage() {
  return <ValuationClient />;
}
