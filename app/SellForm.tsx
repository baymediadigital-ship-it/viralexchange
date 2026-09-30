"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, GroupLabel, Spinner, fieldClass, labelClass, selectClass } from "@/components/site/form";
import { IconArrowRight, IconCheck } from "@/components/Icon";
import { fmt, initials } from "@/lib/format";
import { submitListing } from "@/lib/actions/listings";
import { cn } from "@/lib/utils";

type Channel = {
  name: string;
  handle: string;
  thumbnail: string | null;
  subs: number;
  vids: number;
  views: number;
  avgV: number;
  eng: string;
  ageMonths: number | null;
  estMonthly: number | null;
};

export default function SellForm() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [override, setOverride] = useState("");
  const [confirmedMonthly, setConfirmedMonthly] = useState<number | null>(null);
  const [f, setF] = useState({ niche: "", subNiche: "", lang: "", mono: "", price: "", rev: "", name: "", contact: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function fetchChannel() {
    const trimmed = url.trim();
    if (!trimmed) {
      setFetchError("Please paste your YouTube channel URL.");
      return;
    }
    setFetchError("");
    setFetching(true);
    try {
      const r = await fetch(`/api/youtube/channel-stats?url=${encodeURIComponent(trimmed)}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const subs = d.subscribers || 0;
      const avgV = d.avgViewsPerVideo || 0;
      setChannel({
        name: d.name,
        handle: d.handle || trimmed,
        thumbnail: d.thumbnail || null,
        subs,
        vids: d.videos || 0,
        views: d.views || 0,
        avgV,
        eng: subs > 0 ? ((avgV / subs) * 100).toFixed(1) + "%" : "—",
        ageMonths: d.ageMonths || null,
        estMonthly: d.estimatedMonthlyViews || null,
      });
      setConfirmedMonthly(null);
      setOverride("");
    } catch (e) {
      setFetchError((e as Error).message);
    } finally {
      setFetching(false);
    }
  }

  function confirmMonthly() {
    const val = parseInt(override);
    if (!val || isNaN(val)) return;
    setConfirmedMonthly(val);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!channel) return;
    setSubmitError("");
    setSubmitting(true);
    const result = await submitListing({
      channelName: channel.name,
      channelUrl: url.trim(),
      niche: f.niche,
      subNiche: f.subNiche,
      subscribers: channel.subs,
      monthlyViews: confirmedMonthly || channel.estMonthly || undefined,
      monthlyRevenueUsd: f.rev ? parseInt(f.rev) : undefined,
      engagementRate: parseFloat(channel.eng) || undefined,
      monetization: f.mono,
      accountAgeMonths: channel.ageMonths || undefined,
      language: f.lang || "English",
      askingPriceUsd: f.price ? parseInt(f.price) : undefined,
      sellerContactName: f.name.trim(),
      sellerContactEmail: f.contact.trim(),
    });
    setSubmitting(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setDone(true);
  }

  function reset() {
    setUrl("");
    setChannel(null);
    setFetchError("");
    setSubmitError("");
    setOverride("");
    setConfirmedMonthly(null);
    setF({ niche: "", subNiche: "", lang: "", mono: "", price: "", rev: "", name: "", contact: "", notes: "" });
    setDone(false);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-vx-green-bg text-vx-green ring-8 ring-vx-green-bg/50">
          <IconCheck size={28} />
        </div>
        <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-vx-ink">You&apos;re in the pipeline.</h3>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-vx-body">
          We&apos;ve received your channel and will be in touch within 24 hours via your preferred contact.
        </p>
        <Button variant="brandOutline" size="pillSm" className="mt-8" onClick={reset}>
          Submit another channel
        </Button>
      </div>
    );
  }

  const monthly = confirmedMonthly ?? channel?.estMonthly ?? null;

  return (
    <form onSubmit={onSubmit} noValidate>
      <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-vx-ink">Submit your channel</h3>
      <p className="mt-1 mb-6 text-[14px] text-vx-muted">Takes under 2 minutes</p>

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
          {fetching ? <Spinner /> : null}
          {fetching ? "Fetching" : "Fetch stats"}
        </Button>
      </div>
      {fetchError && <p role="alert" className="mt-2 text-[13px] text-vx-red">{fetchError}</p>}

      {channel && (
        <div className="mt-6">
          <div className="flex items-center gap-3 border-b border-vx-line pb-4">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-vx-tint text-[13px] font-bold text-vx-accent">
              {channel.thumbnail ? <img src={channel.thumbnail} alt="" className="size-full object-cover" /> : initials(channel.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-vx-ink">{channel.name}</div>
              <div className="truncate text-[13px] text-vx-muted">{channel.handle}</div>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Subscribers", fmt(channel.subs)],
              ["Total videos", fmt(channel.vids)],
              ["Total views", fmt(channel.views)],
              ["Avg views/video", fmt(channel.avgV)],
              ["Engagement", channel.eng],
              ["Channel age", channel.ageMonths ? (channel.ageMonths / 12).toFixed(1) + " yrs" : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-vx-subtle px-3 py-2.5">
                <dt className="text-[11px] font-semibold tracking-[0.04em] text-vx-muted uppercase">{k}</dt>
                <dd className="mt-0.5 text-[16px] font-bold text-vx-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className={cn("mt-3 rounded-xl border p-4", confirmedMonthly ? "border-vx-green/25 bg-vx-green-bg" : "border-vx-accent/15 bg-vx-tint")}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn("text-[12px] font-semibold tracking-[0.04em] uppercase", confirmedMonthly ? "text-vx-green" : "text-vx-accent")}>
                {confirmedMonthly ? "Monthly views · confirmed" : "Monthly views"}
              </span>
              <span className="text-[20px] font-semibold text-vx-ink">{monthly ? fmt(monthly) + "/mo" : "—"}</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-vx-body">
              {confirmedMonthly
                ? "We'll use your confirmed figure in the listing."
                : "Estimated from total views. Override with your actual YouTube Studio figure below."}
            </p>
            {!confirmedMonthly && (
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  aria-label="Actual monthly views"
                  className={cn(fieldClass, "h-10 flex-1")}
                  placeholder="Actual monthly views (optional)"
                  value={override}
                  onChange={(e) => setOverride(e.target.value)}
                />
                <Button type="button" variant="brandOutline" className="h-10 rounded-xl px-4 text-[14px] font-semibold" onClick={confirmMonthly}>
                  Confirm
                </Button>
              </div>
            )}
          </div>

          <GroupLabel>Channel details</GroupLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-niche" label="Niche / Category" placeholder="e.g. Technology, Finance" value={f.niche} onChange={set("niche")} />
            <Field id="f-subniche" label="Sub-niche" placeholder="e.g. AI & Gadgets" value={f.subNiche} onChange={set("subNiche")} />
            <Field id="f-lang" label="Content language" placeholder="e.g. English" value={f.lang} onChange={set("lang")} />
            <div>
              <Label htmlFor="f-mono" className={labelClass}>Monetization</Label>
              <select
                id="f-mono"
                value={f.mono}
                onChange={set("mono")}
                className={cn(selectClass, !f.mono && "text-vx-muted")}
              >
                <option value="">Select...</option>
                <option>AdSense monetized</option>
                <option>Brand deals only</option>
                <option>AdSense + Merch</option>
                <option>Not monetized</option>
                <option>Paid subscriptions</option>
              </select>
            </div>
            <Field id="f-price" label="Asking price (USD)" type="number" placeholder="e.g. 18500" value={f.price} onChange={set("price")} />
            <Field id="f-rev" label="Monthly revenue (USD)" type="number" placeholder="e.g. 3200" value={f.rev} onChange={set("rev")} />
          </div>

          <GroupLabel>Your contact</GroupLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-name" label="Name / Alias" placeholder="How should we address you?" value={f.name} onChange={set("name")} />
            <Field id="f-contact" label="Telegram / Email" placeholder="@yourhandle or email" value={f.contact} onChange={set("contact")} />
            <div className="sm:col-span-2">
              <Label htmlFor="f-notes" className={labelClass}>Anything else to know?</Label>
              <textarea
                id="f-notes"
                rows={3}
                placeholder="Channel history, reason for selling..."
                value={f.notes}
                onChange={set("notes")}
                className={cn(fieldClass, "h-auto w-full resize-y border py-2.5 outline-none")}
              />
            </div>
          </div>
        </div>
      )}

      {submitError && <p role="alert" className="mt-4 text-[13px] text-vx-red">{submitError}</p>}

      {channel && (
        <Button type="submit" variant="brand" size="pill" className="mt-6 w-full" disabled={submitting}>
          {submitting ? <Spinner /> : <IconArrowRight size={16} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />}
          {submitting ? "Submitting..." : "Submit my channel"}
        </Button>
      )}
    </form>
  );
}
