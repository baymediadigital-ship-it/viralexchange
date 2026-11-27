import Link from "next/link";
import { Logo } from "./SiteNav";
import { SectionLink } from "./SectionLink";
import { BUYERS_LOUNGE_OPEN, CONTACT_EMAIL, TELEGRAM_URL, X_URL } from "./links";

const colLink = "text-[14px] text-vx-muted transition-colors duration-150 hover:text-vx-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-vx-line bg-vx-canvas">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[14px] leading-relaxed text-vx-muted">
            The #1 marketplace for buying and selling YouTube channels. Secure, private, and professional.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-[12px] text-vx-faint">Platform</h4>
          <Link href="/listings" className={colLink}>Browse channels</Link>
          <Link href="/valuation" className={colLink}>Free valuation</Link>
          <Link href="/deals" className={colLink}>Deal pipeline</Link>
          <SectionLink section="submit" className={colLink}>Sell a channel</SectionLink>
          {BUYERS_LOUNGE_OPEN && <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={colLink}>Buyers Lounge</a>}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-[12px] text-vx-faint">Process</h4>
          <SectionLink section="process" className={colLink}>How it works</SectionLink>
          <SectionLink section="deals" className={colLink}>Closed deals</SectionLink>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-[12px] text-vx-faint">Contact</h4>
          <a href={`mailto:${CONTACT_EMAIL}`} className={colLink}>{CONTACT_EMAIL}</a>
          {BUYERS_LOUNGE_OPEN && <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={colLink}>Telegram</a>}
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className={colLink}>@viralexchangeHQ</a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-vx-line px-5 py-6 sm:px-6">
        <p className="text-[13px] text-vx-muted">&copy; {new Date().getFullYear()} ViralExchange. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="text-[13px] text-vx-muted hover:text-vx-ink">Privacy</Link>
          <Link href="/terms" className="text-[13px] text-vx-muted hover:text-vx-ink">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
