"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GradientText } from "@/components/site/Decor";
import { Cell, Empty, RowSkeleton, headRow, tableShell } from "@/components/site/DataTable";
import { PUBLIC_LISTING_FIELDS, type PublicListing } from "@/components/site/ListingsBrowser";
import { IconArrowRight, IconCheck, IconLock } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { fmt, nicheLabel, nicheShort, usd } from "@/lib/format";
import { cn } from "@/lib/utils";

type Deal = {
  id: string;
  channel_name: string | null;
  niche: string | null;
  subscribers_snapshot: number | null;
  asking_price_usd: number | null;
  stage: string;
  closed_price_usd: number | null;
  close_date: string | null;
};

// Pipeline order, as shown in the stage summary. "lost" deals stay off the public page.
const STAGES = [
  { key: "inquiry", label: "Inquiry", pill: "bg-vx-subtle text-vx-body", bar: "bg-vx-faint" },
  { key: "negotiating", label: "Negotiating", pill: "bg-vx-amber-bg text-vx-amber", bar: "bg-vx-amber" },
  { key: "due_diligence", label: "Due diligence", pill: "bg-vx-info-bg text-vx-info", bar: "bg-vx-info" },
  { key: "closed", label: "Closed", pill: "bg-vx-green-bg text-vx-green", bar: "bg-vx-green" },
] as const;
const stageOf = (key: string) => STAGES.find((s) => s.key === key) ?? STAGES[0];

const DEAL_COLS = "md:grid-cols-[2fr_1fr_1fr_1fr_1fr]";

