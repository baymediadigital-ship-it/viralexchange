"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GradientText } from "@/components/site/Decor";
import { Field, GroupLabel, SelectField, Spinner, fieldClass, labelClass } from "@/components/site/form";
import { CONTACT_EMAIL } from "@/components/site/links";
import { IconArrowRight, IconCheck, IconClock, IconLock } from "@/components/Icon";
import { fmt, initials, usd } from "@/lib/format";
import { submitValuationLead } from "@/lib/actions/valuationLeads";
import { submitListing } from "@/lib/actions/listings";
import { cn } from "@/lib/utils";

// Pricing model (unchanged from the original tool).
const NM: Record<string, number> = { finance: 1.4, tech: 1.3, health: 1.25, education: 1.2, entertainment: 1.0, gaming: 0.95, lifestyle: 0.9, food: 0.9, other: 1.0 };
const NL: Record<string, string> = {
  finance: "Finance/Business — highest buyer demand",
  tech: "Technology/AI — premium niche",
  health: "Health & Fitness — high demand",
  education: "Education — steady demand",
  entertainment: "Entertainment — standard multiple",
  gaming: "Gaming — moderate demand",
  lifestyle: "Lifestyle/Vlog — variable",
  food: "Food — moderate demand",
  other: "General — standard multiple",
};
const MM: Record<string, number> = { adsense: 1.0, brand: 0.85, both: 1.2 };
const ML: Record<string, string> = { adsense: "AdSense — predictable revenue", brand: "Brand deals — solid but variable", both: "AdSense + Brand deals — premium" };
const TM: Record<string, { low: number; high: number; label: string; conf: string }> = {
  "6plus": { low: 12, high: 24, label: "6+ months · 12–24×", conf: "High" },
  "3to6": { low: 5, high: 8, label: "3–6 months · 5–8×", conf: "Medium" },
  "1to3": { low: 4, high: 6, label: "1–3 months · 4–6×", conf: "Indicative" },
};
const NICHE_OPTIONS = [
  ["finance", "Finance / Business"],
  ["tech", "Technology / AI"],
  ["health", "Health & Fitness"],
  ["education", "Education"],
  ["entertainment", "Entertainment"],
  ["gaming", "Gaming"],
  ["lifestyle", "Lifestyle / Vlog"],
  ["food", "Food & Cooking"],
  ["other", "Other"],
];
const MONO_TO_LISTING: Record<string, string> = { adsense: "AdSense monetized", brand: "Brand deals only", both: "AdSense + Brand deals" };

type Channel = { name: string; handle: string; thumbnail: string | null; subs: number; views: number; eng: number; ageMonths: number; url: string };
type Step = "channel" | "email" | "dq" | "result" | "list" | "success";

function valuate(ch: Channel, mono: string, dur: string, niche: string, rev: number) {
  const tier = TM[dur];
  const nm = NM[niche] || 1.0;
  const mm = MM[mono] || 1.0;
  const subScore = Math.min(100, Math.round((Math.log10(Math.max(ch.subs, 1)) / 7) * 100));
  const engScore = ch.eng >= 5 ? 95 : ch.eng >= 3 ? 80 : ch.eng >= 2 ? 65 : ch.eng >= 1 ? 45 : 25;
  const nicheScore = Math.round(nm * 71);
  const ageScore = ch.ageMonths >= 36 ? 90 : ch.ageMonths >= 24 ? 75 : ch.ageMonths >= 12 ? 60 : ch.ageMonths >= 6 ? 45 : 25;
  const monoScore = mono === "both" ? 95 : mono === "adsense" ? 78 : 65;
  const tierScore = dur === "6plus" ? 90 : dur === "3to6" ? 60 : 35;
  return {
    low: Math.round(rev * tier.low * nm * mm),
    high: Math.round(rev * tier.high * nm * mm),
    conf: tier.conf,
    tierLabel: tier.label,
    factors: [
      { name: "Revenue tier", score: tierScore, note: tier.label },
      { name: "Subscribers", score: subScore, note: fmt(ch.subs) + " subscribers" },
      { name: "Engagement", score: engScore, note: ch.eng.toFixed(1) + "% avg engagement" },
      { name: "Niche", score: nicheScore, note: NL[niche] || "" },
      { name: "Monetization", score: monoScore, note: ML[mono] || "" },
      { name: "Channel age", score: ageScore, note: ch.ageMonths >= 12 ? (ch.ageMonths / 12).toFixed(1) + " years established" : ch.ageMonths + " months old" },
    ],
  };
}

