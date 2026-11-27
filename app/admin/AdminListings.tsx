"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/SectionHeader";
import { Field, Spinner, fieldClass, labelClass } from "@/components/site/form";
import { Label } from "@/components/ui/label";
import { fmt, tidyNiche, usd } from "@/lib/format";
import { setListingStatus, updateListing, type ListingStatus } from "@/lib/actions/adminListings";
import { cn } from "@/lib/utils";

export type AdminListing = {
  id: string;
  status: ListingStatus;
  channel_name: string;
  channel_url: string;
  niche: string | null;
  sub_niche: string | null;
  subscribers: number | null;
  monthly_views: number | null;
  monthly_revenue_usd: number | null;
  engagement_rate: number | null;
  monetization: string | null;
  account_age_months: number | null;
  language: string | null;
  asking_price_usd: number | null;
  seller_contact_name: string | null;
  seller_contact_email: string | null;
  seller_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  seller: { email: string | null; full_name: string | null } | null;
};

const STATUS: Record<ListingStatus, { label: string; pill: string }> = {
  draft: { label: "Under review", pill: "bg-vx-amber-bg text-vx-amber" },
  available: { label: "Live", pill: "bg-vx-green-bg text-vx-green" },
  pending_sale: { label: "In negotiation", pill: "bg-vx-info-bg text-vx-info" },
  sold: { label: "Sold", pill: "bg-vx-subtle text-vx-body" },
  withdrawn: { label: "Unlisted", pill: "bg-vx-subtle text-vx-muted" },
  rejected: { label: "Rejected", pill: "bg-vx-red-bg text-vx-red" },
};

const TABS: { key: string; label: string; statuses: ListingStatus[] }[] = [
  { key: "review", label: "To review", statuses: ["draft"] },
  { key: "live", label: "Live", statuses: ["available", "pending_sale"] },
  { key: "sold", label: "Sold", statuses: ["sold"] },
  { key: "closed", label: "Rejected & unlisted", statuses: ["rejected", "withdrawn"] },
];

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function AdminListings({ listings, loadFailed }: { listings: AdminListing[]; loadFailed: boolean }) {
  const [tab, setTab] = useState("review");
  const current = TABS.find((t) => t.key === tab)!;
  const rows = listings.filter((l) => current.statuses.includes(l.status));

  return (
    <main className="mx-auto max-w-5xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
      <Eyebrow label="Admin" />
      <h1 className="mt-4 text-[34px] leading-tight font-normal tracking-[-0.035em] text-vx-ink sm:text-[42px]">Listings</h1>
      <p className="mt-2 text-[15px] text-vx-body">Approve submissions to put them on the public listings page. Channel names stay private there.</p>

      <div className="mt-8 flex w-max max-w-full gap-0.5 overflow-x-auto rounded-lg border border-vx-line bg-vx-subtle p-1" role="tablist" aria-label="Listing status">
        {TABS.map((t) => {
          const count = listings.filter((l) => t.statuses.includes(l.status)).length;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-[13px] whitespace-nowrap transition-[color,background-color,box-shadow] duration-150",
                tab === t.key ? "bg-vx-surface text-vx-ink shadow-[0_1px_2px_rgba(var(--vx-shadow-rgb),0.08)] ring-1 ring-vx-line" : "text-vx-muted hover:text-vx-ink",
              )}
            >
              {t.label}
              <span className={cn("font-mono text-[11px] tabular-nums", tab === t.key ? "text-vx-muted" : "text-vx-faint")}>{count}</span>
            </button>
          );
        })}
      </div>

      {loadFailed && <p role="alert" className="mt-6 text-[14px] text-vx-red">Couldn&apos;t load listings. Refresh to try again.</p>}

      <div className="mt-6 flex flex-col gap-4">
        {rows.length === 0 && !loadFailed && (
          <p className="rounded-xl border border-dashed border-vx-line px-6 py-12 text-center text-[14px] text-vx-muted">
            {tab === "review" ? "Nothing waiting for review." : "Nothing here yet."}
          </p>
        )}
        {rows.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </main>
  );
}

