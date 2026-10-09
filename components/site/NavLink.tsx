"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Nav link that marks itself as the current page, so visitors always know where they are. */
export function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const current = usePathname() === href;
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}
