import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo, PillNav } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { signOut } from "@/lib/actions/auth";

const linkClass = "hidden rounded-full px-3 py-1.5 text-[14px] text-vx-muted transition-[color,background-color,scale] duration-150 hover:bg-vx-subtle hover:text-vx-ink active:scale-[0.97] active:duration-100 sm:inline-flex";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vx-page min-h-screen bg-vx-canvas text-vx-ink antialiased">
      <PillNav>
        <Logo />
        <div className="flex items-center gap-1">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/deals" className={linkClass}>Pipeline</Link>
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
