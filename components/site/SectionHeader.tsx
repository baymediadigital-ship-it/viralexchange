import { cn } from "@/lib/utils";
import { GradientText } from "./Decor";

export function Eyebrow({ label, detail, className }: { label: string; detail: string; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-vx-line bg-white py-1.5 pr-3.5 pl-3 text-[13px] font-medium text-vx-muted shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-vx-blue" />
      {label}
      <span className="text-vx-line">/</span>
      <span className="font-semibold text-vx-blue">{detail}</span>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  detail,
  title,
  highlight,
  sub,
}: {
  eyebrow: string;
  detail: string;
  title: string;
  highlight: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
      <Eyebrow label={eyebrow} detail={detail} />
      <h2 className="mt-5 text-[32px] leading-[1.12] font-extrabold tracking-[-0.025em] text-balance text-vx-ink sm:text-[44px]">
        {title} <GradientText>{highlight}</GradientText>
      </h2>
      {sub && <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-pretty text-vx-body">{sub}</p>}
    </div>
  );
}