const STEP_TRACK: { key: Step[]; label: string }[] = [
  { key: ["channel", "dq"], label: "Channel" },
  { key: ["email"], label: "Unlock" },
  { key: ["result"], label: "Result" },
  { key: ["list", "success"], label: "List" },
];

function Progress({ step }: { step: Step }) {
  const current = STEP_TRACK.findIndex((s) => s.key.includes(step));
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
      {STEP_TRACK.map((s, i) => (
        <li key={s.label} className="flex flex-1 items-center gap-2" aria-current={i === current ? "step" : undefined}>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
              i < current && "bg-vx-accent text-vx-on-accent",
              i === current && "bg-vx-accent-soft text-vx-accent ring-1 ring-vx-accent/40",
              i > current && "bg-vx-subtle text-vx-muted",
            )}
          >
            {i < current ? <IconCheck size={12} /> : i + 1}
          </span>
          <span className={cn("text-[13px] font-medium", i === current ? "text-vx-ink" : "text-vx-muted", "hidden sm:inline")}>{s.label}</span>
          {i < STEP_TRACK.length - 1 && <span className={cn("h-px flex-1", i < current ? "bg-vx-accent/50" : "bg-vx-line")} />}
        </li>
      ))}
    </ol>
  );
}

function Bar({ score }: { score: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setW(score));
    return () => cancelAnimationFrame(t);
  }, [score]);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-vx-subtle">
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none", score >= 70 ? "bg-vx-accent" : "bg-vx-amber")}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="mt-3 text-[13px] text-vx-red">{children}</p>;
}

