import type { Metadata } from "next";
import ListingsClient from "./ListingsClient";
import { getPublicListings } from "@/lib/publicData";

// Rendered on the server so search engines see the listings; refreshed every minute
// and immediately when an admin approves or changes a listing.
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "YouTube Channels for Sale: Verified & Monetized | ViralExchange" },
  description:
    "Browse verified, monetized YouTube channels for sale. Filter by niche, subscribers and asking price. Stats come from YouTube and every deal closes through escrow.",
  alternates: { canonical: "/listings" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/listings",
    title: "YouTube Channels for Sale | ViralExchange",
    description:
      "Browse verified, monetized YouTube channels for sale. Filter by niche, subscribers and asking price. Stats come from YouTube and every deal closes through escrow.",
    images: ["/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: "YouTube Channels for Sale | ViralExchange",
    description:
      "Browse verified, monetized YouTube channels for sale. Filter by niche, subscribers and asking price. Stats come from YouTube and every deal closes through escrow.",
    images: ["/logo.jpg"],
  },
};

export default async function ListingsPage() {
  const res = await getPublicListings();
  return <ListingsClient listings={res?.rows ?? []} failed={!res} />;
}
