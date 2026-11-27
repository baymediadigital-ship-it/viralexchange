import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  return {
    title: { absolute: `${g.metaTitle} | ViralExchange` },
    description: g.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: `https://viralexchange.io${path}`,
      title: g.metaTitle,
      description: g.description,
      publishedTime: g.published,
      modifiedTime: g.updated,
      images: ["/logo.jpg"],
    },
    twitter: { card: "summary", title: g.metaTitle, description: g.description, images: ["/logo.jpg"] },
  };
}

const CTA = {
  sellers: {
    title: "What's your channel worth?",
    body: "Get a free valuation in about a minute. No account needed, and no obligation to sell.",
    primary: { href: "/valuation", label: "Get a free valuation" },
    secondary: { href: "/#submit", label: "List your channel" },
  },
  buyers: {
    title: "Looking for a channel?",
    body: "Every listing is verified before it goes live, and every deal closes through escrow.",
    primary: { href: "/listings", label: "Browse channels for sale" },
    secondary: { href: "/acquire", label: "Tell us what you want" },
  },
} as const;

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  const cta = CTA[g.audience];
  const related = g.related.map(guideBySlug).filter((r) => r !== undefined);
  const updated = new Date(g.updated + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <JsonLd data={articleJsonLd({ title: g.title, description: g.description, path, published: g.published, updated: g.updated })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: g.title, path },
        ])}
      />
      <SiteNav />
      <main className="px-5 sm:px-6">
        <article className="vx-page-in mx-auto max-w-2xl pt-12 pb-20 sm:pt-16">
          <nav aria-label="Breadcrumb">
            <Link href="/guides" className="inline-flex items-center gap-1.5 text-[13px] text-vx-muted transition-colors hover:text-vx-ink">
              <ArrowLeft className="size-3.5" aria-hidden /> All guides
            </Link>
          </nav>
          <div className="mt-8 font-mono text-[12px] tracking-[0.06em] text-vx-muted uppercase">
            For {g.audience} · Updated {updated}
          </div>
          <h1 className="mt-4 text-[36px] leading-[1.08] font-normal tracking-[-0.04em] text-balance text-vx-ink sm:text-[48px]">{g.title}</h1>
          <p className="mt-6 text-[18px] leading-relaxed text-pretty text-vx-body">{g.intro}</p>

          <div className="mt-10 flex flex-col gap-9 border-t border-vx-line pt-10 text-[16px] leading-relaxed text-vx-body">
            {g.blocks.map((b, i) => (
              <section key={i}>
                {b.h && <h2 className="text-[22px] leading-snug font-normal tracking-[-0.02em] text-vx-ink">{b.h}</h2>}
                {b.p?.map((t, j) => (
                  <p key={j} className="mt-3 text-pretty">
                    {t}
                  </p>
                ))}
                {b.list && (
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {b.list.map((t, j) => (
                      <li key={j} className="flex gap-3">
                        <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-vx-accent" />
                        <span className="text-pretty">{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {b.after?.map((t, j) => (
                  <p key={j} className="mt-4 text-pretty">
                    {t}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <aside className="mt-14 rounded-xl border border-vx-line bg-vx-surface p-6 sm:p-7">
            <div className="text-[20px] tracking-[-0.02em] text-vx-ink">{cta.title}</div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-vx-body">{cta.body}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href={cta.primary.href} className={buttonVariants({ variant: "brand", size: "pillSm" })}>
                {cta.primary.label}
              </Link>
              <Link href={cta.secondary.href} className={buttonVariants({ variant: "brandOutline", size: "pillSm" })}>
                {cta.secondary.label}
              </Link>
            </div>
          </aside>

          {related.length > 0 && (
            <section className="mt-14" aria-labelledby="related">
              <h2 id="related" className="font-mono text-[12px] tracking-[0.06em] text-vx-faint uppercase">
                Keep reading
              </h2>
              <ul className="mt-4 divide-y divide-vx-line border-y border-vx-line">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/guides/${r.slug}`} className="group flex items-center justify-between gap-4 py-4 text-[16px] text-vx-ink">
                      <span className="text-pretty">{r.title}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-vx-muted transition-colors group-hover:text-vx-ink" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
