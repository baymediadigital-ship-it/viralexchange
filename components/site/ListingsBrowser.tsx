"use client";

import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelegramIcon } from "./Decor";
import { TELEGRAM_URL } from "./links";
import { fieldClass } from "./form";
import { FadeScroller } from "./FadeScroller";
import { Cell, Empty, RowSkeleton, headRow, tableShell } from "./DataTable";
import { IconLock, IconSearch } from "@/components/Icon";
import { fmt, nicheLabel, nicheShort, usd } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Public listing row. No channel_name: listings stay anonymous until the deal stage. */
export type PublicListing = { id: string; niche: string | null; subscribers: number | null; monthly_views: number | null; asking_price_usd: number | null };

export const PUBLIC_LISTING_FIELDS = "id,niche,subscribers,monthly_views,asking_price_usd";

const LISTING_COLS = "md:grid-cols-[2fr_1fr_1fr_1fr_0.9fr_auto]";

/** Niche filter, search and table of approved listings. */
export function ListingsBrowser({ listings, failed }: { listings: PublicListing[] | null; failed: boolean }) {
  const [niche, setNiche] = useState("all");
  const [query, setQuery] = useState("");

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

  return (
    <>
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
    </>
  );
}
