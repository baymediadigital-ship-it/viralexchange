import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

/** Shared shell for Privacy and Terms: readable measure, numbered sections. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />
      <main className="px-5 sm:px-6">
        <article className="vx-page-in mx-auto max-w-2xl pt-16 pb-24 sm:pt-20">
          <div className="font-mono text-[12px] tracking-[0.06em] text-vx-muted uppercase">Last updated {updated}</div>
          <h1 className="mt-5 text-[40px] leading-[1.05] font-normal tracking-[-0.04em] text-vx-ink sm:text-[52px]">{title}</h1>
          <div className="mt-6 text-[16px] leading-relaxed text-vx-body">{intro}</div>
          <div className="mt-12 flex flex-col gap-10 border-t border-vx-line pt-10 [&_a]:text-vx-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="text-[15px] leading-relaxed text-vx-body">
      <h2 className="flex items-baseline gap-3 text-[20px] font-normal tracking-[-0.02em] text-vx-ink">
        <span className="font-mono text-[12px] text-vx-faint">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
