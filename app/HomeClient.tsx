"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Eyebrow, SectionHeader } from "@/components/site/SectionHeader";
import { Rings, TelegramIcon } from "@/components/site/Decor";
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
  { icon: IconDocument, title: "Submit your channel", time: "Under 2 minutes", desc: "Paste your YouTube link and our tool auto-fetches all stats instantly. Fill in your asking price and we take it from there." },
  { icon: IconCheckCircle, title: "We verify & list", time: "Within 24 hours", desc: "Our team reviews your channel within 24 hours. Once verified, it goes live to our network of active buyers immediately." },
  { icon: IconHandshake, title: "Negotiate & agree", time: "Within 7 days", desc: "We handle all buyer inquiries and negotiations on your behalf. You only hear from us when there's an offer worth considering." },
  { icon: IconBanknote, title: "Close via escrow", time: "Within 48 hours", desc: "All deals close through secure escrow. Funds held safely until the channel transfer is complete." },
];

const FEATURES = [
  { icon: IconLock, title: "Privacy first", stat: "100%", statLabel: "private until deal stage", desc: "Your channel name and link stay completely private. Buyers see stats only until they are verified serious and sign an NDA." },
  { icon: IconBolt, title: "Instant valuation", stat: "60s", statLabel: "to get your valuation", desc: "Get a data-driven estimate in 60 seconds based on real market multiples — subscribers, engagement, niche, and revenue." },
  { icon: IconShieldCheck, title: "Secure escrow", stat: "Zero", statLabel: "failed transactions", desc: "Every deal closes through verified escrow. Funds are held safely by a neutral third party until the channel transfer is complete." },
];

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

  const marquee = (deals || []).slice(0, 20).filter((d) => d.channel_name);

  return (
    <div data-theme="light" className="min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[repeating-conic-gradient(from_200deg_at_50%_340px,transparent_0deg_7deg,rgba(37,94,211,0.07)_7deg_7.25deg)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_900px_560px_at_50%_-80px,rgba(37,94,211,0.14),transparent_70%)]" />
        <Rings size={900} className="-top-[220px] hidden sm:block" />

        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 sm:px-6 sm:pt-24">
          {/* floating live-stat cards */}
          <div className="absolute top-28 right-4 hidden w-52 rotate-[2deg] rounded-2xl border border-vx-line bg-white p-4 shadow-vx-float lg:block xl:-right-6">
            <div className="text-[11px] font-bold tracking-[0.06em] text-vx-muted uppercase">Transaction volume</div>
            <div className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-vx-ink">
              <CountUp value={stats?.vol ?? null} format={money} />
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-vx-green-bg px-2 py-0.5 text-[12px] font-semibold text-vx-green">
              <IconShieldCheck size={12} /> Escrow-closed
            </div>
          </div>
          <div className="absolute bottom-20 left-4 hidden w-48 -rotate-[3deg] rounded-2xl border border-vx-line bg-white p-4 shadow-vx-float lg:block xl:-left-6">
            <div className="text-[11px] font-bold tracking-[0.06em] text-vx-muted uppercase">Active listings</div>
            <div className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-vx-ink">
              <CountUp value={stats?.listed ?? null} format={plain} />
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-vx-tint px-2 py-0.5 text-[12px] font-semibold text-vx-blue">
              <span className="size-1.5 animate-pulse rounded-full bg-vx-blue motion-reduce:animate-none" /> Live
            </div>
          </div>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-vx-blue/20 bg-vx-tint py-1.5 pr-1.5 pl-4 text-[13px] font-semibold text-vx-blue">
              The #1 YouTube channel marketplace
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[12px] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                <span className="size-1.5 animate-pulse rounded-full bg-vx-green motion-reduce:animate-none" />
                <span className="text-vx-green">Live</span>
              </span>
            </div>

            <h1 className="mt-7 text-[40px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-vx-ink sm:text-[64px]">
              Buy &amp; sell YouTube channels{" "}
              <span className="rounded-2xl bg-vx-blue box-decoration-clone px-3 text-white shadow-vx-cta sm:px-4">with confidence</span>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body sm:text-[18px]">
              We connect serious channel sellers with verified buyers. Secure escrow, fast closings, zero hassle.
            </p>

            <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link href="#submit" className={buttonVariants({ variant: "brand", size: "pill", className: "w-full max-w-xs sm:w-auto" })}>
                Sell my channel <IconArrowRight size={16} />
              </Link>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "brandOutline", size: "pill", className: "w-full max-w-xs sm:w-auto" })}
              >
                <TelegramIcon className="size-4 text-vx-blue" /> Browse listings
              </a>
            </div>
          </div>
        </div>

        {/* MARQUEE — recent closed deals */}
        {marquee.length > 0 && (
          <div className="relative border-y border-vx-line bg-white/70 py-3.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-vx-marquee gap-3 hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...marquee, ...marquee].map((d, i) => (
                <div
                  key={i}
                  aria-hidden={i >= marquee.length}
                  className="flex shrink-0 items-center gap-2.5 rounded-full border border-vx-line bg-white py-1.5 pr-4 pl-1.5 text-[13px] whitespace-nowrap text-vx-body"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-vx-tint text-[11px] font-bold text-vx-blue">
                    {d.channel_name!.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-vx-ink">{d.channel_name}</span>
                  <span className="text-vx-faint">·</span>
                  Sold <span className="font-semibold text-vx-green">{usd(Number(d.closed_price_usd))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUST BAR */}
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-vx-line bg-vx-line shadow-vx-card md:grid-cols-4">
            {[
              ["Channels sold", <CountUp key="s" value={stats?.sold ?? null} format={plain} />],
              ["Transaction volume", <CountUp key="v" value={stats?.vol ?? null} format={money} />],
              ["Active listings", <CountUp key="l" value={stats?.listed ?? null} format={plain} />],
              ["Avg response time", "24h"],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white px-6 py-6 text-center">
                <dd className="text-[28px] font-extrabold tracking-[-0.02em] text-vx-ink sm:text-[32px]">{value}</dd>
                <dt className="mt-1 text-[13px] font-medium text-vx-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* PROCESS */}
      <section id="process" className="scroll-mt-20 px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="How it works"
            detail="4 steps"
            title="Simple process,"
            highlight="serious results"
            sub="From submission to payment — we handle everything so you can focus on what's next."
          />
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-vx-line bg-vx-line shadow-vx-card sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col bg-white p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-vx-tint text-vx-blue">
                  <s.icon size={20} />
                </div>
                <div className="mt-6 text-[16px] font-bold text-vx-ink">
                  <span className="mr-1.5 font-mono text-[13px] text-vx-blue">0{i + 1}</span>
                  {s.title}
                </div>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-vx-body">{s.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-vx-subtle px-3 py-1 text-[12px] font-semibold text-vx-body">
                  <IconClock size={12} />
                  {s.time}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-vx-line bg-white px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why ViralExchange"
            detail="Our edge"
            title="Built for deals that"
            highlight="actually close"
            sub="Every feature designed to protect your channel, your privacy, and your payout."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((ft) => (
              <div key={ft.title} className="flex flex-col rounded-2xl border border-vx-line bg-vx-canvas p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-white text-vx-blue ring-1 ring-vx-line">
                  <ft.icon size={20} />
                </div>
                <h3 className="mt-6 text-[18px] font-bold text-vx-ink">{ft.title}</h3>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-vx-body">{ft.desc}</p>
                <div className="mt-6 border-t border-vx-line pt-5">
                  <div className="text-[30px] font-extrabold tracking-[-0.02em] text-vx-blue">{ft.stat}</div>
                  <div className="text-[13px] text-vx-muted">{ft.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="px-5 py-20 text-center sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-[52px] leading-none font-extrabold tracking-[-0.04em] text-vx-ink sm:text-[88px]">
            <CountUp value={stats?.vol ?? null} format={money} />
          </div>
          <p className="mt-4 text-[16px] font-medium text-vx-muted">Total transaction volume brokered</p>
          <dl className="mx-auto mt-10 grid max-w-xl gap-px overflow-hidden rounded-2xl border border-vx-line bg-vx-line shadow-vx-card sm:grid-cols-2">
            <div className="bg-white px-6 py-7">
              <dd className="text-[36px] font-extrabold tracking-[-0.02em] text-vx-blue">
                <CountUp value={stats?.sold ?? null} format={plain} />
              </dd>
              <dt className="mt-1 text-[14px] text-vx-muted">Channels successfully sold</dt>
            </div>
            <div className="bg-white px-6 py-7">
              <dd className="text-[36px] font-extrabold tracking-[-0.02em] text-vx-blue">
                <CountUp value={stats?.listed ?? null} format={plain} />
              </dd>
              <dt className="mt-1 text-[14px] text-vx-muted">Active listings right now</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* CLOSED DEALS */}
      <section id="deals" className="scroll-mt-20 border-t border-vx-line bg-white px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Track record"
            detail="Recent closes"
            title="Real channels,"
            highlight="real transactions"
            sub="Updated live from our deal tracker. Every sale verified and completed through escrow."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals === null && <p className="col-span-full py-10 text-center text-[14px] text-vx-muted">Loading deals...</p>}
            {deals?.length === 0 && <p className="col-span-full py-10 text-center text-[14px] text-vx-muted">First closed deal coming soon</p>}
            {deals?.slice(0, 6).map((d, i) => (
              <article key={i} className="rounded-2xl border border-vx-line bg-vx-canvas p-6 transition-shadow hover:shadow-vx-card">
                <div className="text-[12px] font-semibold tracking-[0.04em] text-vx-blue uppercase">{d.niche || "Channel"}</div>
                <h3 className="mt-1.5 truncate text-[18px] font-bold text-vx-ink">{d.channel_name}</h3>
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[12px] text-vx-muted">Subscribers</dt>
                    <dd className="text-[17px] font-bold text-vx-ink">{fmt(d.subscribers_snapshot)}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-vx-muted">Closed price</dt>
                    <dd className="text-[17px] font-bold text-vx-green">{usd(Number(d.closed_price_usd))}</dd>
                  </div>
                </dl>
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-vx-green-bg px-2.5 py-1 text-[12px] font-semibold text-vx-green">
                  <IconCheck size={12} /> Sold{d.close_date ? ` · ${d.close_date}` : ""}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/deals" className={buttonVariants({ variant: "brandOutline", size: "pillSm" })}>
              View full pipeline <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* BUYERS LOUNGE */}
      <section className="px-5 py-20 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-vx-blue/20 bg-vx-tint px-6 py-16 text-center sm:px-12 sm:py-20">
          <Rings size={1100} className="top-1/2 hidden -translate-y-1/2 sm:block" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center">
            <Eyebrow label="Buyers Lounge" detail="Join free" className="border-vx-blue/15" />
            <h2 className="mt-5 text-[30px] leading-[1.15] font-extrabold tracking-[-0.025em] text-balance text-vx-ink sm:text-[40px]">
              First access to every <span className="text-vx-blue">new verified listing</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-pretty text-vx-body">
              New channels posted to our private Telegram the moment they are verified. Be first in line before anyone else sees them.
            </p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "brand", size: "pill", className: "mt-8" })}
            >
              <TelegramIcon className="size-4" /> Join Buyers Lounge on Telegram
            </a>
            <p className="mt-4 text-[14px] text-vx-muted">
              Already a member?{" "}
              <Link href="/deals" className="font-semibold text-vx-blue hover:underline">
                View live deal pipeline →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* SELL FORM */}
      <section id="submit" className="scroll-mt-20 border-t border-vx-line bg-white px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <Eyebrow label="Sell your channel" detail="Free listing" />
            <h2 className="mt-5 text-[32px] leading-[1.12] font-extrabold tracking-[-0.025em] text-vx-ink sm:text-[44px]">
              Ready to exit? <span className="text-vx-blue">Let&apos;s get you paid.</span>
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
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vx-tint text-vx-blue">
                    <IconCheck size={13} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-vx-line bg-white p-6 shadow-vx-card sm:p-8">
            <SellForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
