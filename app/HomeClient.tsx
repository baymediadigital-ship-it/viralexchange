"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Lock, Plus, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Eyebrow, SectionHeader } from "@/components/site/SectionHeader";
import { TelegramIcon } from "@/components/site/Decor";
import { TELEGRAM_URL } from "@/components/site/links";
import { fieldClass } from "@/components/site/form";
import { Input } from "@/components/ui/input";
import { fmt, tidyNiche, usd } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import SellForm from "./SellForm";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

type Deal = {
  channel_name: string | null;
  niche: string | null;
  subscribers_snapshot: number | null;
  closed_price_usd: number | null;
  close_date: string | null;
};

type Listing = { id: string; niche: string | null; subscribers: number | null; monthly_views: number | null; asking_price_usd: number | null };

type PipelineDeal = { niche: string | null; asking_price_usd: number | null; stage: string };

const STAGES = [
  { key: "inquiry", label: "Inquiry" },
  { key: "negotiating", label: "Negotiating" },
  { key: "due_diligence", label: "Due diligence" },
  { key: "closed", label: "Closed" },
];

type Stats = { sold: number; vol: number; listed: number };

const STEPS = [
  { title: "Submit your channel", time: "Under 2 minutes", desc: "Paste your YouTube link. We pull the stats automatically; you add an asking price." },
  { title: "We verify and list", time: "Within 24 hours", desc: "Our team reviews the channel, then shows it to verified buyers. Stats only, never the name." },
  { title: "Negotiate and agree", time: "Within 7 days", desc: "We handle inquiries and negotiation. You only hear from us when an offer is worth considering." },
  { title: "Close through escrow", time: "Within 48 hours", desc: "The buyer funds escrow, you transfer the channel, and the funds are released to you." },
];

const FAQ = [
  {
    q: "Do I pay anything upfront?",
    a: "No. Listing is free and there are no upfront fees. We take a commission only when your channel sells.",
  },
  {
    q: "How do I know I'll actually get paid?",
    a: "Every deal closes through escrow. The buyer's funds are held by a neutral third party before you hand anything over, and are released to you once the transfer is complete.",
  },
  {
    q: "Will buyers see my channel name?",
    a: "Not at first. Buyers see the stats only. Your channel name and link are shared once a buyer is verified as serious and has signed an NDA.",
  },
  {
    q: "How long does a sale take?",
    a: "Listing takes a couple of minutes and we verify within 24 hours. Negotiation usually wraps up within 7 days, and escrow closes within 48 hours of an agreement.",
  },
  {
    q: "How is my valuation worked out?",
    a: "From real market multiples: subscribers, engagement, niche and monthly revenue. It takes about a minute and you don't need an account.",
  },
];

/** Hairline-separated section on the shared 6xl grid. */
function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 px-5 sm:px-6">
      <div className={cn("mx-auto max-w-6xl border-t border-vx-line py-20 sm:py-28", className)}>{children}</div>
    </section>
  );
}

