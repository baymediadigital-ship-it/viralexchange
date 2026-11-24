import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { signOut } from "@/lib/actions/auth";

const linkClass = "hidden rounded-md px-3 py-1.5 text-[14px] text-vx-muted transition-[color,scale] duration-150 hover:text-vx-ink active:scale-[0.97] active:duration-100 sm:inline-flex";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <nav className="vx-nav sticky top-0 z-50 border-b border-vx-line bg-vx-canvas/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/" className={linkClass}>Home</Link>
            <Link href="/deals" className={linkClass}>Pipeline</Link>
            <ThemeToggle />
            <form action={signOut}>
              <button type="submit" className={buttonVariants({ variant: "brandOutline", size: "pillSm" })}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
