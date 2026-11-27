import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GUIDES, type Guide } from "@/lib/guides";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESC =
  "Plain-English guides to buying and selling YouTube channels: valuation, RPM, due diligence, escrow and what to do after you buy. From a brokerage that has done the deals.";

export const metadata: Metadata = {
  title: { absolute: "Guides to Buying & Selling YouTube Channels | ViralExchange" },
  description: DESC,
  alternates: { canonical: "/guides" },
  openGraph: { type: "website", url: "https://viralexchange.io/guides", title: "Guides to Buying & Selling YouTube Channels", description: DESC, images: ["/logo.jpg"] },
  twitter: { card: "summary", title: "Guides to Buying & Selling YouTube Channels", description: DESC, images: ["/logo.jpg"] },
};

function GuideCard({ g }: { g: Guide }) {
  return (
    <li>
      <Link
        href={`/guides/${g.slug}`}
        className="group flex h-full flex-col rounded-xl border border-vx-line bg-vx-surface p-6 transition-colors duration-200 hover:border-vx-line-strong"
      >
        <span className="text-[17px] leading-snug tracking-[-0.02em] text-vx-ink">{g.title}</span>
        <span className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-vx-body">{g.description}</span>
        <span className="mt-auto flex items-center gap-1 pt-5 text-[13px] text-vx-muted transition-colors group-hover:text-vx-ink">
          Read guide <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

export default function GuidesPage() {
  const groups = [
    { key: "sellers", title: "For sellers", items: GUIDES.filter((g) => g.audience === "sellers") },
    { key: "buyers", title: "For buyers", items: GUIDES.filter((g) => g.audience === "buyers") },
  ];
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <SiteNav />
      <main className="px-5 sm:px-6">
        <div className="vx-page-in mx-auto max-w-6xl pt-16 pb-24 sm:pt-20">
          <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-vx-muted uppercase sm:text-[12px]">
            <span className="size-1.5 rounded-full bg-vx-accent" />
            Guides
          </div>
          <h1 className="mt-6 max-w-3xl text-[40px] leading-[1.05] font-normal tracking-[-0.04em] text-vx-ink sm:text-[60px]">
            How the channel market
            <br />
            <span className="text-vx-muted">actually works.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body">
            Plain-English guides to buying and selling YouTube channels, from the people who broker the deals.
          </p>

          {groups.map((grp) => (
            <section key={grp.key} className="mt-14" aria-labelledby={`g-${grp.key}`}>
              <h2 id={`g-${grp.key}`} className="font-mono text-[12px] tracking-[0.06em] text-vx-faint uppercase">
                {grp.title}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grp.items.map((g) => (
                  <GuideCard key={g.slug} g={g} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
