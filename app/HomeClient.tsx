"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Eyebrow, SectionHeader } from "@/components/site/SectionHeader";
import { GradientText, IconTile, Rings, TelegramIcon } from "@/components/site/Decor";
import { TELEGRAM_URL } from "@/components/site/links";
import {
  IconArrowRight,
  IconBanknote,
  IconBolt,
  IconCheck,
  IconCheckCircle,
  IconClock,
  IconDocument,
  IconHandshake,
  IconLock,
  IconShieldCheck,
} from "@/components/Icon";
import { fmt, usd } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import SellForm from "./SellForm";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

type Deal = {
  channel_name: string | null;
  niche: string | null;
  subscribers_snapshot: number | null;
  closed_price_usd: number | null;
  close_date: string | null;
};

type Stats = { sold: number; vol: number; listed: number };

function CountUp({ value, format }: { value: number | null; format: (n: number) => string }) {
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    if (value === null) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = duration ? Math.min((now - start) / duration, 1) : 1;
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown === null ? "—" : format(Math.round(shown))}</>;
}

const money = (n: number) => "$" + n.toLocaleString();
const plain = (n: number) => n.toLocaleString();

const STEPS = [
  { icon: IconDocument, title: "Submit your channel", time: "Under 2 minutes", desc: "Paste your YouTube link and our tool auto-fetches all stats instantly. Add your asking price and we take it from there." },
  { icon: IconCheckCircle, title: "We verify & list", time: "Within 24 hours", desc: "Our team reviews your channel. Once verified, it goes live to our network of active buyers immediately." },
  { icon: IconHandshake, title: "Negotiate & agree", time: "Within 7 days", desc: "We handle buyer inquiries and negotiation. You only hear from us when there's an offer worth considering." },
  { icon: IconBanknote, title: "Close via escrow", time: "Within 48 hours", desc: "Funds are held safely in escrow until the channel transfer is complete. Then you get paid." },
];

const FEATURES = [
  { icon: IconLock, title: "Privacy first", stat: "100%", statLabel: "private until deal stage", desc: "Your channel name and link stay private. Buyers see stats only until they're verified serious and sign an NDA." },
  { icon: IconBolt, title: "Instant valuation", stat: "60s", statLabel: "to get your valuation", desc: "A data-driven estimate in 60 seconds, based on real market multiples — subscribers, engagement, niche, and revenue." },
  { icon: IconShieldCheck, title: "Secure escrow", stat: "Zero", statLabel: "failed transactions", desc: "Every deal closes through verified escrow. A neutral third party holds funds until the transfer is complete." },
];

const DEAL_STEPS = ["Listed", "Buyer matched", "Escrow funded", "Transferred"];

