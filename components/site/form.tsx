import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const fieldClass =
  "h-10 rounded-lg border-vx-line-strong bg-vx-surface px-3 text-[14px] text-vx-ink transition-colors duration-150 placeholder:text-vx-faint hover:border-vx-faint focus-visible:border-vx-muted focus-visible:ring-3 focus-visible:ring-vx-ink/8 md:text-[14px]";
export const labelClass = "mb-1.5 text-[13px] font-medium text-vx-body";
export const selectClass = cn(
  fieldClass,
  "w-full appearance-none border bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[position:right_14px_center] bg-no-repeat pr-9 outline-none",
);

export function Field({ id, label, className, ...props }: { id: string; label: string } & React.ComponentProps<"input">) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClass}>{label}</Label>
      <Input id={id} className={fieldClass} {...props} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  className,
  children,
  ...props
}: { id: string; label: string } & React.ComponentProps<"select">) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClass}>{label}</Label>
      <select id={id} className={selectClass} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cn("size-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-7 mb-4 flex items-center gap-3 font-mono text-[12px] text-vx-muted">
      {children}
      <span className="h-px flex-1 bg-vx-line" />
    </div>
  );
}
