import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUYERS_LOUNGE_OPEN, TELEGRAM_URL } from "./links";
import { ThemeToggle } from "./ThemeToggle";
import { SectionLink } from "./SectionLink";
import { NavLink } from "./NavLink";
import { AccountMenu } from "./AccountMenu";

const linkClass = "rounded-full px-3 py-1.5 text-[14px] text-vx-muted transition-[color,background-color,scale] duration-150 hover:bg-vx-subtle hover:text-vx-ink active:scale-[0.97] active:duration-100 aria-[current=page]:text-vx-ink";

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

/**
 * Floating capsule nav. The sticky wrapper spans the page width but ignores
 * pointer events, so only the capsule itself blocks clicks on content below.
 */
export function PillNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="pointer-events-none sticky top-3 z-50 px-4 pt-3 sm:px-6">
      <nav
        className={cn(
          "vx-pillnav pointer-events-auto mx-auto flex h-14 w-full max-w-fit items-center gap-3 rounded-full border border-vx-line bg-vx-surface/95 py-2 pr-2 pl-4 shadow-[0_10px_30px_-14px_rgba(var(--vx-shadow-rgb),0.3)] sm:gap-6",
          className,
        )}
      >
        {children}
      </nav>
    </div>
  );
}

export function SiteNav() {
  return (
    <PillNav>
      <Logo />
      <div className="hidden items-center md:flex">
        <NavLink href="/listings" className={linkClass}>Browse channels</NavLink>
        <NavLink href="/valuation" className={linkClass}>Free valuation</NavLink>
        <NavLink href="/deals" className={linkClass}>Pipeline</NavLink>
        {BUYERS_LOUNGE_OPEN && <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>Buyers Lounge</a>}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {/* AccountMenu orders itself: "Log in" before this CTA, the avatar after it. */}
        <SectionLink section="submit" className={buttonVariants({ variant: "brand", size: "pillSm", className: "order-2 h-9 rounded-full px-4" })}>
          <span className="sm:hidden">Sell</span>
          <span className="hidden sm:inline">Sell a channel</span>
        </SectionLink>
        <AccountMenu />
      </div>
    </PillNav>
  );
}