function DealShowcase({ deal }: { deal: Deal | null }) {
  return (
    <div style={delay(200)} className="vx-rise relative mx-auto w-full max-w-[420px]">
      <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(var(--vx-shadow-rgb),0.3),transparent)]" />

      <div className="relative overflow-hidden rounded-[28px] bg-vx-surface shadow-[0_40px_80px_-30px_rgba(var(--vx-shadow-rgb),0.45)] ring-1 ring-vx-accent/10">
        <div className="relative h-28 overflow-hidden bg-linear-to-br from-vx-bold-1 via-vx-bold-2 to-vx-bold-3">
          <div aria-hidden className="absolute -top-16 -right-10 size-56 rounded-full border border-white/25" />
          <div aria-hidden className="absolute -top-8 -right-2 size-40 rounded-full border border-white/20" />
          <div aria-hidden className="absolute top-0 left-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_70%)]" />
          <div className="absolute top-5 left-6 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1 text-[12px] font-semibold text-white">
            <IconCheck size={12} /> Sold on ViralExchange
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative -mt-8 flex size-16 items-center justify-center rounded-2xl bg-vx-surface text-[24px] font-semibold text-vx-accent shadow-[0_10px_24px_-10px_rgba(16,24,40,0.35)] ring-4 ring-vx-surface">
            {deal?.channel_name?.trim().charAt(0).toUpperCase() ?? ""}
          </div>
          <div className="mt-4 text-[12px] font-semibold tracking-[0.06em] text-vx-accent uppercase">{deal?.niche || " "}</div>
          <div className="mt-0.5 text-[22px] font-semibold tracking-[-0.02em] text-vx-ink">
            {deal ? deal.channel_name : <span className="inline-block h-6 w-40 animate-pulse rounded-md bg-vx-subtle" />}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-vx-subtle px-4 py-3">
              <dt className="text-[12px] text-vx-muted">Subscribers</dt>
              <dd className="text-[18px] font-bold text-vx-ink">{deal ? fmt(deal.subscribers_snapshot) : "—"}</dd>
            </div>
            <div className="rounded-2xl bg-vx-green-bg px-4 py-3">
              <dt className="text-[12px] text-vx-green/80">Sale price</dt>
              <dd className="text-[18px] font-bold text-vx-green">{deal ? usd(Number(deal.closed_price_usd)) : "—"}</dd>
            </div>
          </dl>

          <ol className="mt-6 grid grid-cols-4">
            {DEAL_STEPS.map((s, i) => (
              <li key={s} className="relative flex flex-col items-center text-center">
                {i > 0 && <span aria-hidden className="absolute top-[11px] right-1/2 z-0 h-0.5 w-full bg-linear-to-r from-vx-accent-bright to-vx-accent" />}
                <span className="relative z-10 flex size-6 items-center justify-center rounded-full bg-linear-to-b from-vx-accent-bright to-vx-accent text-vx-on-accent ring-4 ring-vx-surface">
                  <IconCheck size={12} />
                </span>
                <span className="mt-2 text-[11px] leading-tight font-medium text-vx-muted">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div style={delay(550)} className="vx-rise absolute -top-6 -left-10 hidden items-center gap-2 rounded-2xl bg-vx-surface px-3.5 py-2.5 text-[13px] font-semibold text-vx-ink shadow-vx-float ring-1 ring-vx-line sm:flex">
        <span className="flex size-7 items-center justify-center rounded-full bg-vx-accent-soft text-vx-accent">
          <IconShieldCheck size={14} />
        </span>
        Escrow protected
      </div>
      <div style={delay(700)} className="vx-rise absolute -right-3 -bottom-8 hidden items-center xl:-right-8 gap-2 rounded-2xl bg-vx-surface px-3.5 py-2.5 text-[13px] font-semibold text-vx-ink shadow-vx-float ring-1 ring-vx-line sm:flex">
        <span className="flex size-7 items-center justify-center rounded-full bg-vx-green-bg text-vx-green">
          <IconBanknote size={14} />
        </span>
        Seller paid out
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "available"),
      supabase
        .from("deals_public_pipeline")
        .select("channel_name,niche,subscribers_snapshot,closed_price_usd,close_date")
        .eq("stage", "closed")
        .order("created_at", { ascending: false }),
    ])
      .then(([listingsRes, dealsRes]) => {
        if (listingsRes.error) throw listingsRes.error;
        if (dealsRes.error) throw dealsRes.error;
        const closed = (dealsRes.data || []) as Deal[];
        setDeals(closed);
        setStats({
          sold: closed.length,
          vol: closed.reduce((s, d) => s + (Number(d.closed_price_usd) || 0), 0),
          listed: listingsRes.count || 0,
        });
      })
      .catch((e) => {
        console.error(e);
        setDeals([]);
      });
  }, []);

  const named = (deals || []).filter((d) => d.channel_name);
  const topDeal = named.length ? named.reduce((a, b) => (Number(b.closed_price_usd) > Number(a.closed_price_usd) ? b : a)) : null;
  const marquee = named.slice(0, 20);

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      {/* HERO */}
      <header className="relative overflow-hidden bg-linear-to-b from-vx-hero-1 via-vx-hero-2 to-vx-canvas">
        <div aria-hidden className="pointer-events-none absolute -top-56 -left-56 size-[760px] bg-[radial-gradient(closest-side,var(--vx-glow-1),var(--vx-glow-1)_35%,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -top-36 right-[-15%] size-[700px] bg-[radial-gradient(closest-side,var(--vx-glow-2),var(--vx-glow-2)_35%,transparent)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pt-16 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-24 lg:pb-28">
          <div className="text-center lg:text-left">
            <div className="vx-rise inline-flex items-center gap-2 rounded-full bg-vx-surface/90 py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold text-vx-body shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-vx-accent/10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-vx-green-bg px-2 py-0.5 text-[12px] text-vx-green">
                <span className="size-1.5 animate-pulse rounded-full bg-vx-green motion-reduce:animate-none" />
                Live
              </span>
              The #1 YouTube channel marketplace
            </div>

            <h1 style={delay(80)} className="vx-rise mt-7 text-[42px] leading-[1.05] font-semibold tracking-[-0.045em] text-balance text-vx-ink sm:text-[60px]">
              Buy &amp; sell YouTube channels <GradientText>with confidence</GradientText>
            </h1>

            <p style={delay(160)} className="vx-rise mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-pretty text-vx-body sm:text-[18px] lg:mx-0">
              We connect serious channel sellers with verified buyers. Secure escrow, fast closings, zero hassle.
            </p>

            <div style={delay(240)} className="vx-rise mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a href="#submit" className={buttonVariants({ variant: "brand", size: "pill", className: "w-full max-w-xs sm:w-auto" })}>
                Sell my channel <IconArrowRight size={16} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "brandOutline", size: "pill", className: "w-full max-w-xs border-transparent ring-1 ring-vx-line sm:w-auto" })}
              >
                <TelegramIcon className="size-4 text-vx-accent" /> Browse listings
              </a>
            </div>

            <dl style={delay(320)} className="vx-rise mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-vx-accent/10 pt-8 text-left sm:grid-cols-4">
              {[
                ["Channels sold", <CountUp key="s" value={stats?.sold ?? null} format={plain} />],
                ["Volume brokered", <CountUp key="v" value={stats?.vol ?? null} format={money} />],
                ["Active listings", <CountUp key="l" value={stats?.listed ?? null} format={plain} />],
                ["Avg response", "24h"],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dd className="text-[24px] font-semibold tracking-[-0.02em] text-vx-ink">{value}</dd>
                  <dt className="mt-0.5 text-[13px] text-vx-muted">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <DealShowcase deal={topDeal} />
        </div>
      </header>

      {/* RECENTLY SOLD */}
      {(deals === null || marquee.length > 0) && (
        <div className="flex items-center border-y border-vx-line bg-vx-surface">
          <div className="hidden shrink-0 px-6 text-[12px] font-bold tracking-[0.08em] text-vx-muted uppercase sm:block">Recently sold</div>
          <div className="relative flex-1 overflow-hidden py-3.5 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            {marquee.length === 0 ? (
              <div className="h-6" />
            ) : (
            <div className="flex w-max animate-vx-marquee gap-8 hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...marquee, ...marquee].map((d, i) => (
                <div key={i} aria-hidden={i >= marquee.length} className="flex shrink-0 items-center gap-2 text-[14px] whitespace-nowrap">
                  <span className="flex size-6 items-center justify-center rounded-full bg-vx-accent-soft text-[11px] font-bold text-vx-accent">
                    {d.channel_name!.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-vx-ink">{d.channel_name}</span>
                  <span className="font-semibold text-vx-green">{usd(Number(d.closed_price_usd))}</span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      )}

      {/* PROCESS */}
      <section id="process" className="scroll-mt-20 px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="How it works"
            detail="4 steps"
            title="Simple process,"
            highlight="serious results"
            sub="From submission to payment — we handle everything so you can focus on what's next."
          />
          <ol className="vx-reveal relative grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-linear-to-r from-transparent via-vx-accent/35 to-transparent lg:block" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex flex-col items-center text-center">
                <IconTile className="bg-linear-to-b from-vx-surface to-vx-accent-soft">
                  <s.icon size={20} />
                </IconTile>
                <div className="mt-5 text-[12px] font-semibold tracking-[0.14em] text-vx-accent uppercase">Step 0{i + 1}</div>
                <h3 className="mt-1.5 text-[17px] font-bold text-vx-ink">{s.title}</h3>
                <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-vx-body">{s.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-vx-surface px-3 py-1 text-[12px] font-semibold text-vx-body ring-1 ring-vx-line">
                  <IconClock size={12} />
                  {s.time}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-linear-to-b from-vx-canvas via-vx-band to-vx-canvas px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why ViralExchange"
            detail="Our edge"
            title="Built for deals that"
            highlight="actually close"
            sub="Every feature designed to protect your channel, your privacy, and your payout."
          />
          <div className="vx-reveal grid gap-6 md:grid-cols-3">
            {FEATURES.map((ft) => (
              <div key={ft.title} className="flex flex-col rounded-3xl bg-vx-surface p-8 shadow-vx-card ring-1 ring-vx-line/70">
                <IconTile>
                  <ft.icon size={20} />
                </IconTile>
                <h3 className="mt-6 text-[18px] font-bold text-vx-ink">{ft.title}</h3>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-vx-body">{ft.desc}</p>
                <div className="mt-7 flex items-baseline gap-2">
                  <GradientText className="text-[32px] font-semibold tracking-[-0.02em]">{ft.stat}</GradientText>
                  <span className="text-[13px] text-vx-muted">{ft.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSED DEALS */}
      <section id="deals" className="scroll-mt-20 px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Track record"
            detail={stats ? `${usd(stats.vol)} closed` : "Recent closes"}
            title="Real channels,"
            highlight="real transactions"
            sub="Updated live from our deal tracker. Every sale verified and completed through escrow."
          />
          <div className="vx-reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals === null && <p className="col-span-full py-10 text-center text-[14px] text-vx-muted">Loading deals...</p>}
            {deals?.length === 0 && <p className="col-span-full py-10 text-center text-[14px] text-vx-muted">First closed deal coming soon</p>}
            {deals?.slice(0, 6).map((d, i) => (
              <article
                key={i}
                className="group rounded-3xl bg-vx-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-vx-line transition-all hover:-translate-y-0.5 hover:shadow-vx-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-vx-accent-bright to-vx-accent-light text-[15px] font-bold text-vx-on-accent">
                    {(d.channel_name || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[16px] font-bold text-vx-ink">{d.channel_name}</h3>
                    <div className="text-[12px] font-medium text-vx-muted">{d.niche || "Channel"}</div>
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-[12px] text-vx-muted">Sold for</div>
                    <div className="text-[24px] font-semibold tracking-[-0.02em] text-vx-ink">{usd(Number(d.closed_price_usd))}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-vx-muted">Subscribers</div>
                    <div className="text-[15px] font-bold text-vx-body">{fmt(d.subscribers_snapshot)}</div>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-1.5 border-t border-vx-line pt-4 text-[12px] font-semibold text-vx-green">
                  <IconCheck size={13} /> Closed via escrow{d.close_date ? ` · ${d.close_date}` : ""}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/deals" className={buttonVariants({ variant: "brandOutline", size: "pillSm", className: "border-transparent ring-1 ring-vx-line" })}>
              View full pipeline <IconArrowRight size={14} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BUYERS LOUNGE */}
      <section className="px-5 pb-24 sm:px-6 sm:pb-28">
        <div className="vx-reveal relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-linear-to-br from-vx-bold-1 via-vx-bold-2 to-vx-bold-3 px-6 py-16 text-center text-white shadow-[0_40px_80px_-40px_rgba(var(--vx-shadow-rgb),0.8)] sm:px-12 sm:py-20">
          <div aria-hidden className="absolute -top-44 left-1/2 size-[760px] -translate-x-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--vx-accent-light)_40%,transparent),transparent)]" />
          <Rings size={1100} className="top-1/2 hidden -translate-y-1/2 text-white opacity-40 sm:block" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-white/20">
              <TelegramIcon className="size-3.5" /> Buyers Lounge · Join free
            </div>
            <h2 className="mt-6 text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-balance sm:text-[44px]">
              First access to every new verified listing
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-pretty text-white/80">
              New channels are posted to our private Telegram the moment they&apos;re verified. Be first in line before anyone else sees them.
            </p>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "light", size: "pill", className: "mt-9" })}>
              <TelegramIcon className="size-4" /> Join the Buyers Lounge
            </a>
            <p className="mt-5 text-[14px] text-white/70">
              Already a member?{" "}
              <Link href="/deals" className="font-semibold text-white underline-offset-4 hover:underline">
                View the live pipeline →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* SELL FORM */}
      <section id="submit" className="scroll-mt-20 border-t border-vx-line bg-linear-to-b from-vx-surface to-vx-band px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <Eyebrow label="Sell your channel" detail="Free listing" />
            <h2 className="mt-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-vx-ink sm:text-[44px]">
              Ready to exit? <GradientText>Let&apos;s get you paid.</GradientText>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-vx-body">
              Paste your YouTube link and our tool fetches all the stats automatically. No spreadsheets, no back-and-forth.
            </p>
            <ul className="mt-8 flex flex-col gap-3.5">
              {[
                "Stats auto-fetched from YouTube API",
                "Listed to verified buyers within 24 hours",
                "Zero upfront fees — commission on close only",
                "Secure escrow on every transaction",
                "Channel details kept private until deal stage",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] text-vx-ink">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-vx-accent-bright to-vx-accent text-vx-on-accent">
                    <IconCheck size={12} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="vx-reveal rounded-[28px] bg-vx-surface p-6 shadow-[0_40px_80px_-40px_rgba(var(--vx-shadow-rgb),0.35)] ring-1 ring-vx-line/80 sm:p-8">
            <SellForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
