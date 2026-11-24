import { cn } from "@/lib/utils";

/** Small monospace label above a heading, e.g. "01  How it works". */
export function Eyebrow({ index, label, className }: { index?: string; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-[12px] tracking-[0.01em] text-vx-muted", className)}>
      {index && <span className="text-vx-faint">{index}</span>}
      {label}
    </div>
  );
}

/** Section opener: heading on the left, a short supporting paragraph on the right. */
export function SectionHeader({
  index,
  label,
  title,
  sub,
  className,
}: {
  index?: string;
  label: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("vx-reveal mb-12 grid gap-6 lg:mb-14 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16", className)}>
      <div>
        <Eyebrow index={index} label={label} />
        <h2 className="mt-4 text-[34px] leading-[1.08] font-normal tracking-[-0.035em] text-balance text-vx-ink sm:text-[46px]">{title}</h2>
      </div>
      {sub && <p className="max-w-md text-[15px] leading-relaxed text-pretty text-vx-body lg:justify-self-end lg:text-right">{sub}</p>}
    </div>
  );
}