export default function DealsClient() {
  const [listings, setListings] = useState<PublicListing[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("listings")
        .select(PUBLIC_LISTING_FIELDS)
        .eq("status", "available")
        .order("created_at", { ascending: false }),
      supabase
        .from("deals_public_pipeline")
        .select("id,channel_name,niche,subscribers_snapshot,asking_price_usd,stage,closed_price_usd,close_date")
        .neq("stage", "lost")
        .order("created_at", { ascending: false }),
    ])
      .then(([l, d]) => {
        if (l.error) throw l.error;
        if (d.error) throw d.error;
        setListings((l.data || []) as PublicListing[]);
        // Live deals first (the actual pipeline), then closed sales; newest first within each.
        const rows = (d.data || []) as Deal[];
        setDeals([...rows.filter((x) => x.stage !== "closed"), ...rows.filter((x) => x.stage === "closed")]);
      })
      .catch((e) => {
        console.error("deals page load failed:", e);
        setFailed(true);
        setListings([]);
        setDeals([]);
      });
  }, []);

  const stats = useMemo(() => {
    if (!listings || !deals) return null;
    const closed = deals.filter((d) => d.stage === "closed");
    return {
      listed: listings.length,
      active: deals.length - closed.length,
      closed: closed.length,
      vol: closed.reduce((s, d) => s + (Number(d.closed_price_usd) || 0), 0),
    };
  }, [listings, deals]);

  const byStage = useMemo(() => STAGES.map((s) => ({ ...s, count: (deals || []).filter((d) => d.stage === s.key).length })), [deals]);
  const totalDeals = deals?.length ?? 0;

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 text-center sm:px-6 sm:pt-20">
          <div className="vx-rise inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-vx-muted uppercase sm:text-[12px]">
            <span className="size-1.5 animate-pulse rounded-full bg-vx-accent motion-reduce:animate-none" />
            Live · Straight from our deal tracker
          </div>
          <h1
            style={{ "--d": "80ms" } as React.CSSProperties}
            className="vx-rise mt-6 text-[42px] leading-[1.05] font-normal tracking-[-0.04em] text-vx-ink sm:text-[60px]"
          >
            Deal <GradientText>pipeline</GradientText>
          </h1>
          <p style={{ "--d": "160ms" } as React.CSSProperties} className="vx-rise mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body">
            Every channel available right now, every deal in progress, and every sale we&apos;ve closed.
          </p>

          <dl style={{ "--d": "240ms" } as React.CSSProperties} className="vx-rise mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Available now", stats ? String(stats.listed) : "—"],
              ["Deals in progress", stats ? String(stats.active) : "—"],
              ["Closed deals", stats ? String(stats.closed) : "—"],
              ["Volume closed", stats ? usd(stats.vol) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-vx-surface px-5 py-4 text-left ring-1 ring-vx-line">
                <dd className="text-[26px] font-normal tracking-[-0.02em] text-vx-ink tabular-nums">{value}</dd>
                <dt className="mt-0.5 text-[13px] text-vx-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-6">
        {/* LISTINGS LIVE ON THEIR OWN PAGE */}
        <section className="vx-reveal pt-10">
          <Link
            href="/listings"
            className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-vx-line bg-vx-surface px-5 py-5 transition-colors duration-150 hover:border-vx-line-strong sm:px-6"
          >
            <div>
              <div className="text-[18px] tracking-[-0.02em] text-vx-ink">
                {listings ? `${listings.length} verified ${listings.length === 1 ? "channel" : "channels"} for sale` : "Verified channels for sale"}
              </div>
              <div className="mt-0.5 text-[14px] text-vx-muted">Browse by niche, subscribers and asking price. Names stay private until you&apos;re in a deal.</div>
            </div>
            <span className={buttonVariants({ variant: "brand", size: "pill" })}>
              Browse listings <IconArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>

        {/* DEAL TRACKER */}
        <section id="tracker" className="scroll-mt-24 pt-20">
          <div className="vx-reveal flex flex-col gap-1.5">
            <h2 className="text-[28px] leading-tight font-normal tracking-[-0.035em] text-vx-ink sm:text-[34px]">
              Deal <GradientText>tracker</GradientText>
            </h2>
            <p className="text-[15px] text-vx-body">Where every deal sits right now. Channel names are revealed once a sale closes.</p>
          </div>

          {/* stage summary */}
          <div className="vx-reveal mt-6 rounded-xl bg-vx-surface p-5 ring-1 ring-vx-line sm:p-6">
            <div className="flex h-2 overflow-hidden rounded-full bg-vx-subtle" role="img" aria-label={byStage.map((s) => `${s.label}: ${s.count}`).join(", ")}>
              {totalDeals > 0 &&
                byStage.map((s) => s.count > 0 && <div key={s.key} className={cn("h-full first:rounded-l-full last:rounded-r-full", s.bar)} style={{ width: `${(s.count / totalDeals) * 100}%` }} />)}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {byStage.map((s) => (
                <div key={s.key} className="flex items-center gap-2.5">
                  <span className={cn("size-2.5 shrink-0 rounded-full", s.bar)} />
                  <dt className="text-[14px] text-vx-body">{s.label}</dt>
                  <dd className="ml-auto text-[15px] font-medium text-vx-ink tabular-nums sm:ml-1">{deals ? s.count : "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={cn("vx-reveal mt-4", tableShell)}>
            <div className={cn(headRow, DEAL_COLS, "gap-4")}>
              <div>Channel</div>
              <div>Subscribers</div>
              <div>Asking price</div>
              <div>Stage</div>
              <div>Closed at</div>
            </div>
            {deals === null ? (
              <div className="divide-y divide-vx-line">
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : failed ? (
              <Empty>We couldn&apos;t load the deal tracker. Refresh the page to try again.</Empty>
            ) : deals.length === 0 ? (
              <Empty>No deals in the pipeline yet.</Empty>
            ) : (
              <ul className="divide-y divide-vx-line">
                {deals.map((d) => {
                  const st = stageOf(d.stage);
                  const closed = d.stage === "closed";
                  return (
                    <li key={d.id} className={cn("grid grid-cols-3 items-center gap-x-4 gap-y-4 px-5 py-5 md:gap-4 md:px-6 md:py-4", DEAL_COLS)}>
                      <div className="col-span-3 flex min-w-0 items-center gap-3 md:col-span-1">
                        {closed ? (
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-vx-line bg-vx-canvas text-[13px] text-vx-body">
                            {(d.channel_name || "?").trim().charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vx-subtle text-vx-muted">
                            <IconLock size={16} />
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-medium text-vx-ink">{closed ? d.channel_name : `Verified ${nicheShort(d.niche)} channel`}</div>
                          <div className="truncate text-[13px] text-vx-muted">{nicheLabel(d.niche)}</div>
                        </div>
                      </div>
                      <Cell label="Subscribers">{fmt(d.subscribers_snapshot)}</Cell>
                      <Cell label="Asking price">{usd(d.asking_price_usd)}</Cell>
                      <div>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap", st.pill)}>
                          {closed && <IconCheck size={12} />}
                          {st.label}
                        </span>
                      </div>
                      <Cell label="Closed at" className={cn("col-span-3 md:col-span-1", !closed && "hidden md:block")}>
                        {closed ? <span className="text-vx-green">{usd(Number(d.closed_price_usd))}</span> : <span className="font-normal text-vx-faint">—</span>}
                      </Cell>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="pt-20">
          <div className="vx-reveal relative overflow-hidden rounded-xl bg-vx-bold-1 px-6 py-16 text-center text-white sm:px-12">
            <div className="relative mx-auto flex max-w-xl flex-col items-center">
              <h2 className="text-[30px] leading-[1.1] font-normal tracking-[-0.035em] text-balance sm:text-[40px]">Want your channel in this pipeline?</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-pretty text-white/80">
                Submit it today. We verify and list it to our buyer network within 24 hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link href="/#submit" className={buttonVariants({ variant: "light", size: "pill" })}>
                  Submit my channel <IconArrowRight size={16} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
                </Link>
                <Link
                  href="/valuation"
                  className={buttonVariants({ size: "pill", className: "bg-white/10 text-white ring-1 ring-white/25 hover:-translate-y-px hover:bg-white/15" })}
                >
                  Get a free valuation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
