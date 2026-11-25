import { cn } from "@/lib/utils";

/**
 * The ViralExchange mark as a vector, drawn in currentColor so it follows the
 * text color (ink in light mode, near-white in dark). Used in the nav only; the
 * favicon and social images keep the original logo.jpg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="20 24 64 50" fill="currentColor" aria-hidden className={cn("h-5 w-auto", className)}>
      <path d="M66.2 28.5H79.6L37.8 69.5H25.2Z" />
      <path d="M74.2 69.5H67C65.3 69.5 63.9 68.8 62.9 67.5L43.6 43.1C40.6 39.4 40.2 36.8 37.6 36.8C35 36.8 33.2 38.6 33.2 40.8C33.2 42.1 33.9 43.3 35.6 44.2L29.3 50.4C25.9 47.4 24 43.8 24 39.8C24 33.1 29.9 28.5 37.4 28.5C44.5 28.5 49.5 33.5 53.5 40.2Z" />
    </svg>
  );
}