export default function ValuationClient() {
  const [step, setStep] = useState<Step>("channel");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [ch, setCh] = useState<Channel | null>(null);
  const [mono, setMono] = useState("adsense");
  const [dur, setDur] = useState("6plus");
  const [niche, setNiche] = useState("finance");
  const [rev, setRev] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState({ price: "", niche: "finance", subNiche: "", mono: "AdSense monetized", name: "", contact: "" });

  const result = ch && mono !== "none" && parseFloat(rev) > 0 ? valuate(ch, mono, dur, niche, parseFloat(rev)) : null;

  function go(next: Step) {
    setError("");
    setStep(next);
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function fetchChannel() {
    const u = url.trim();
    if (!u) return setError("Paste your YouTube channel URL to start.");
    setError("");
    setFetching(true);
    try {
      const r = await fetch(`/api/youtube/channel-stats?url=${encodeURIComponent(u)}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setCh({
        name: d.name,
        handle: d.handle || "",
        thumbnail: d.thumbnail || null,
        subs: d.subscribers || 0,
        views: d.views || 0,
        eng: d.engagementPct || 0,
        ageMonths: d.ageMonths || 0,
        url: u,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFetching(false);
    }
  }

  function continueToEmail() {
    if (!ch) return;
    if (mono === "none") return go("dq");
    if (!(parseFloat(rev) > 0)) return setError("Enter your average monthly revenue in USD.");
    go("email");
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!ch || !result) return;
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setBusy(true);
    const res = await submitValuationLead({
      email,
      channelName: ch.name,
      channelUrl: ch.url,
      subscribers: ch.subs,
      valuationLowUsd: result.low,
      valuationHighUsd: result.high,
      tier: result.tierLabel,
      niche,
      confidence: result.conf,
    });
    setBusy(false);
    if (res.error) return setError(res.error);
    go("result");
  }

  function toListing() {
    setList((l) => ({ ...l, niche, mono: MONO_TO_LISTING[mono] || l.mono, contact: l.contact || email }));
    go("list");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ch) return;
    if (!(parseInt(list.price) > 0)) return setError("Enter your asking price in USD.");
    if (!list.contact.trim()) return setError("Add an email or Telegram handle so we can reach you.");
    setBusy(true);
    const res = await submitListing({
      channelName: ch.name,
      channelUrl: ch.url,
      niche: list.niche,
      subNiche: list.subNiche,
      subscribers: ch.subs,
      monthlyRevenueUsd: parseFloat(rev) || undefined,
      engagementRate: ch.eng,
      monetization: list.mono,
      accountAgeMonths: ch.ageMonths,
      language: "English",
      askingPriceUsd: parseInt(list.price),
      sellerContactName: list.name.trim() || "Seller",
      sellerContactEmail: list.contact.trim(),
    });
    setBusy(false);
    if (res.error) return setError(res.error);
    go("success");
  }

  function reset() {
    setUrl("");
    setCh(null);
    setRev("");
    setEmail("");
    setList({ price: "", niche: "finance", subNiche: "", mono: "AdSense monetized", name: "", contact: "" });
    go("channel");
  }

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />

      <header className="relative overflow-hidden bg-linear-to-b from-vx-hero-1 via-vx-hero-2 to-vx-canvas">
        <div aria-hidden className="pointer-events-none absolute -top-56 left-1/2 size-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--vx-glow-1),transparent)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 pt-16 pb-12 text-center sm:px-6 sm:pt-20">
          <div className="vx-rise inline-flex items-center gap-2 rounded-full bg-vx-surface/90 px-3.5 py-1.5 text-[13px] font-semibold text-vx-body shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-vx-accent/10">
            Free valuation <span className="text-vx-line">/</span> <span className="text-vx-accent">No signup needed</span>
          </div>
          <h1 style={{ "--d": "80ms" } as React.CSSProperties} className="vx-rise mt-6 text-[40px] leading-[1.05] font-semibold tracking-[-0.045em] text-balance text-vx-ink sm:text-[58px]">
            What is your channel <GradientText>worth?</GradientText>
          </h1>
          <p style={{ "--d": "160ms" } as React.CSSProperties} className="vx-rise mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-pretty text-vx-body">
            Real market multiples, an instant result. Paste your channel URL and go. No obligation.
          </p>
          <ul style={{ "--d": "240ms" } as React.CSSProperties} className="vx-rise mt-7 flex flex-wrap justify-center gap-2">
            {["Under 60 seconds", "Based on real sales", "100% free"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-vx-surface px-3 py-1.5 text-[13px] font-medium text-vx-body ring-1 ring-vx-line">
                <IconCheck size={13} className="text-vx-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="px-5 pb-24 sm:px-6">
        <div id="tool" className="vx-rise mx-auto max-w-2xl scroll-mt-24 rounded-[28px] bg-vx-surface p-6 shadow-[0_40px_80px_-40px_rgba(var(--vx-shadow-rgb),0.35)] ring-1 ring-vx-line/80 sm:p-9" style={{ "--d": "300ms" } as React.CSSProperties}>
          <Progress step={step} />

          {step === "channel" && (
            <div>
              <Label htmlFor="url-input" className={labelClass}>YouTube channel URL</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="url-input"
                  className={cn(fieldClass, "flex-1")}
                  placeholder="https://youtube.com/@yourchannel"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchChannel();
                    }
                  }}
                />
                <Button type="button" variant="brand" className="h-11 rounded-xl px-5 text-[14px] font-semibold shadow-none" onClick={fetchChannel} disabled={fetching}>
                  {fetching && <Spinner />}
                  {fetching ? "Fetching" : "Fetch stats"}
                </Button>
              </div>

              {ch && (
                <div className="mt-6">
                  <div className="flex items-center gap-3 border-b border-vx-line pb-4">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-vx-accent-soft text-[13px] font-bold text-vx-accent">
                      {ch.thumbnail ? <img src={ch.thumbnail} alt="" className="size-full object-cover" /> : initials(ch.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-vx-ink">{ch.name}</div>
                      <div className="truncate text-[13px] text-vx-muted">{ch.handle}</div>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["Subscribers", fmt(ch.subs)],
                      ["Views", fmt(ch.views)],
                      ["Engagement", ch.eng.toFixed(1) + "%"],
                      ["Age", ch.ageMonths >= 12 ? (ch.ageMonths / 12).toFixed(1) + " yrs" : ch.ageMonths + " mo"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-vx-subtle px-3 py-2.5">
                        <dt className="text-[11px] font-semibold tracking-[0.04em] text-vx-muted uppercase">{k}</dt>
                        <dd className="mt-0.5 text-[16px] font-semibold text-vx-ink tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <GroupLabel>Monetization</GroupLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField id="f-mono" label="Monetized?" value={mono} onChange={(e) => setMono(e.target.value)}>
                      <option value="adsense">AdSense</option>
                      <option value="brand">Brand deals only</option>
                      <option value="both">AdSense + Brand deals</option>
                      <option value="none">Not monetized</option>
                    </SelectField>
                    {mono !== "none" && (
                      <>
                        <SelectField id="f-dur" label="How long monetized?" value={dur} onChange={(e) => setDur(e.target.value)}>
                          <option value="6plus">6+ months</option>
                          <option value="3to6">3–6 months</option>
                          <option value="1to3">1–3 months</option>
                        </SelectField>
                        <Field id="f-rev" label="Monthly revenue (USD)" type="number" min={1} placeholder="e.g. 2500" value={rev} onChange={(e) => setRev(e.target.value)} />
                        <SelectField id="f-niche" label="Content niche" value={niche} onChange={(e) => setNiche(e.target.value)}>
                          {NICHE_OPTIONS.map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </SelectField>
                      </>
                    )}
                  </div>
                  <Button type="button" variant="brand" size="pill" className="mt-7 w-full" onClick={continueToEmail}>
                    Get my free valuation <IconArrowRight size={16} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
                  </Button>
                </div>
              )}
              {error && <ErrorText>{error}</ErrorText>}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={unlock} noValidate className="text-center">
              <div className="relative overflow-hidden rounded-2xl bg-vx-subtle px-6 py-9">
                {/* Placeholder figure only; the real number isn't rendered until the email step completes. */}
                <div aria-hidden className="text-[36px] font-semibold tracking-[-0.03em] text-vx-ink blur-md select-none sm:text-[44px]">$48,000 — $96,000</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-vx-surface px-4 py-2 text-[13px] font-semibold text-vx-ink shadow-vx-float ring-1 ring-vx-line">
                    <IconLock size={14} className="text-vx-accent" /> Enter your email to unlock
                  </span>
                </div>
              </div>
              <h2 className="mt-7 text-[24px] font-semibold tracking-[-0.03em] text-vx-ink">Your valuation is ready</h2>
              <p className="mx-auto mt-2 max-w-sm text-[15px] text-vx-body">Add your email to see the full breakdown. We&apos;ll send you a copy too.</p>
              <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  aria-label="Email address"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(fieldClass, "flex-1")}
                />
                <Button type="submit" variant="brand" className="h-11 rounded-xl px-5 text-[14px] font-semibold shadow-none" disabled={busy}>
                  {busy && <Spinner />}
                  Unlock
                </Button>
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <p className="mt-4 text-[12px] text-vx-muted">No spam. Unsubscribe any time.</p>
            </form>
          )}

          {step === "dq" && (
            <div className="py-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-vx-amber-bg text-vx-amber">
                <IconClock size={24} />
              </div>
              <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-vx-ink">Not quite ready yet</h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-vx-body">
                We only work with monetized channels, so buyers get assets that already earn.
              </p>
              <div className="mx-auto mt-5 max-w-md rounded-2xl bg-vx-subtle p-4 text-left text-[14px] leading-relaxed text-vx-body">
                <strong className="font-semibold text-vx-ink">Come back once you&apos;re monetized.</strong> When your channel is in the YouTube Partner Program and
                earning, we can value it and list it within 24 hours.
              </div>
              <Button type="button" variant="brandOutline" size="pillSm" className="mt-7" onClick={reset}>
                Start over
              </Button>
            </div>
          )}

          {step === "result" && result && (
            <div>
              <div className="text-center">
                <div className="text-[13px] font-semibold tracking-[0.12em] text-vx-muted uppercase">Estimated channel value</div>
                <div className="mt-2 text-[36px] leading-tight font-semibold tracking-[-0.035em] tabular-nums sm:text-[48px]">
                  <GradientText>
                    {usd(result.low)} — {usd(result.high)}
                  </GradientText>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-vx-green-bg px-3 py-1 text-[12px] font-semibold text-vx-green">{result.conf} confidence</span>
                  <span className="rounded-full bg-vx-subtle px-3 py-1 text-[12px] font-semibold text-vx-body">{result.tierLabel}</span>
                </div>
              </div>

              <GroupLabel>Valuation breakdown</GroupLabel>
              <ul className="flex flex-col gap-4">
                {result.factors.map((f) => (
                  <li key={f.name} className="grid grid-cols-[110px_1fr_36px] items-center gap-x-4 gap-y-1 sm:grid-cols-[130px_1fr_40px]">
                    <span className="text-[14px] font-medium text-vx-ink">{f.name}</span>
                    <Bar score={f.score} />
                    <span className={cn("text-right text-[14px] font-semibold tabular-nums", f.score >= 70 ? "text-vx-accent" : "text-vx-amber")}>{f.score}</span>
                    <span className="col-start-2 col-end-4 text-[12px] text-vx-muted">{f.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[12px] text-vx-muted">An estimate only. The actual sale price depends on the buyer and final due diligence.</p>

              <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl bg-vx-accent-soft p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-[17px] font-semibold text-vx-ink">Ready to list?</h3>
                  <p className="mt-1 text-[14px] text-vx-body">Listed to verified buyers in 24 hours. Zero upfront fees, secure escrow.</p>
                </div>
                <Button type="button" variant="brand" size="pillSm" onClick={toListing} className="shrink-0">
                  List my channel <IconArrowRight size={14} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
                </Button>
              </div>
            </div>
          )}

          {step === "list" && ch && (
            <form onSubmit={submit} noValidate>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-vx-ink">List {ch.name}</h2>
              <p className="mt-1.5 text-[15px] text-vx-body">Your channel qualifies. Add a few details and we&apos;ll list it to our verified buyers within 24 hours.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field id="s4-price" label="Asking price (USD)" type="number" min={1} placeholder="e.g. 25000" value={list.price} onChange={(e) => setList({ ...list, price: e.target.value })} />
                <SelectField id="s4-niche" label="Content niche" value={list.niche} onChange={(e) => setList({ ...list, niche: e.target.value })}>
                  {NICHE_OPTIONS.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </SelectField>
                <Field id="s4-subniche" label="Sub-niche" placeholder="e.g. AI & Gadgets" value={list.subNiche} onChange={(e) => setList({ ...list, subNiche: e.target.value })} />
                <SelectField id="s4-mono" label="Monetization" value={list.mono} onChange={(e) => setList({ ...list, mono: e.target.value })}>
                  <option>AdSense monetized</option>
                  <option>Brand deals only</option>
                  <option>AdSense + Brand deals</option>
                </SelectField>
                <Field id="s4-name" label="Your name" autoComplete="name" placeholder="How should we address you?" value={list.name} onChange={(e) => setList({ ...list, name: e.target.value })} />
                <Field id="s4-contact" label="Email or Telegram" placeholder="you@email.com or @handle" value={list.contact} onChange={(e) => setList({ ...list, contact: e.target.value })} />
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" variant="brand" size="pill" className="mt-7 w-full" disabled={busy}>
                {busy ? <Spinner /> : <IconArrowRight size={16} />}
                {busy ? "Submitting..." : "List my channel now"}
              </Button>
            </form>
          )}

          {step === "success" && ch && (
            <div className="py-2 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-vx-green-bg text-vx-green">
                <IconCheck size={26} />
              </div>
              <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-vx-ink">You&apos;re in the pipeline.</h2>
              <p className="mx-auto mt-2 max-w-sm text-[15px] text-vx-body">We&apos;ll verify your channel within 24 hours and reach out on the contact you gave us.</p>
              <dl className="mx-auto mt-6 max-w-sm divide-y divide-vx-line rounded-2xl bg-vx-subtle px-5 text-left text-[14px]">
                {[
                  ["Channel", ch.name],
                  ["Asking price", usd(parseInt(list.price))],
                  ["Estimated value", result ? `${usd(result.low)} — ${usd(result.high)}` : "—"],
                  ["Status", "Pending verification"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="text-vx-muted">{k}</dt>
                    <dd className="truncate font-semibold text-vx-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[13px] text-vx-muted">
                Questions? <span className="font-semibold text-vx-ink select-all">{CONTACT_EMAIL}</span>
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
