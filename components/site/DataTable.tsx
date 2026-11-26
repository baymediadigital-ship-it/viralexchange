// Shared pieces for the public listings and deal tables.

export function Cell({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[12px] text-vx-muted md:hidden">{label}</div>
      <div className="text-[15px] font-medium text-vx-ink tabular-nums">{children}</div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-5 md:px-6">
      <div className="size-10 animate-pulse rounded-xl bg-vx-subtle" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 animate-pulse rounded bg-vx-subtle" />
        <div className="h-3 w-24 animate-pulse rounded bg-vx-subtle" />
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-12 text-center text-[14px] text-vx-muted">{children}</p>;
}

export const tableShell = "overflow-hidden rounded-xl bg-vx-surface ring-1 ring-vx-line";
export const headRow = "hidden border-b border-vx-line px-6 py-3 bg-vx-canvas font-mono text-[11px] text-vx-muted md:grid";
