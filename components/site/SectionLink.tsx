"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A link to a homepage section. On the homepage it's a plain in-page anchor, so the
// browser's smooth scroll applies (router navigations are instant by design, see
// data-scroll-behavior in app/layout.tsx). Elsewhere it's a normal Link to "/#section".
export function SectionLink({ section, className, children }: { section: string; className?: string; children: React.ReactNode }) {
  const onHome = usePathname() === "/";
  if (onHome) {
    return (
      <a href={`#${section}`} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={`/#${section}`} className={className}>
      {children}
    </Link>
  );
}