/** Window chrome around product views, labelled honestly like a screenshot. */
function Frame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-vx-line bg-vx-surface", className)}>
      <div className="flex h-10 items-center gap-3 border-b border-vx-line px-4">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-vx-line-strong" />
          <span className="size-2.5 rounded-full bg-vx-line-strong" />
          <span className="size-2.5 rounded-full bg-vx-line-strong" />
        </div>
        <span className="min-w-0 truncate font-mono text-[11px] text-vx-muted">{label}</span>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ tone = "green", children }: { tone?: "green" | "amber" | "neutral"; children: React.ReactNode }) {
  const tones = {
    green: "bg-vx-green-bg text-vx-green",
    amber: "bg-vx-amber-bg text-vx-amber",
    neutral: "bg-vx-subtle text-vx-body",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", tones[tone])}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const DEAL_STEPS = ["Listed to verified buyers", "Buyer signed NDA", "Escrow funded", "Channel transferred", "Seller paid out"];

/** Hero product view: the largest real sale, shown as its deal room. */
function DealRoom({ deal, stats }: { deal: Deal | null; stats: Stats | null }) {
  const cells: [string, React.ReactNode, string][] = [
    ["Sale price", deal ? usd(Number(deal.closed_price_usd)) : "—", "Paid out via escrow"],
    ["Subscribers", deal ? fmt(deal.subscribers_snapshot) : "—", "At time of sale"],
    ["Channels sold", stats ? stats.sold.toLocaleString() : "—", "On ViralExchange"],
    ["Volume brokered", stats ? usd(stats.vol) : "—", "All closed deals"],
  ];
  return (
    <Frame label="Deal room · Illustrative view of a real sale" className="text-left">
      <div className="grid md:grid-cols-[180px_1fr]">
        <aside className="hidden border-r border-vx-line p-3 md:block" aria-hidden>
          {["Overview", "Timeline", "Escrow", "Documents"].map((t, i) => (
            <div key={t} className={cn("rounded-md px-2.5 py-1.5 text-[13px]", i === 0 ? "bg-vx-subtle text-vx-ink" : "text-vx-muted")}>
              {t}
            </div>
          ))}
        </aside>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[11px] text-vx-muted">{tidyNiche(deal?.niche) || " "}</div>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="truncate text-[22px] tracking-[-0.02em] text-vx-ink">
                  {deal ? deal.channel_name : <span className="inline-block h-6 w-36 animate-pulse rounded bg-vx-subtle align-middle" />}
                </span>
                <StatusPill>Closed</StatusPill>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-vx-line px-2.5 py-1 text-[12px] text-vx-body">
              <ShieldCheck className="size-3.5" aria-hidden /> Escrow released
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-vx-line bg-vx-line lg:grid-cols-4">
            {cells.map(([label, value, note]) => (
              <div key={label} className="bg-vx-surface px-4 py-3.5">
                <dt className="text-[12px] text-vx-muted">{label}</dt>
                <dd className="mt-1 font-mono text-[18px] tracking-[-0.02em] text-vx-ink tabular-nums">{value}</dd>
                <dd className="mt-0.5 text-[11px] text-vx-faint">{note}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-6">
            {DEAL_STEPS.map((s, i) => (
              <li key={s} className="relative flex items-center gap-3 py-2 text-[13px]">
                {i < DEAL_STEPS.length - 1 && <span aria-hidden className="absolute top-[22px] left-[9px] h-[calc(100%-8px)] w-px bg-vx-line" />}
                <span className="relative z-10 flex size-[19px] items-center justify-center rounded-full border border-vx-accent/40 bg-vx-green-bg text-vx-green">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-vx-ink">{s}</span>
                <span className="ml-auto font-mono text-[11px] text-vx-faint">Step {String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Frame>
  );
}

/** Seller ↔ escrow ↔ buyer, so the safety model is visible at a glance. */
function EscrowDiagram() {
  const node = "rounded-lg border border-vx-line bg-vx-surface p-4";
  return (
    <div className="vx-reveal rounded-xl border border-vx-line bg-vx-canvas p-5 sm:p-8">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0">
        <div className={node}>
          <div className="text-[13px] text-vx-ink">You, the seller</div>
          <dl className="mt-3 space-y-2 text-[12px]">
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">Channel name</dt><dd className="inline-flex items-center gap-1 text-vx-body"><Lock className="size-3" aria-hidden />Private</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">Stats</dt><dd className="text-vx-body">Shared</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">Upfront fees</dt><dd className="text-vx-body">None</dd></div>
          </dl>
        </div>

        <span aria-hidden className="mx-auto h-6 w-px bg-vx-line-strong md:h-px md:w-10" />

        <div className="rounded-lg border border-vx-accent/35 bg-vx-surface p-4 text-center">
          <span className="mx-auto flex size-8 items-center justify-center rounded-md bg-vx-green-bg text-vx-green">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div className="mt-2.5 text-[13px] text-vx-ink">Escrow</div>
          <p className="mt-1 text-[12px] leading-snug text-vx-muted">Holds the buyer&apos;s funds until the transfer is complete</p>
        </div>

        <span aria-hidden className="mx-auto h-6 w-px bg-vx-line-strong md:h-px md:w-10" />

        <div className={node}>
          <div className="text-[13px] text-vx-ink">Verified buyer</div>
          <dl className="mt-3 space-y-2 text-[12px]">
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">Identity</dt><dd className="text-vx-body">Verified</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">NDA</dt><dd className="text-vx-body">Signed first</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-vx-muted">Funds</dt><dd className="text-vx-body">In escrow</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ClosedDealsTable({ deals }: { deals: Deal[] | null }) {
  const [showAll, setShowAll] = useState(false);
  const rows = deals ? (showAll ? deals : deals.slice(0, 8)) : [];
  const head = "px-3 py-2.5 text-left font-mono text-[11px] font-normal text-vx-muted sm:px-5";
  const cell = "px-3 py-3.5 sm:px-5";
  return (
    <div className="vx-reveal overflow-hidden rounded-xl border border-vx-line bg-vx-surface">
      <table className="w-full table-fixed text-[14px]">
        <thead className="border-b border-vx-line bg-vx-canvas">
          <tr>
            <th className={head}>Channel</th>
            <th className={cn(head, "hidden w-[24%] sm:table-cell")}>Niche</th>
            <th className={cn(head, "w-[96px] text-right sm:w-[130px]")}>Subscribers</th>
            <th className={cn(head, "hidden w-[180px] text-right md:table-cell")}>Status</th>
            <th className={cn(head, "w-[92px] text-right sm:w-[120px]")}>Sold for</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-vx-line">
          {deals === null &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={5} className={cell}>
                  <span className="block h-4 w-full animate-pulse rounded bg-vx-subtle" />
                </td>
              </tr>
            ))}
          {deals?.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-vx-muted">First closed deal coming soon</td>
            </tr>
          )}
          {rows.map((d, i) => (
            <tr key={i} className="transition-colors duration-150 hover:bg-vx-canvas">
              <td className={cell}>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-vx-line bg-vx-canvas text-[12px] text-vx-body">
                    {(d.channel_name || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-vx-ink">{d.channel_name}</div>
                    <div className="truncate text-[12px] text-vx-muted sm:hidden">{tidyNiche(d.niche)}</div>
                  </div>
                </div>
              </td>
              <td className={cn(cell, "hidden truncate text-vx-body sm:table-cell")}>{tidyNiche(d.niche) || "—"}</td>
              <td className={cn(cell, "text-right font-mono text-[13px] text-vx-body tabular-nums")}>{fmt(d.subscribers_snapshot)}</td>
              <td className={cn(cell, "hidden text-right md:table-cell")}>
                <StatusPill>Closed via escrow</StatusPill>
              </td>
              <td className={cn(cell, "text-right font-mono text-[13px] text-vx-ink tabular-nums")}>{usd(Number(d.closed_price_usd))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {deals && deals.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-vx-line py-3 text-[13px] text-vx-muted transition-colors duration-150 hover:bg-vx-canvas hover:text-vx-ink"
        >
          {showAll ? "Show fewer" : `Show all ${deals.length} closed deals`}
        </button>
      )}
    </div>
  );
}

/** The one bright moment on the page: a soft green stage behind the hero product view. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 top-1/4 -bottom-28 bg-[radial-gradient(closest-side,var(--vx-stage),transparent)] sm:-inset-x-24"
      />
      <div className="relative rounded-2xl border border-vx-line bg-[linear-gradient(to_bottom,transparent_30%,var(--vx-stage))] p-1.5 sm:p-2.5">
        <div aria-hidden className="absolute inset-x-12 -top-px h-px bg-[linear-gradient(90deg,transparent,var(--vx-stage-edge),transparent)]" />
        {children}
      </div>
    </div>
  );
}

/** Real closed deals, scrolling. Grows on its own as deals are added. */
function SoldStrip({ deals, sold }: { deals: Deal[] | null; sold: number | null }) {
  const named = (deals || []).filter((d) => d.channel_name);
  if (deals && named.length === 0) return null;
  return (
    <div className="mt-14 sm:mt-16">
      <p className="text-center text-[15px] text-vx-muted">
        {sold ? (
          <>
            <span className="text-vx-ink">{sold} channels</span> sold through ViralExchange, and counting
          </>
        ) : (
          <span className="invisible">Loading</span>
        )}
      </p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {named.length === 0 ? (
          <div className="h-9" />
        ) : (
          <div className="flex w-max animate-vx-marquee gap-3 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...named, ...named].map((d, i) => (
              <div
                key={i}
                aria-hidden={i >= named.length}
                className="flex h-9 shrink-0 items-center gap-2.5 rounded-full border border-vx-line bg-vx-surface pr-4 pl-1.5 text-[13px] whitespace-nowrap"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-vx-subtle text-[11px] text-vx-body">
                  {d.channel_name!.trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-vx-ink">{d.channel_name}</span>
                <span className="font-mono text-[12px] text-vx-muted">{fmt(d.subscribers_snapshot)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureRow({
  title,
  desc,
  points,
  visual,
  flip,
}: {
  title: string;
  desc: string;
  points: [string, string][];
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="vx-reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <h3 className="max-w-md text-[26px] leading-[1.12] font-normal tracking-[-0.03em] text-vx-ink sm:text-[32px]">{title}</h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-vx-body">{desc}</p>
        <ul className="mt-7 flex max-w-md flex-col gap-4">
          {points.map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-vx-accent" strokeWidth={2.25} aria-hidden />
              <div>
                <div className="text-[14px] text-vx-ink">{t}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-vx-muted">{d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(flip && "lg:order-1")}>{visual}</div>
    </div>
  );
}

/** A live listing as it moves through review. The checklist is the standard process, not this listing's history. */
function ListingReview({ listing }: { listing: Listing | null }) {
  const steps: [string, "green" | "amber", string][] = [
    ["Stats pulled from YouTube", "green", "Done"],
    ["Reviewed by our team", "green", "Done"],
    ["Shown to verified buyers", "green", "Live"],
    ["Name shared after NDA", "amber", "On request"],
  ];
  return (
    <Frame label="Listing review · Illustrative view of a live listing">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[16px] text-vx-ink">Verified {tidyNiche(listing?.niche) || "YouTube"} channel</div>
          <StatusPill tone="neutral">Name private</StatusPill>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-vx-line bg-vx-line">
          {[
            ["Subscribers", listing?.subscribers ? fmt(listing.subscribers) : "—"],
            ["Monthly views", listing?.monthly_views ? fmt(listing.monthly_views) : "—"],
            ["Asking", listing?.asking_price_usd ? usd(Number(listing.asking_price_usd)) : "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-vx-surface px-3.5 py-3">
              <dt className="text-[11px] text-vx-muted">{k}</dt>
              <dd className="mt-1 truncate font-mono text-[15px] text-vx-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-5 divide-y divide-vx-line rounded-lg border border-vx-line">
          {steps.map(([t, tone, state]) => (
            <li key={t} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]">
              <span className="text-vx-body">{t}</span>
              <StatusPill tone={tone}>{state}</StatusPill>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/** Real pipeline counts and in-progress deals (names stay masked until close). */
function PipelineView({ pipeline }: { pipeline: PipelineDeal[] | null }) {
  const count = (k: string) => (pipeline ? pipeline.filter((d) => d.stage === k).length : null);
  const active = (pipeline || []).filter((d) => d.stage !== "closed").slice(0, 4);
  const stageLabel = (k: string) => STAGES.find((s) => s.key === k)?.label ?? k;
  return (
    <Frame label="Deal pipeline · Live data">
      <div className="p-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-vx-line bg-vx-line sm:grid-cols-4">
          {STAGES.map((s) => (
            <div key={s.key} className="bg-vx-surface px-3.5 py-3">
              <dt className="text-[11px] text-vx-muted">{s.label}</dt>
              <dd className="mt-1 font-mono text-[18px] text-vx-ink tabular-nums">{count(s.key) ?? "—"}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-5 divide-y divide-vx-line rounded-lg border border-vx-line">
          {pipeline === null &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="px-3.5 py-3">
                <span className="block h-4 animate-pulse rounded bg-vx-subtle" />
              </li>
            ))}
          {pipeline?.length === 0 || (pipeline && active.length === 0) ? (
            <li className="px-3.5 py-3 text-[13px] text-vx-muted">No deals in progress right now</li>
          ) : (
            active.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]">
                <span className="min-w-0 truncate text-vx-ink">Verified {tidyNiche(d.niche) || "YouTube"} channel</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden font-mono text-[12px] text-vx-muted tabular-nums sm:inline">
                    {d.asking_price_usd ? usd(Number(d.asking_price_usd)) : ""}
                  </span>
                  <StatusPill tone="amber">{stageLabel(d.stage)}</StatusPill>
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </Frame>
  );
}

function HeroValuation() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  return (
    <form
      className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const u = url.trim();
        router.push(u ? `/valuation?channel=${encodeURIComponent(u)}` : "/valuation");
      }}
    >
      <label htmlFor="hero-channel" className="sr-only">YouTube channel URL</label>
      <Input
        id="hero-channel"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste your YouTube channel URL"
        className={cn(fieldClass, "sm:flex-1")}
      />
      <button type="submit" className={buttonVariants({ variant: "brand", size: "pill" })}>
        Get a free valuation <ArrowUpRight aria-hidden />
      </button>
    </form>
  );
}

export default function HomeClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [pipeline, setPipeline] = useState<PipelineDeal[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("listings")
        .select("id,niche,subscribers,monthly_views,asking_price_usd", { count: "exact" })
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("deals_public_pipeline")
        .select("channel_name,niche,subscribers_snapshot,asking_price_usd,closed_price_usd,close_date,stage")
        .neq("stage", "lost")
        .order("created_at", { ascending: false }),
    ])
      .then(([listingsRes, dealsRes]) => {
        if (listingsRes.error) throw listingsRes.error;
        if (dealsRes.error) throw dealsRes.error;
        const all = (dealsRes.data || []) as (Deal & PipelineDeal)[];
        const closed = all.filter((d) => d.stage === "closed");
        setDeals(closed);
        setPipeline(all);
        setListings((listingsRes.data || []) as Listing[]);
        setStats({
          sold: closed.length,
          vol: closed.reduce((s, d) => s + (Number(d.closed_price_usd) || 0), 0),
          listed: listingsRes.count || 0,
        });
      })
      .catch((e) => {
        console.error(e);
        setDeals([]);
        setPipeline([]);
      });
  }, []);

  const named = (deals || []).filter((d) => d.channel_name);
  const topDeal = named.length ? named.reduce((a, b) => (Number(b.closed_price_usd) > Number(a.closed_price_usd) ? b : a)) : null;

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      {/* HERO */}
      <header className="overflow-x-clip px-5 sm:px-6">
        <div className="mx-auto max-w-6xl pt-16 pb-20 sm:pt-24 sm:pb-24">
          <div className="vx-rise flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] text-vx-muted uppercase sm:text-[12px]">
            <span className="size-1.5 rounded-full bg-vx-accent" />
            The YouTube channel marketplace
            {stats && stats.sold > 0 && <span className="hidden sm:inline">· {stats.sold} channels sold</span>}
          </div>

          <h1 style={delay(80)} className="vx-rise mt-6 max-w-4xl text-[44px] leading-[1.04] font-normal tracking-[-0.04em] text-vx-ink sm:text-[72px]">
            Buy and sell YouTube channels.
            <br />
            <span className="text-vx-muted">Every deal through escrow.</span>
          </h1>

          <p style={delay(160)} className="vx-rise mt-6 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body">
            We connect channel sellers with verified buyers. Your channel stays private until a buyer is serious, and the money sits in escrow
            until the transfer is done.
          </p>

          <div style={delay(240)} className="vx-rise mt-9 flex flex-col gap-3">
            <HeroValuation />
            <div className="flex flex-wrap items-center gap-2">
              <a href="#submit" className={buttonVariants({ variant: "brandOutline", size: "pillSm" })}>
                Sell a channel
              </a>
              <Link href="/listings" className={buttonVariants({ variant: "ghost", size: "pillSm", className: "text-vx-body hover:bg-vx-subtle hover:text-vx-ink" })}>
                Browse listings <ArrowUpRight aria-hidden />
              </Link>
            </div>
            <p className="mt-2 flex items-center gap-2 text-[13px] text-vx-muted">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
              Escrow on every deal. No upfront fees. Commission only when it sells.
            </p>
          </div>

          <div style={delay(320)} className="vx-rise mt-16 sm:mt-20">
            <Stage>
              <DealRoom deal={topDeal} stats={stats} />
            </Stage>
          </div>

          <SoldStrip deals={deals} sold={stats?.sold ?? null} />
        </div>
      </header>

      {/* 01 TRUST */}
      <Section>
        <SectionHeader
          index="01"
          label="Safety"
          title="Your channel stays private."
          sub="Buyers see the numbers, not the name, until they're verified and have signed an NDA. Money moves through escrow, never straight between strangers."
        />
        <EscrowDiagram />
      </Section>

      {/* 02 WHY */}
      <Section>
        <SectionHeader
          index="02"
          label="Why ViralExchange"
          title={
            <>
              Built so both sides
              <br />
              can trust the deal.
            </>
          }
          sub="Verified listings, a public pipeline, and escrow on every sale."
        />
        <div className="flex flex-col gap-20 sm:gap-24">
          <FeatureRow
            title="Every channel checked before a buyer sees it."
            desc="Stats come straight from YouTube, not from a seller's screenshot. Then our team reviews the channel before it's listed."
            points={[
              ["Stats pulled from YouTube", "Subscribers and views are fetched automatically, so nobody can type in a better number."],
              ["Reviewed within 24 hours", "A real person checks the channel before it goes to buyers."],
              ["Name private until an NDA", "Buyers see the numbers first. The channel name comes after they're verified."],
            ]}
            visual={<ListingReview listing={listings[0] ?? null} />}
          />
          <FeatureRow
            flip
            title="Every deal tracked, in the open."
            desc="Our pipeline is public. Anyone can see what's for sale, what's being negotiated, and what every closed channel actually sold for."
            points={[
              ["A live pipeline", "Deals move from inquiry to close in one place, updated from our tracker."],
              ["Closed prices published", "Every sale shows its real price. No vague \"sold for six figures\"."],
              ["Escrow on every transaction", "A neutral third party holds the money until the transfer is complete."],
            ]}
            visual={<PipelineView pipeline={pipeline} />}
          />
        </div>
      </Section>

      {/* 03 PROCESS */}
      <Section id="process">
        <SectionHeader
          index="03"
          label="How it works"
          title={
            <>
              From link to payout
              <br />
              in four steps.
            </>
          }
          sub="We handle verification, buyers and negotiation, so you can focus on what's next."
        />
        <ol className="vx-reveal grid overflow-hidden rounded-xl border border-vx-line bg-vx-line sm:grid-cols-2 lg:grid-cols-4 [&>li]:bg-vx-surface gap-px">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col p-6">
              <span className="font-mono text-[12px] text-vx-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-[16px] text-vx-ink">{s.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-vx-body">{s.desc}</p>
              <span className="mt-6 font-mono text-[12px] text-vx-muted">{s.time}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 04 CLOSED DEALS */}
      <Section id="deals">
        <SectionHeader
          index="04"
          label="Track record"
          title={
            <>
              Real channels.
              <br />
              Real sales.
            </>
          }
          sub={
            <>
              Pulled live from our deal tracker.
              {stats && stats.sold > 0 && (
                <>
                  {" "}
                  {stats.sold} channels and {usd(stats.vol)} closed so far, every one through escrow.
                </>
              )}
            </>
          }
        />
        <ClosedDealsTable deals={deals} />
        <div className="mt-5 flex justify-end">
          <Link href="/deals" className="inline-flex items-center gap-1 text-[13px] text-vx-muted transition-colors duration-150 hover:text-vx-ink">
            View the full pipeline <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Section>

      {/* 05 BUYERS */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div className="vx-reveal">
            <Eyebrow index="05" label="For buyers" />
            <h2 className="mt-4 text-[34px] leading-[1.08] font-normal tracking-[-0.035em] text-vx-ink sm:text-[46px]">Buyers see new channels first.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-vx-body">
              New listings go to our private Telegram the moment they&apos;re verified. Join free and be first in line.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "brand", size: "pill" })}>
                <TelegramIcon className="size-3.5" /> Join the Buyers Lounge
              </a>
              <Link href="/listings" className={buttonVariants({ variant: "brandOutline", size: "pill" })}>
                Browse listings
              </Link>
              <Link href="/acquire" className={buttonVariants({ variant: "ghost", size: "pill", className: "text-vx-body hover:bg-vx-subtle hover:text-vx-ink" })}>
                Apply to acquire
              </Link>
            </div>
          </div>

          {listings.length > 0 && (
            <Frame label={`Buyers Lounge · ${stats?.listed ?? listings.length} verified listings available`} className="vx-reveal">
              <ul className="divide-y divide-vx-line">
                {listings.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[14px] text-vx-ink">
                        New listing <StatusPill tone="neutral">Name private</StatusPill>
                      </div>
                      <div className="mt-1 truncate text-[12px] text-vx-muted">
                        {[tidyNiche(l.niche), l.subscribers ? `${fmt(l.subscribers)} subscribers` : null].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] text-vx-muted">Asking</div>
                      <div className="font-mono text-[14px] text-vx-ink tabular-nums">{l.asking_price_usd ? usd(Number(l.asking_price_usd)) : "Open to offers"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Frame>
          )}
        </div>
      </Section>

      {/* 06 FAQ */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="vx-reveal">
            <Eyebrow index="06" label="FAQ" />
            <h2 className="mt-4 text-[34px] leading-[1.08] font-normal tracking-[-0.035em] text-vx-ink sm:text-[46px]">Good questions.</h2>
          </div>
          <div className="vx-reveal border-t border-vx-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-vx-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[15px] text-vx-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-4 shrink-0 text-vx-muted transition-transform duration-200 group-open:rotate-45" aria-hidden />
                </summary>
                <p className="max-w-xl pb-5 text-[14px] leading-relaxed text-vx-body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* SELL FORM */}
      <Section id="submit">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <Eyebrow index="07" label="Sell your channel" />
            <h2 className="mt-4 text-[34px] leading-[1.08] font-normal tracking-[-0.035em] text-vx-ink sm:text-[46px]">
              Ready to sell?
              <br />
              <span className="text-vx-muted">Let&apos;s get you paid.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-vx-body">
              Paste your YouTube link and we fetch the stats for you. No spreadsheets, no back-and-forth.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Stats pulled straight from YouTube",
                "Shown to verified buyers within 24 hours",
                "No upfront fees, commission on close only",
                "Escrow on every transaction",
                "Channel name private until the deal stage",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-vx-body">
                  <Check className="size-4 shrink-0 text-vx-accent" strokeWidth={2.25} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="vx-reveal rounded-xl border border-vx-line bg-vx-surface p-6 sm:p-8">
            <SellForm />
          </div>
        </div>
      </Section>

      {/* CLOSING */}
      <section className="px-5 sm:px-6">
        <div className="mx-auto max-w-6xl border-t border-vx-line py-24 text-center sm:py-32">
          <div className="font-mono text-[11px] tracking-[0.06em] text-vx-muted uppercase sm:text-[12px]">Escrow on every deal · No upfront fees</div>
          <h2 className="mx-auto mt-6 max-w-5xl text-[38px] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-vx-ink sm:text-[60px]">
            Buy and sell YouTube channels.
            <br />
            <span className="text-vx-muted">Every deal through escrow.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link href="/valuation" className={buttonVariants({ variant: "brand", size: "pill" })}>
              Get a free valuation <ArrowUpRight aria-hidden />
            </Link>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "brandOutline", size: "pill" })}>
              Join the Buyers Lounge
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
