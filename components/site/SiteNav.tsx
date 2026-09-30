import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TELEGRAM_URL } from "./links";
import { ThemeToggle } from "./ThemeToggle";
import { SectionLink } from "./SectionLink";

const linkClass = "rounded-full px-3 py-2 text-[14px] font-medium text-vx-body transition-colors hover:bg-vx-subtle hover:text-vx-ink";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="size-8 overflow-hidden rounded-[9px] ring-1 ring-vx-ink/10">
        <img src="/logo.jpg" alt="" className="size-full object-cover" />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-vx-ink">ViralExchange</span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-vx-line/80 bg-vx-surface/95">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/valuation" className={linkClass}>Free valuation</Link>
          <SectionLink section="deals" className={linkClass}>Closed deals</SectionLink>
          <Link href="/deals" className={linkClass}>Pipeline</Link>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>Buyers Lounge</a>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link href="/valuation" className={`${linkClass} hidden sm:inline-flex md:hidden`}>Valuation</Link>
          <SectionLink section="submit" className={buttonVariants({ variant: "brand", size: "pillSm", className: "px-4 sm:px-5" })}>
            Sell a channel
          </SectionLink>
        </div>
      </div>
    </nav>
  );
}
