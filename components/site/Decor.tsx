import { cn } from "@/lib/utils";

// The redesign is deliberately undecorated: these keep their names so existing
// pages compile, but render flat.

/** Decorative rings were retired; renders nothing. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Rings(_props: { size?: number; className?: string }) {
  return null;
}

/** Formerly a gradient fill; now plain text in the surrounding color. */
export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}

export function IconTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex size-10 items-center justify-center rounded-lg border border-vx-line bg-vx-surface text-vx-ink", className)}>
      {children}
    </div>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
  );
}
