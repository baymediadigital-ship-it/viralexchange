import type { Metadata } from "next";
import AcquireClient from "./AcquireClient";

export const metadata: Metadata = {
  title: { absolute: "Buy a YouTube Channel: Vetted, Monetized Channels | ViralExchange" },
  description:
    "Buy a monetized YouTube channel without the guesswork. Tell us your budget and niche and we bring you vetted channels, verified stats and escrow-protected deals.",
  alternates: { canonical: "/acquire" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/acquire",
    title: "Buy a Monetized YouTube Channel | ViralExchange",
    description:
      "Buy a monetized YouTube channel without the guesswork. Tell us your budget and niche and we bring you vetted channels, verified stats and escrow-protected deals.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Buy a Monetized YouTube Channel | ViralExchange",
    description:
      "Buy a monetized YouTube channel without the guesswork. Tell us your budget and niche and we bring you vetted channels, verified stats and escrow-protected deals.",
    images: ["/logo.jpg"],
  },
};

export default function AcquirePage() {
  return <AcquireClient />;
}
