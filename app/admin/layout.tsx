import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo, PillNav } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const linkClass = "hidden rounded-full px-3 py-1.5 text-[14px] text-vx-muted transition-[color,background-color,scale] duration-150 hover:bg-vx-subtle hover:text-vx-ink active:scale-[0.97] active:duration-100 sm:inline-flex";

// Access is enforced twice: lib/supabase/middleware.ts redirects non-admins
// away from /admin, and every query/action here runs under admin-only RLS.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <PillNav>
        <Logo />
        <div className="flex items-center gap-1">
          <Link href="/listings" className={linkClass}>Live listings</Link>
          <Link href="/account" className={linkClass}>Account</Link>
          <ThemeToggle />
          <form action={signOut}>
            <button type="submit" className={buttonVariants({ variant: "brandOutline", size: "pillSm", className: "h-9 rounded-full px-4" })}>
              Sign out
            </button>
          </form>
        </div>
      </PillNav>
      {children}
    </div>
  );
}
