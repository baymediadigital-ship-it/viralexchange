import Link from "next/link";
import { Logo, PillNav } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { AccountMenu } from "@/components/site/AccountMenu";

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
          <AccountMenu />
        </div>
      </PillNav>
      {children}
    </div>
  );
}
