import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <div className="vx-page flex min-h-screen flex-col bg-vx-canvas text-vx-ink antialiased">
      <SiteNav />
      <main className="flex flex-1 items-center px-5 sm:px-6">
        <div className="vx-page-in mx-auto w-full max-w-6xl py-24 sm:py-32">
          <div className="font-mono text-[12px] tracking-[0.06em] text-vx-muted uppercase">404 · Page not found</div>
          <h1 className="mt-5 max-w-2xl text-[40px] leading-[1.05] font-normal tracking-[-0.04em] text-vx-ink sm:text-[60px]">
            This page doesn&apos;t exist.
            <br />
            <span className="text-vx-muted">The channels do.</span>
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-vx-body">The link may be old or mistyped. Here&apos;s where most people are headed:</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/" className={buttonVariants({ variant: "brand", size: "pill" })}>
              Go home
            </Link>
            <Link href="/listings" className={buttonVariants({ variant: "brandOutline", size: "pill" })}>
              Browse listings
            </Link>
            <Link href="/valuation" className={buttonVariants({ variant: "ghost", size: "pill", className: "text-vx-body hover:bg-vx-subtle hover:text-vx-ink" })}>
              Free valuation
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
