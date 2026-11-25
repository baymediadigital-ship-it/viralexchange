import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "ViralExchange — Buy & Sell YouTube Channels",
  description:
    "Buy and sell monetized YouTube channels on ViralExchange. Verified buyers and sellers, secure escrow, fast closings.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://viralexchange.io/",
    title: "ViralExchange — Buy & Sell YouTube Channels",
    description:
      "Buy and sell monetized YouTube channels on ViralExchange. Verified buyers and sellers, secure escrow, fast closings.",
    images: ["/brand/viralexchange-icon.png"],
  },
  twitter: {
    card: "summary",
    title: "ViralExchange — Buy & Sell YouTube Channels",
    description:
      "Buy and sell monetized YouTube channels on ViralExchange. Verified buyers and sellers, secure escrow, fast closings.",
    images: ["/brand/viralexchange-icon.png"],
  },
};

export default function Home() {
  return <HomeClient />;
}
