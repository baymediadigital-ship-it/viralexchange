/**
 * Soft arrival for members pages: content fades in and rises a few pixels
 * when a page mounts, which happens on every navigation between them (CSS in
 * globals.css). Goes in each page.tsx rather than the layout, so the nav
 * stays still as a fixed anchor and only the content moves.
 *
 * Plain CSS on purpose: React's <ViewTransition> didn't fire on App Router
 * navigations in this Next.js version (checked in dev and production builds).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="vx-page-in">{children}</div>;
}

/** Wraps loading skeletons so they appear immediately, with only a quick fade. */
export function SkeletonTransition({ children }: { children: React.ReactNode }) {
  return <div className="vx-skeleton-in">{children}</div>;
}
