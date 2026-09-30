import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GradientText } from "@/components/site/Decor";
import { IconArrowRight } from "@/components/Icon";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AccountListing = { id: string; channel_name: string; niche: string | null; asking_price_usd: number | null; status: string; created_at: string };
export type AccountApplication = { id: string; niche: string | null; budget_range: string | null; status: string; created_at: string };

const PILL = {
  neutral: "bg-vx-subtle text-vx-body",
  amber: "bg-vx-amber-bg text-vx-amber",
  info: "bg-vx-info-bg text-vx-info",
  green: "bg-vx-green-bg text-vx-green",
  muted: "bg-vx-subtle text-vx-muted",
};

const LISTING_STATUS: Record<string, { label: string; pill: string }> = {
  draft: { label: "Under review", pill: PILL.neutral },
  available: { label: "Live & available", pill: PILL.green },
  pending_sale: { label: "In negotiation", pill: PILL.amber },
  sold: { label: "Sold", pill: PILL.info },
  withdrawn: { label: "Withdrawn", pill: PILL.muted },
};

const APPLICATION_STATUS: Record<string, { label: string; pill: string }> = {
  new: { label: "Submitted", pill: PILL.neutral },
  reviewing: { label: "In review", pill: PILL.amber },
  contacted: { label: "Contacted", pill: PILL.info },
  matched: { label: "Matched", pill: PILL.green },
  closed: { label: "Closed", pill: PILL.muted },
};

const BUDGET: Record<string, string> = {
  "3000_7000": "$3,000 – $7,000",
  "7000_15000": "$7,000 – $15,000",
  "15000_30000": "$15,000 – $30,000",
  "30000_plus": "$30,000+",
};

const submitted = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function Pill({ status, map }: { status: string; map: Record<string, { label: string; pill: string }> }) {
  const s = map[status] ?? { label: status, pill: PILL.neutral };
  return <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap", s.pill)}>{s.label}</span>;
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="vx-reveal mt-10">
      <h2 className="flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.02em] text-vx-ink">
        {title}
        <span className="rounded-full bg-vx-subtle px-2 py-0.5 text-[12px] font-semibold text-vx-muted tabular-nums">{count}</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-vx-line bg-vx-surface/60 px-6 py-10 text-center">
      <p className="text-[15px] text-vx-body">{text}</p>
      <Link href={href} className={buttonVariants({ variant: "brand", size: "pillSm" })}>
        {cta} <IconArrowRight size={14} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
      </Link>
    </div>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-vx-line overflow-hidden rounded-3xl bg-vx-surface shadow-vx-card ring-1 ring-vx-line/80">{children}</ul>;
}

export function AccountView({ email, listings, applications }: { email: string; listings: AccountListing[]; applications: AccountApplication[] }) {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
      <div className="vx-rise">
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.04em] text-vx-ink sm:text-[42px]">
          My <GradientText>account</GradientText>
        </h1>
        <p className="mt-2 text-[15px] text-vx-muted">{email}</p>
      </div>

      <Section title="My listings" count={listings.length}>
        {listings.length === 0 ? (
          <Empty text="You haven't submitted a channel yet." href="/#submit" cta="Sell a channel" />
        ) : (
          <Rows>
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-vx-ink">{l.channel_name}</div>
                  <div className="mt-0.5 text-[13px] text-vx-muted sm:truncate">
                    {[l.niche, usd(l.asking_price_usd), `Submitted ${submitted(l.created_at)}`].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <Pill status={l.status} map={LISTING_STATUS} />
              </li>
            ))}
          </Rows>
        )}
      </Section>

      <Section title="My acquisition applications" count={applications.length}>
        {applications.length === 0 ? (
          <Empty text="No applications yet." href="/acquire" cta="Apply to acquire a channel" />
        ) : (
          <Rows>
            {applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-vx-ink">{a.niche || "Any niche"}</div>
                  <div className="mt-0.5 text-[13px] text-vx-muted sm:truncate">
                    Budget {a.budget_range ? BUDGET[a.budget_range] ?? a.budget_range : "—"} · Submitted {submitted(a.created_at)}
                  </div>
                </div>
                <Pill status={a.status} map={APPLICATION_STATUS} />
              </li>
            ))}
          </Rows>
        )}
      </Section>
    </main>
  );
}