function ListingCard({ listing: l }: { listing: AdminListing }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    niche: l.niche ?? "",
    sub_niche: l.sub_niche ?? "",
    asking_price_usd: l.asking_price_usd ? String(Number(l.asking_price_usd)) : "",
    monetization: l.monetization ?? "",
    language: l.language ?? "",
    admin_notes: l.admin_notes ?? "",
  });

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError("");
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        setEditing(false);
        setConfirmReject(false);
      }
    });

  const status = (s: ListingStatus) => run(() => setListingStatus(l.id, s));
  const save = (approve: boolean) =>
    run(() =>
      updateListing(
        l.id,
        { ...form, asking_price_usd: form.asking_price_usd ? Number(form.asking_price_usd) : null },
        approve,
      ),
    );

  const stats: [string, string][] = [
    ["Subscribers", fmt(l.subscribers)],
    ["Monthly views", l.monthly_views ? fmt(l.monthly_views) : "—"],
    ["Revenue / mo", l.monthly_revenue_usd ? usd(Number(l.monthly_revenue_usd)) : "—"],
    ["Engagement", l.engagement_rate ? `${Number(l.engagement_rate)}%` : "—"],
    ["Channel age", l.account_age_months ? `${(l.account_age_months / 12).toFixed(1)} yrs` : "—"],
    ["Asking", l.asking_price_usd ? usd(Number(l.asking_price_usd)) : "—"],
  ];

  return (
    <article className="rounded-xl border border-vx-line bg-vx-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={l.channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[18px] tracking-[-0.02em] text-vx-ink hover:underline hover:underline-offset-4"
          >
            {l.channel_name} <ArrowUpRight className="size-4 text-vx-muted" aria-hidden />
          </a>
          <div className="mt-0.5 text-[13px] text-vx-muted">
            {[tidyNiche(l.niche), l.sub_niche, l.monetization, l.language].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-vx-faint">{date(l.created_at)}</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", STATUS[l.status].pill)}>{STATUS[l.status].label}</span>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-vx-line bg-vx-line sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([k, v]) => (
          <div key={k} className="bg-vx-surface px-3.5 py-3">
            <dt className="text-[11px] text-vx-muted">{k}</dt>
            <dd className="mt-1 truncate font-mono text-[14px] text-vx-ink tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 text-[13px] text-vx-body">
        <span className="text-vx-muted">Seller: </span>
        {[l.seller_contact_name || l.seller?.full_name, l.seller_contact_email, l.seller?.email && l.seller.email !== l.seller_contact_email ? `account ${l.seller.email}` : null]
          .filter(Boolean)
          .join(" · ") || "No contact details"}
      </div>
      {l.seller_notes && (
        <p className="mt-2 text-[13px] whitespace-pre-line text-vx-body">
          <span className="text-vx-muted">From the seller: </span>
          {l.seller_notes}
        </p>
      )}
      {l.admin_notes && !editing && (
        <p className="mt-2 text-[13px] text-vx-body">
          <span className="text-vx-muted">Notes: </span>
          {l.admin_notes}
        </p>
      )}

      {editing && (
        <div className="mt-5 grid gap-4 border-t border-vx-line pt-5 sm:grid-cols-2">
          <Field id={`niche-${l.id}`} label="Niche" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
          <Field id={`sub-${l.id}`} label="Sub-niche" value={form.sub_niche} onChange={(e) => setForm({ ...form, sub_niche: e.target.value })} />
          <Field
            id={`price-${l.id}`}
            label="Asking price (USD)"
            type="number"
            min={0}
            value={form.asking_price_usd}
            onChange={(e) => setForm({ ...form, asking_price_usd: e.target.value })}
          />
          <Field id={`mono-${l.id}`} label="Monetization" value={form.monetization} onChange={(e) => setForm({ ...form, monetization: e.target.value })} />
          <Field id={`lang-${l.id}`} label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          <div className="sm:col-span-2">
            <Label htmlFor={`notes-${l.id}`} className={labelClass}>Private notes</Label>
            <textarea
              id={`notes-${l.id}`}
              rows={2}
              value={form.admin_notes}
              onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
              placeholder="Only visible to admins"
              className={cn(fieldClass, "h-auto w-full resize-y border py-2.5 outline-none")}
            />
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 text-[13px] text-vx-red">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-vx-line pt-4">
        {pending && <Spinner className="mr-1 text-vx-muted" />}
        {editing ? (
          <>
            {l.status === "draft" && (
              <Button variant="brand" size="pillSm" disabled={pending} onClick={() => save(true)}>
                Save &amp; approve
              </Button>
            )}
            <Button variant="brandOutline" size="pillSm" disabled={pending} onClick={() => save(false)}>
              Save
            </Button>
            <Button variant="ghost" size="pillSm" disabled={pending} onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </>
        ) : confirmReject ? (
          <>
            <span className="text-[13px] text-vx-body">Reject this listing? The seller will see “Not approved”.</span>
            <Button variant="destructive" size="pillSm" disabled={pending} onClick={() => status("rejected")}>
              Yes, reject
            </Button>
            <Button variant="ghost" size="pillSm" disabled={pending} onClick={() => setConfirmReject(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            {l.status === "draft" && (
              <Button variant="brand" size="pillSm" disabled={pending} onClick={() => status("available")}>
                Approve
              </Button>
            )}
            {l.status === "available" && (
              <Button variant="brandOutline" size="pillSm" disabled={pending} onClick={() => status("pending_sale")}>
                Mark in negotiation
              </Button>
            )}
            {(l.status === "available" || l.status === "pending_sale") && (
              <Button variant="brandOutline" size="pillSm" disabled={pending} onClick={() => status("sold")}>
                Mark sold
              </Button>
            )}
            {l.status === "pending_sale" && (
              <Button variant="ghost" size="pillSm" disabled={pending} onClick={() => status("available")}>
                Back to live
              </Button>
            )}
            {(l.status === "rejected" || l.status === "withdrawn") && (
              <Button variant="brandOutline" size="pillSm" disabled={pending} onClick={() => status("draft")}>
                Move back to review
              </Button>
            )}
            <Button variant="ghost" size="pillSm" disabled={pending} onClick={() => setEditing(true)}>
              Edit
            </Button>
            {l.status === "draft" && (
              <Button variant="ghost" size="pillSm" className="text-vx-red hover:text-vx-red" disabled={pending} onClick={() => setConfirmReject(true)}>
                Reject
              </Button>
            )}
            {l.status === "available" && (
              <Button variant="ghost" size="pillSm" disabled={pending} onClick={() => status("withdrawn")}>
                Unlist
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
