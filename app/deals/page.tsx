import type { Metadata } from "next";
import DealsClient from "./DealsClient";

export const metadata: Metadata = {
  title: "Deal Pipeline",
  description:
    "Live deal pipeline for ViralExchange — active listings, deals in progress, and recently closed YouTube channel sales.",
  alternates: { canonical: "/deals" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/deals",
    title: "Deal Pipeline — ViralExchange",
    description:
      "Live deal pipeline for ViralExchange — active listings, deals in progress, and recently closed YouTube channel sales.",
    images: ["/brand/viralexchange-icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Deal Pipeline — ViralExchange",
    description:
      "Live deal pipeline for ViralExchange — active listings, deals in progress, and recently closed YouTube channel sales.",
    images: ["/brand/viralexchange-icon.png"],
  },
};

export default function DealsPage() {
  return <DealsClient />;
}
