"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GradientText, TelegramIcon } from "@/components/site/Decor";
import { TELEGRAM_URL } from "@/components/site/links";
import { fieldClass } from "@/components/site/form";
import { IconArrowRight, IconCheck, IconLock, IconSearch } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { fmt, usd, tidyNiche } from "@/lib/format";
import { cn } from "@/lib/utils";

type Listing = { id: string; niche: string | null; subscribers: number | null; monthly_views: number | null; asking_price_usd: number | null };
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

// Niches are typed by hand ("MOVIES", "anime"); tidy all-caps/all-lowercase ones,
// leave deliberately mixed-case ones ("Tourism and RV") alone.
const tidy = tidyNiche;
const nicheLabel = (n: string | null) => (n ? tidy(n) : "—");
const nicheShort = (n: string | null) => (n ? tidy(n.split(/[/,]/)[0]) : "Channel");

/** Horizontal scroller that fades whichever edge still has more content, and hides its scrollbar. */
function FadeScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft > 2, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  const mask = `linear-gradient(to right, ${edges.start ? "transparent, black 40px" : "black, black"}, ${edges.end ? "black calc(100% - 40px), transparent" : "black, black"})`;
  return (
    <div
      ref={ref}
      className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  );
}

function Cell({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[12px] text-vx-muted md:hidden">{label}</div>
      <div className="text-[15px] font-medium text-vx-ink tabular-nums">{children}</div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-5 md:px-6">
      <div className="size-10 animate-pulse rounded-xl bg-vx-subtle" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 animate-pulse rounded bg-vx-subtle" />
        <div className="h-3 w-24 animate-pulse rounded bg-vx-subtle" />
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-12 text-center text-[14px] text-vx-muted">{children}</p>;
}

const tableShell = "overflow-hidden rounded-xl bg-vx-surface ring-1 ring-vx-line";
const headRow = "hidden border-b border-vx-line px-6 py-3 bg-vx-canvas font-mono text-[11px] text-vx-muted md:grid";
const LISTING_COLS = "md:grid-cols-[2fr_1fr_1fr_1fr_0.9fr_auto]";
const DEAL_COLS = "md:grid-cols-[2fr_1fr_1fr_1fr_1fr]";

export default function DealsClient() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [niche, setNiche] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      // No channel_name: listings stay anonymous until the deal stage.
      supabase
        .from("listings")
        .select("id,niche,subscribers,monthly_views,asking_price_usd")
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
        setListings((l.data || []) as Listing[]);
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

  // Filter chips come from the niches actually listed, most common first.
  const chips = useMemo(() => {
    const tally = new Map<string, { label: string; count: number }>();
    for (const r of listings || []) {
      const label = nicheShort(r.niche);
      const key = label.toLowerCase();
      tally.set(key, { label, count: (tally.get(key)?.count ?? 0) + 1 });
    }
    const list = [...tally.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return [{ key: "all", label: "All niches", count: listings?.length ?? 0 }, ...list];
  }, [listings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (listings || []).filter((r) => {
      const n = (r.niche || "").toLowerCase();
      return (niche === "all" || nicheShort(r.niche).toLowerCase() === niche) && (!q || n.includes(q));
    });
  }, [listings, niche, query]);

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
        {/* AVAILABLE LISTINGS */}
        <section id="listings" className="scroll-mt-24 pt-10">
          <div className="vx-reveal flex flex-col gap-1.5">
            <h2 className="text-[28px] leading-tight font-normal tracking-[-0.035em] text-vx-ink sm:text-[34px]">
              Available <GradientText>listings</GradientText>
            </h2>
            <p className="text-[15px] text-vx-body">Verified channels open for acquisition. Names stay private until you&apos;re in a deal.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <FadeScroller className="min-w-0 flex-1">
              <div className="flex w-max gap-0.5 rounded-lg border border-vx-line bg-vx-subtle p-1" role="group" aria-label="Filter by niche">
                {chips.map((n) => (
                  <button
                    key={n.key}
                    type="button"
                    aria-pressed={niche === n.key}
                    onClick={() => setNiche(n.key)}
                    className={cn(
                      "flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-[13px] whitespace-nowrap transition-[color,background-color,box-shadow,scale] duration-150 active:scale-[0.97]",
                      niche === n.key
                        ? "bg-vx-surface text-vx-ink shadow-[0_1px_2px_rgba(var(--vx-shadow-rgb),0.08)] ring-1 ring-vx-line"
                        : "text-vx-muted hover:text-vx-ink",
                    )}
                  >
                    {n.label}
                    <span className={cn("font-mono text-[11px] tabular-nums", niche === n.key ? "text-vx-muted" : "text-vx-faint")}>
                      {listings ? n.count : ""}
                    </span>
                  </button>
                ))}
              </div>
            </FadeScroller>
            <div className="relative w-full shrink-0 lg:w-60">
              <IconSearch size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-vx-faint" />
              <Input
                aria-label="Search listings by niche"
                placeholder="Search by niche"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(fieldClass, "h-[42px] pl-9")}
              />
            </div>
          </div>

          <div className={cn("vx-reveal mt-5", tableShell)}>
            <div className={cn(headRow, LISTING_COLS, "gap-4")}>
              <div>Channel</div>
              <div>Subscribers</div>
              <div>Monthly views</div>
              <div>Asking price</div>
              <div>Status</div>
              <div className="w-[152px]" />
            </div>
            {listings === null ? (
              <div className="divide-y divide-vx-line">
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : failed ? (
              <Empty>We couldn&apos;t load listings. Refresh the page to try again.</Empty>
            ) : visible.length === 0 ? (
              <Empty>{listings.length === 0 ? "No channels are listed right now. New ones land in the Buyers Lounge first." : "No listings match that filter."}</Empty>
            ) : (
              <ul className="divide-y divide-vx-line">
                {visible.map((r) => (
                  <li key={r.id} className={cn("grid grid-cols-3 items-center gap-x-4 gap-y-4 px-5 py-5 transition-colors hover:bg-vx-subtle/60 md:gap-4 md:px-6 md:py-4", LISTING_COLS)}>
                    <div className="col-span-3 flex min-w-0 items-center gap-3 md:col-span-1">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vx-accent-soft text-vx-accent">
                        <IconLock size={16} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium text-vx-ink">Verified {nicheShort(r.niche)} channel</div>
                        <div className="truncate text-[13px] text-vx-muted">{nicheLabel(r.niche)}</div>
                      </div>
                    </div>
                    <Cell label="Subscribers">{fmt(r.subscribers)}</Cell>
                    <Cell label="Monthly views">{fmt(r.monthly_views)}</Cell>
                    <Cell label="Asking price">{usd(r.asking_price_usd)}</Cell>
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-vx-green-bg px-2.5 py-1 text-[12px] font-medium text-vx-green">
                        <span className="size-1.5 rounded-full bg-vx-green" />
                        Available
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end md:col-span-1">
                      <a
                        href={TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "brandOutline", size: "pillSm", className: "h-9 w-[152px] justify-center border-transparent px-4 text-[13px] ring-1 ring-vx-line" })}
                      >
                        <TelegramIcon className="size-3.5 text-vx-accent" />
                        Express interest
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
