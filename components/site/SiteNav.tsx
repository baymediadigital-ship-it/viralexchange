import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TELEGRAM_URL } from "./links";
import { ThemeToggle } from "./ThemeToggle";
import { SectionLink } from "./SectionLink";
import { NavLink } from "./NavLink";

const linkClass = "rounded-md px-3 py-1.5 text-[14px] text-vx-muted transition-[color,scale] duration-150 hover:text-vx-ink active:scale-[0.97] active:duration-100 aria-[current=page]:text-vx-ink";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="size-7 overflow-hidden rounded-[7px] ring-1 ring-vx-ink/10">
        <img src="/logo.jpg" alt="" className="size-full object-cover" />
      </span>
      <span className="text-[16px] font-medium tracking-[-0.015em] text-vx-ink">ViralExchange</span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <nav className="vx-nav sticky top-0 z-50 border-b border-vx-line bg-vx-canvas/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/valuation" className={linkClass}>Free valuation</NavLink>
          <SectionLink section="deals" className={linkClass}>Closed deals</SectionLink>
          <NavLink href="/deals" className={linkClass}>Pipeline</NavLink>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>Buyers Lounge</a>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <NavLink href="/valuation" className={`${linkClass} hidden sm:inline-flex md:hidden`}>Valuation</NavLink>
          <SectionLink section="submit" className={buttonVariants({ variant: "brand", size: "pillSm" })}>
            Sell a channel
          </SectionLink>
        </div>
      </div>
    </nav>
  );
}
