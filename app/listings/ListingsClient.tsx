"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ListingsBrowser, type PublicListing } from "@/components/site/ListingsBrowser";
import { BUYERS_LOUNGE_OPEN, TELEGRAM_URL } from "@/components/site/links";

export default function ListingsClient({ listings, failed }: { listings: PublicListing[]; failed: boolean }) {
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      <header className="px-5 sm:px-6">
        <div className="mx-auto max-w-6xl pt-16 pb-12 sm:pt-20">
          <div className="vx-rise flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-vx-muted uppercase sm:text-[12px]">
            <span className="size-1.5 rounded-full bg-vx-accent" />
            {listings ? `${listings.length} verified ${listings.length === 1 ? "channel" : "channels"} available` : "Verified channels"}
          </div>
          <h1 style={{ "--d": "80ms" } as React.CSSProperties} className="vx-rise mt-6 max-w-3xl text-[40px] leading-[1.05] font-normal tracking-[-0.04em] text-vx-ink sm:text-[60px]">
            Channels for sale.
            <br />
            <span className="text-vx-muted">Every one checked first.</span>
          </h1>
          <p style={{ "--d": "160ms" } as React.CSSProperties} className="vx-rise mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body">
            Stats come straight from YouTube and our team reviews every channel before it&apos;s listed. Names stay private until you&apos;re verified and in a deal.
          </p>
          <p style={{ "--d": "220ms" } as React.CSSProperties} className="vx-rise mt-6 flex items-center gap-2 text-[13px] text-vx-muted">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            Every deal closes through escrow.
          </p>
        </div>
      </header>

      <main className="px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <ListingsBrowser listings={listings} failed={failed} />

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {BUYERS_LOUNGE_OPEN ? (
              <div className="rounded-xl border border-vx-line bg-vx-surface p-6">
                <div className="text-[17px] tracking-[-0.02em] text-vx-ink">Want new listings first?</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-vx-body">New channels go to our private Telegram the moment they&apos;re approved.</p>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "brandOutline", size: "pillSm", className: "mt-5" })}>
                  Join the Buyers Lounge <ArrowUpRight aria-hidden />
                </a>
              </div>
            ) : (
              <div className="rounded-xl border border-vx-line bg-vx-surface p-6">
                <div className="text-[17px] tracking-[-0.02em] text-vx-ink">Looking for something specific?</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-vx-body">Tell us your budget and niche, and we&apos;ll bring you matches as they&apos;re verified.</p>
                <Link href="/acquire" className={buttonVariants({ variant: "brandOutline", size: "pillSm", className: "mt-5" })}>
                  Tell us what you want
                </Link>
              </div>
            )}
            <div className="rounded-xl border border-vx-line bg-vx-surface p-6">
              <div className="text-[17px] tracking-[-0.02em] text-vx-ink">Selling a channel?</div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-vx-body">List it free. You only pay commission when it sells.</p>
              <Link href="/#submit" className={buttonVariants({ variant: "brand", size: "pillSm", className: "mt-5" })}>
                List your channel
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
