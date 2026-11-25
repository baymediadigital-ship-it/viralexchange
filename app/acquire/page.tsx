import type { Metadata } from "next";
import AcquireClient from "./AcquireClient";

export const metadata: Metadata = {
  title: "Acquire a Channel",
  description:
    "Skip building from scratch. Apply to acquire a vetted, monetized YouTube channel through ViralExchange's done-for-you acquisition program.",
  alternates: { canonical: "/acquire" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/acquire",
    title: "Acquire a Channel — ViralExchange",
    description:
      "Skip building from scratch. Apply to acquire a vetted, monetized YouTube channel through ViralExchange's done-for-you acquisition program.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Acquire a Channel — ViralExchange",
    description:
      "Skip building from scratch. Apply to acquire a vetted, monetized YouTube channel through ViralExchange's done-for-you acquisition program.",
    images: ["/logo.jpg"],
  },
};

export default function AcquirePage() {
  return <AcquireClient />;
}
