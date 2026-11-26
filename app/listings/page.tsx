import type { Metadata } from "next";
import ListingsClient from "./ListingsClient";

export const metadata: Metadata = {
  title: "Browse YouTube Channels for Sale",
  description: "Verified YouTube channels for sale. Browse by niche, subscribers and asking price. Every deal closes through escrow.",
  alternates: { canonical: "/listings" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/listings",
    title: "Browse YouTube Channels for Sale — ViralExchange",
    description: "Verified YouTube channels for sale. Browse by niche, subscribers and asking price. Every deal closes through escrow.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Browse YouTube Channels for Sale — ViralExchange",
    description: "Verified YouTube channels for sale. Every deal closes through escrow.",
    images: ["/logo.jpg"],
  },
};

export default function ListingsPage() {
  return <ListingsClient />;
}
