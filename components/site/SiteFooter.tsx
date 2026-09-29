import Link from "next/link";
import { Logo } from "./SiteNav";
import { CONTACT_EMAIL, TELEGRAM_URL, X_URL } from "./links";

const colLink = "text-[14px] text-vx-body transition-colors hover:text-vx-blue";

export function SiteFooter() {
  return (
    <footer className="border-t border-vx-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[14px] leading-relaxed text-vx-muted">
            The #1 marketplace for buying and selling YouTube channels. Secure, private, and professional.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-[12px] font-bold tracking-[0.08em] text-vx-ink uppercase">Platform</h4>
          <Link href="/valuation" className={colLink}>Free valuation</Link>
          <Link href="/deals" className={colLink}>Deal pipeline</Link>
          <Link href="/#submit" className={colLink}>Sell a channel</Link>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={colLink}>Buyers Lounge</a>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-[12px] font-bold tracking-[0.08em] text-vx-ink uppercase">Process</h4>
          <Link href="/#process" className={colLink}>How it works</Link>
          <Link href="/#deals" className={colLink}>Closed deals</Link>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-[12px] font-bold tracking-[0.08em] text-vx-ink uppercase">Contact</h4>
          <a href={`mailto:${CONTACT_EMAIL}`} className={colLink}>{CONTACT_EMAIL}</a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={colLink}>Telegram</a>
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className={colLink}>@viralexchangeHQ</a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-vx-line px-5 py-6 sm:px-6">
        <p className="text-[13px] text-vx-muted">&copy; {new Date().getFullYear()} ViralExchange. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="text-[13px] text-vx-muted hover:text-vx-ink">Privacy</a>
          <a href="#" className="text-[13px] text-vx-muted hover:text-vx-ink">Terms</a>
        </div>
      </div>
    </footer>
  );
}
