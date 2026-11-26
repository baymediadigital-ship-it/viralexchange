import { SkeletonTransition } from "./PageTransition";

// Placeholders shown the instant someone clicks into a members page, while
// its data loads. Shapes mirror the real pages so the hand-off feels like the
// content filling in rather than a layout jump.

const bar = "animate-pulse rounded-md bg-vx-subtle motion-reduce:animate-none";

function Rows({ count }: { count: number }) {
  return (
    <div className="divide-y divide-vx-line overflow-hidden rounded-xl border border-vx-line bg-vx-surface">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex-1 space-y-2">
            <div className={`${bar} h-4 w-48`} />
            <div className={`${bar} h-3 w-64 max-w-full`} />
          </div>
          <div className={`${bar} h-6 w-24 rounded-full`} />
        </div>
      ))}
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <SkeletonTransition>
      <main aria-busy="true" aria-label="Loading your account" className="mx-auto max-w-3xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
        <div className={`${bar} h-10 w-56`} />
        <div className={`${bar} mt-3 h-4 w-44`} />
        <div className={`${bar} mt-10 h-5 w-32`} />
        <div className="mt-4">
          <Rows count={2} />
        </div>
        <div className={`${bar} mt-10 h-5 w-56`} />
        <div className="mt-4">
          <Rows count={1} />
        </div>
      </main>
    </SkeletonTransition>
  );
}

export function SettingsSkeleton() {
  return (
    <SkeletonTransition>
      <main aria-busy="true" aria-label="Loading settings" className="mx-auto max-w-2xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
        <div className={`${bar} h-4 w-24`} />
        <div className={`${bar} mt-4 h-10 w-40`} />
        <div className="mt-8 flex flex-col gap-4">
          {[180, 150, 110].map((h) => (
            <div key={h} className="rounded-xl border border-vx-line bg-vx-surface p-6 sm:p-7" style={{ height: h }}>
              <div className={`${bar} h-4 w-28`} />
              <div className={`${bar} mt-2 h-3 w-64 max-w-full`} />
            </div>
          ))}
        </div>
      </main>
    </SkeletonTransition>
  );
}

export function AdminSkeleton() {
  return (
    <SkeletonTransition>
      <main aria-busy="true" aria-label="Loading listings" className="mx-auto max-w-5xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
        <div className={`${bar} h-3 w-14`} />
        <div className={`${bar} mt-4 h-10 w-40`} />
        <div className={`${bar} mt-3 h-4 w-96 max-w-full`} />
        <div className={`${bar} mt-8 h-[42px] w-96 max-w-full rounded-lg`} />
        <div className="mt-6 flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-vx-line bg-vx-surface p-5 sm:p-6">
              <div className={`${bar} h-5 w-56`} />
              <div className={`${bar} mt-2 h-3 w-40`} />
              <div className={`${bar} mt-5 h-16 w-full rounded-lg`} />
            </div>
          ))}
        </div>
      </main>
    </SkeletonTransition>
  );
}
