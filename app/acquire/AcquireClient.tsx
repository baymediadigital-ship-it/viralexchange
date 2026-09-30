"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GradientText, IconTile, TelegramIcon } from "@/components/site/Decor";
import { Field, SelectField, Spinner, fieldClass, labelClass } from "@/components/site/form";
import { TELEGRAM_URL } from "@/components/site/links";
import { IconArrowRight, IconCheck, IconLock, IconSearch, IconTrendingUp } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { submitAcquisitionApplication } from "@/lib/actions/acquisitionApplications";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// Must match BUDGET_LABEL_TO_CODE in lib/actions/acquisitionApplications.ts exactly.
const BUDGETS = ["$3,000 — $7,000", "$7,000 — $15,000", "$15,000 — $30,000", "$30,000+"];
const NICHES = ["Finance / Business", "Technology / AI", "Health & Fitness", "Education", "Entertainment", "Gaming", "Lifestyle / Vlog", "Open to suggestions"];
const EXPERIENCE = [
  "Yes — built a channel from scratch, didn't work out",
  "Yes — paid a course or coach, didn't get results",
  "Yes — got monetized but revenue was disappointing",
  "No — this is my first time exploring this",
];

const OFFER = [
  { icon: IconSearch, title: "We source the channel", desc: "We find a verified, monetized channel that matches what you're looking for. Revenue history, engagement, account standing and niche fit are all checked before we bring it to you." },
  { icon: IconLock, title: "You acquire it safely", desc: "Every acquisition closes through secure escrow. Your money doesn't move until the channel transfer is verified complete." },
  { icon: IconTrendingUp, title: "A production team scales it", desc: "We connect you with a production agency that knows how to grow monetized channels. Content goes out consistently, revenue grows, and so does the valuation." },
];

const PROCESS = [
  { title: "You fill out the application", desc: "Takes 3 minutes. Tell us your budget, the niche you're interested in, and what you're trying to build." },
  { title: "We review within 24 hours", desc: "If it's a fit we get on a call, understand exactly what you're looking for, and start sourcing channels that match." },
  { title: "We present verified channels", desc: "We bring you vetted options with real revenue data. No pressure: either the numbers make sense or they don't." },
  { title: "Acquisition closes through escrow", desc: "Your money doesn't move until the channel transfer is verified complete. Both sides are protected." },
  { title: "Production team takes over", desc: "We connect you with the agency. Content starts going out, revenue starts growing, and you own an asset that works." },
];

// The worked example from the copy, drawn to one scale ($0–$48k).
const MATH = [
  { earns: 500, low: 6000, high: 12000 },
  { earns: 2000, low: 24000, high: 48000 },
];
const MATH_MAX = 48000;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-semibold tracking-[0.14em] text-vx-accent uppercase">{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-3 text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-balance text-vx-ink sm:text-[42px]">{children}</h2>;
}

