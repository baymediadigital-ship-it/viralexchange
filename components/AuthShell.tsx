import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Spinner, fieldClass, labelClass } from "@/components/site/form";
import { cn } from "@/lib/utils";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="vx-page relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-vx-hero-1 via-vx-hero-2 to-vx-canvas text-vx-ink antialiased">
      <div aria-hidden className="pointer-events-none absolute -top-56 left-1/2 size-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--vx-glow-1),transparent)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--vx-shadow-rgb),0.06)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <header className="relative mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 pt-6 pb-16 sm:px-6">
        <div className="vx-rise w-full max-w-[420px] rounded-[28px] bg-vx-surface p-7 shadow-[0_40px_80px_-40px_rgba(var(--vx-shadow-rgb),0.35)] ring-1 ring-vx-line/80 sm:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-center text-[26px] leading-tight font-semibold tracking-[-0.035em] text-vx-ink">{children}</h1>;
}

export function AuthSub({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 mb-7 text-center text-[15px] text-vx-body">{children}</p>;
}

export function AuthField({ label, id, className, ...props }: { label: string; id: string } & React.ComponentProps<"input">) {
  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={id} className={labelClass}>{label}</Label>
      <Input id={id} className={fieldClass} {...props} />
    </div>
  );
}

export function AuthSubmit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" variant="brand" size="pill" className="mt-3 w-full" disabled={loading}>
      {loading && <Spinner />}
      {children}
    </Button>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-5 rounded-xl bg-vx-red-bg px-4 py-3 text-[14px] text-vx-red ring-1 ring-vx-red/20">
      {children}
    </div>
  );
}

export function AuthSuccess({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="mt-5 mb-5 rounded-xl bg-vx-green-bg px-4 py-3 text-center text-[14px] leading-relaxed text-vx-green ring-1 ring-vx-green/20">
      {children}
    </div>
  );
}

export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 text-center text-[14px] text-vx-muted [&_a]:font-semibold [&_a]:text-vx-accent [&_a:hover]:underline">{children}</div>
  );
}
