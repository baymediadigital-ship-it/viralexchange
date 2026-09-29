import { cn } from "@/lib/utils";

export function Rings({ size = 900, className }: { size?: number; className?: string }) {
  const c = size / 2;
  const step = size / 8.5;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("pointer-events-none absolute left-1/2 -translate-x-1/2 text-vx-blue", className)}
    >
      {[0.45, 0.3, 0.18, 0.09].map((opacity, i) => (
        <circle key={i} cx={c} cy={c} r={step * (i + 1)} fill="none" stroke="currentColor" strokeWidth="1" opacity={opacity} />
      ))}
    </svg>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
  );
}