export default function AcquireClient() {
  const [stats, setStats] = useState<{ sold: number; vol: number } | null>(null);
  const [f, setF] = useState({ fname: "", lname: "", email: "", contact: "", budget: "", niche: "", experience: "", goals: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .from("deals_public_pipeline")
      .select("closed_price_usd")
      .eq("stage", "closed")
      .then(({ data, error }) => {
        if (error || !data) return;
        setStats({ sold: data.length, vol: data.reduce((s, d) => s + (Number(d.closed_price_usd) || 0), 0) });
      });
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.fname.trim()) return setError("Enter your first name.");
    if (!f.email.includes("@")) return setError("Enter a valid email address.");
    if (!f.budget) return setError("Choose your budget range.");
    if (!f.niche) return setError("Choose a preferred niche.");
    if (!f.experience) return setError("Tell us whether you've tried faceless YouTube before.");
    setError("");
    setBusy(true);
    const res = await submitAcquisitionApplication({
      name: `${f.fname.trim()} ${f.lname.trim()}`.trim(),
      email: f.email.trim(),
      contact: f.contact,
      budgetLabel: f.budget,
      niche: f.niche,
      experience: f.experience,
      goals: f.goals,
    });
    setBusy(false);
    if (res.error) return setError(res.error);
    setDone(true);
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      {/* HERO */}
      <header className="relative overflow-hidden bg-linear-to-b from-vx-hero-1 via-vx-hero-2 to-vx-canvas">
        <div aria-hidden className="pointer-events-none absolute -top-56 left-1/2 size-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--vx-glow-1),transparent)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <div className="vx-rise inline-flex items-center gap-2 rounded-full bg-vx-surface/90 px-3.5 py-1.5 text-[13px] font-semibold text-vx-accent shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-vx-accent/15">
            <span className="size-1.5 rounded-full bg-vx-accent" />
            Done-for-you acquisition
          </div>
          <h1 style={delay(80)} className="vx-rise mt-7 text-[40px] leading-[1.06] font-semibold tracking-[-0.045em] text-balance text-vx-ink sm:text-[60px]">
            You didn&apos;t fail at faceless YouTube. <GradientText>The approach did.</GradientText>
          </h1>
          <p style={delay(160)} className="vx-rise mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-pretty text-vx-body sm:text-[18px]">
            Stop starting from scratch. We find you a monetized channel that&apos;s already earning, handle the acquisition, and connect you with a
            production team to scale it. You own the asset from day one.
          </p>
          <div style={delay(240)} className="vx-rise mt-9 flex flex-col items-center gap-3">
            <a href="#apply" className={buttonVariants({ variant: "brand", size: "pill" })}>
              Apply to acquire a channel <IconArrowRight size={16} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
            </a>
            <span className="text-[13px] text-vx-muted">Takes 3 minutes. We review within 24 hours.</span>
          </div>
        </div>
      </header>

      <main>
        {/* PROBLEM */}
        <section className="px-5 py-16 sm:px-6 sm:py-20">
          <div className="vx-reveal mx-auto max-w-2xl">
            <SectionLabel>The problem</SectionLabel>
            <H2>You&apos;ve been here before.</H2>
            <div className="mt-6 flex flex-col gap-5 text-[17px] leading-[1.7] text-vx-body">
              <p>
                You paid for a course. Or hired a coach. Or joined a done-for-you program that promised a monetized channel in 90 days. You did the work,
                followed the steps, and somewhere along the way it stopped adding up.
              </p>
              <p>
                Maybe you never hit monetization. Maybe you did and the revenue wasn&apos;t what you expected. Maybe the coach moved on and left you figuring it
                out alone.
              </p>
              <p>
                The frustrating part isn&apos;t that faceless YouTube doesn&apos;t work. It does. Channels on this model are making real money right now. The
                frustrating part is that you spent months and thousands of dollars on the hardest part of the process when you didn&apos;t have to.
              </p>
              <p className="border-l-2 border-vx-accent pl-5 font-semibold text-vx-ink">
                Building from scratch is the slowest, riskiest, most uncertain way to get into this. There&apos;s a faster way.
              </p>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="px-5 sm:px-6">
          <dl className="vx-reveal mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-vx-line shadow-vx-card ring-1 ring-vx-line md:grid-cols-4">
            {[
              [stats ? String(stats.sold) : "—", "Channels sold"],
              [stats ? usd(stats.vol) : "—", "Volume closed"],
              ["24h", "Avg verification"],
              ["100%", "Escrow protected"],
            ].map(([v, l]) => (
              <div key={l} className="bg-vx-surface px-6 py-6 text-center">
                <dd className="text-[28px] font-semibold tracking-[-0.02em] text-vx-ink tabular-nums">{v}</dd>
                <dt className="mt-1 text-[13px] text-vx-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* OFFER */}
        <section className="px-5 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="vx-reveal max-w-2xl">
              <SectionLabel>The offer</SectionLabel>
              <H2>
                Buy something that&apos;s <GradientText>already working.</GradientText>
              </H2>
              <p className="mt-4 text-[17px] leading-relaxed text-vx-body">
                We source a vetted, monetized YouTube channel. You acquire it. A production agency keeps it growing. You own an asset from day one.
              </p>
            </div>
            <ol className="vx-reveal mt-12 grid gap-5 md:grid-cols-3">
              {OFFER.map((o, i) => (
                <li key={o.title} className="flex flex-col rounded-3xl bg-vx-surface p-7 shadow-vx-card ring-1 ring-vx-line/70">
                  <div className="flex items-center justify-between">
                    <IconTile>
                      <o.icon size={20} />
                    </IconTile>
                    <span className="text-[12px] font-semibold tracking-[0.14em] text-vx-faint">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-[18px] font-semibold text-vx-ink">{o.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-vx-body">{o.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* THE MATH */}
        <section className="border-y border-vx-line bg-linear-to-b from-vx-canvas via-vx-band to-vx-canvas px-5 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="vx-reveal">
              <SectionLabel>The math</SectionLabel>
              <H2>
                This is how asset <GradientText>ownership works.</GradientText>
              </H2>
              <div className="mt-6 flex flex-col gap-4 text-[17px] leading-[1.7] text-vx-body">
                <p>
                  A channel earning $500 a month can sell for $6,000 to $12,000. That same channel, scaled to $2,000 a month, is worth $24,000 to $48,000.
                </p>
                <p>
                  You put capital in at the bottom. You scale with a production team. You sell at the top, or hold and collect the income. Either way you own
                  something with real value, not a certificate and a Slack group.
                </p>
                <p className="font-semibold text-vx-ink">The people who understand this aren&apos;t buying courses. They&apos;re buying assets.</p>
              </div>
            </div>
            <figure className="vx-reveal rounded-3xl bg-vx-surface p-6 shadow-vx-card ring-1 ring-vx-line/80 sm:p-8">
              <figcaption className="text-[13px] font-semibold text-vx-muted">Sale value at 12–24× monthly revenue</figcaption>
              <div className="mt-6 flex flex-col gap-7">
                {MATH.map((m) => (
                  <div key={m.earns}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold text-vx-ink">Earning {usd(m.earns)}/mo</span>
                      <span className="text-[15px] font-semibold text-vx-accent tabular-nums">
                        {usd(m.low)}–{usd(m.high)}
                      </span>
                    </div>
                    <div className="relative mt-3 h-3 rounded-full bg-vx-subtle">
                      <div
                        className="absolute inset-y-0 rounded-full bg-linear-to-r from-vx-accent-bright to-vx-accent"
                        style={{ left: `${(m.low / MATH_MAX) * 100}%`, width: `${((m.high - m.low) / MATH_MAX) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[12px] text-vx-muted tabular-nums">
                <span>$0</span>
                <span>$24,000</span>
                <span>$48,000</span>
              </div>
            </figure>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="px-5 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="vx-reveal text-center">
              <SectionLabel>Who this is for</SectionLabel>
              <H2>
                Be honest <GradientText>with yourself.</GradientText>
              </H2>
            </div>
            <div className="vx-reveal mt-12 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-vx-surface p-7 shadow-vx-card ring-1 ring-vx-accent/25">
                <h3 className="flex items-center gap-2 text-[16px] font-semibold text-vx-accent">
                  <span className="flex size-6 items-center justify-center rounded-full bg-vx-accent-soft">
                    <IconCheck size={13} />
                  </span>
                  This is for you if
                </h3>
                <ul className="mt-5 flex flex-col gap-3.5 text-[15px] leading-relaxed text-vx-ink">
                  {[
                    "You've tried building a faceless channel and it didn't work out",
                    "You've spent money on courses or coaches and have nothing to show for it",
                    "You have capital ready and want it working for you",
                    "You want to own a cash-flowing digital asset without building from scratch",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <IconCheck size={16} className="mt-1 shrink-0 text-vx-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-vx-subtle p-7 ring-1 ring-vx-line">
                <h3 className="flex items-center gap-2 text-[16px] font-semibold text-vx-muted">
                  <span className="flex size-6 items-center justify-center rounded-full bg-vx-surface text-[13px] ring-1 ring-vx-line">✕</span>
                  This is not for you if
                </h3>
                <ul className="mt-5 flex flex-col gap-3.5 text-[15px] leading-relaxed text-vx-body">
                  {[
                    "You're looking for a get-rich-quick scheme. Channels take work to scale.",
                    "You don't have capital ready to acquire a channel. Come back when you do.",
                    "You want someone else to own the asset. You're the owner, and owners pay attention.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-vx-faint" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="px-5 pb-20 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-2xl">
            <div className="vx-reveal">
              <SectionLabel>The process</SectionLabel>
              <H2>
                What happens after <GradientText>you apply.</GradientText>
              </H2>
            </div>
            <ol className="vx-reveal relative mt-10 flex flex-col gap-8">
              {PROCESS.map((p, i) => (
                <li
                  key={p.title}
                  className="relative flex gap-5 after:absolute after:top-9 after:-bottom-8 after:left-[17px] after:w-px after:bg-vx-line last:after:hidden"
                >
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-vx-surface text-[14px] font-semibold text-vx-accent ring-1 ring-vx-accent/30">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[17px] font-semibold text-vx-ink">{p.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-vx-body">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* APPLICATION */}
        <section id="apply" className="scroll-mt-24 border-t border-vx-line bg-linear-to-b from-vx-surface to-vx-band px-5 py-20 sm:px-6 sm:py-24">
          <div className="vx-reveal mx-auto max-w-2xl rounded-[28px] bg-vx-surface p-6 shadow-[0_40px_80px_-40px_rgba(var(--vx-shadow-rgb),0.35)] ring-1 ring-vx-line/80 sm:p-9">
            {done ? (
              <div className="py-4 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-vx-green-bg text-vx-green">
                  <IconCheck size={26} />
                </div>
                <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.03em] text-vx-ink">Application received.</h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-vx-body">
                  We&apos;ll review it within 24 hours and reach out on your preferred contact. While you wait, join our private Buyers Lounge on Telegram. New
                  verified listings go live there first.
                </p>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "brand", size: "pill", className: "mt-7" })}>
                  <TelegramIcon className="size-4" /> Join the Buyers Lounge
                </a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-vx-ink">Apply to acquire a channel</h2>
                <p className="mt-1.5 text-[15px] text-vx-body">Takes 3 minutes. We review every application within 24 hours.</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Field id="f-fname" label="First name" autoComplete="given-name" placeholder="Your first name" value={f.fname} onChange={set("fname")} />
                  <Field id="f-lname" label="Last name" autoComplete="family-name" placeholder="Your last name" value={f.lname} onChange={set("lname")} />
                  <Field id="f-email" label="Email address" type="email" autoComplete="email" placeholder="you@email.com" value={f.email} onChange={set("email")} />
                  <Field id="f-contact" label="Telegram or WhatsApp" placeholder="@handle or phone number" value={f.contact} onChange={set("contact")} />
                  <SelectField id="f-budget" label="Acquisition budget (USD)" value={f.budget} onChange={set("budget")} className={cn(!f.budget && "[&_select]:text-vx-muted")}>
                    <option value="">Select your budget range</option>
                    {BUDGETS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </SelectField>
                  <SelectField id="f-niche" label="Preferred niche" value={f.niche} onChange={set("niche")} className={cn(!f.niche && "[&_select]:text-vx-muted")}>
                    <option value="">Select a niche</option>
                    {NICHES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </SelectField>
                  <SelectField
                    id="f-experience"
                    label="Have you tried faceless YouTube before?"
                    value={f.experience}
                    onChange={set("experience")}
                    className={cn("sm:col-span-2", !f.experience && "[&_select]:text-vx-muted")}
                  >
                    <option value="">Select one</option>
                    {EXPERIENCE.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </SelectField>
                  <div className="sm:col-span-2">
                    <Label htmlFor="f-goals" className={labelClass}>What are you trying to build? (optional)</Label>
                    <textarea
                      id="f-goals"
                      rows={3}
                      placeholder="Tell us a bit about what you're looking to achieve..."
                      value={f.goals}
                      onChange={set("goals")}
                      className={cn(fieldClass, "h-auto w-full resize-y border py-2.5 outline-none")}
                    />
                  </div>
                </div>
                {error && (
                  <p role="alert" className="mt-4 text-[13px] text-vx-red">
                    {error}
                  </p>
                )}
                <Button type="submit" variant="brand" size="pill" className="mt-7 w-full" disabled={busy}>
                  {busy ? <Spinner /> : <IconArrowRight size={16} />}
                  {busy ? "Submitting..." : "Submit my application"}
                </Button>
                <p className="mt-4 text-center text-[13px] text-vx-muted">No spam. No sales pressure. If it&apos;s not a fit, we&apos;ll tell you straight.</p>
              </form>
            )}
          </div>
          <p className="mt-8 text-center text-[14px] text-vx-muted">
            Selling instead?{" "}
            <Link href="/valuation" className="font-semibold text-vx-accent hover:underline">
              Get a free valuation →
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
