import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    // The auth pages run a brighter green than the rest of the site; scoping
    // the vars here lets bg-brand-green etc. pick it up (the bridge is @theme inline).
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(140,50%,2%)] p-6 font-sans [--fg-hint:hsl(140,8%,35%)] [--green2:hsl(142,90%,62%)] [--green:hsl(142,90%,52%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-size-[32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black_20%,transparent_100%)]" />
      <Card className="relative z-1 w-full max-w-[400px] gap-0 rounded-[24px] border border-brand-border2 bg-white/[0.015] p-10 text-[16px] leading-[1.6] text-inherit ring-0 backdrop-blur-md">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2.5">
          <div className="size-8 overflow-hidden rounded-[9px] border border-brand-border2">
            <img src="/logo.jpg" alt="VX" className="size-full object-cover" />
          </div>
          <div className="font-mono text-[13px] font-semibold tracking-[0.07em] text-brand-green">VIRALEXCHANGE</div>
        </Link>
        {children}
      </Card>
    </div>
  );
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-1.5 text-center text-[24px] font-black tracking-[-0.02em] text-[#f0fdf4]">{children}</h1>;
}

export function AuthSub({ children }: { children: React.ReactNode }) {
  return <p className="mb-7 text-center text-[14px] text-brand-fg-hint">{children}</p>;
}

export function AuthField({ label, id, ...props }: { label: string; id: string } & React.ComponentProps<"input">) {
  return (
    <>
      <Label htmlFor={id} className="mb-[7px] block text-[11px] leading-[1.6] font-bold tracking-[0.08em] text-brand-fg-hint uppercase">
        {label}
      </Label>
      <Input
        id={id}
        className="mb-[18px] h-auto rounded-[10px] border-brand-border2 bg-white/4 px-4 py-3 text-[14px] leading-[1.6] text-[#f0fdf4] transition-all duration-200 placeholder:text-[#f0fdf4]/50 focus-visible:border-brand-green focus-visible:ring-3 focus-visible:ring-[rgba(34,197,94,0.08)] md:text-[14px]"
        {...props}
      />
    </>
  );
}

export function AuthSubmit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="h-auto w-full rounded-[12px] border-0 bg-brand-green p-3.5 text-[15px] leading-[1.6] font-extrabold text-[#050805] transition-all duration-200 hover:bg-brand-green2 disabled:opacity-50"
    >
      {children}
    </Button>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-[18px] rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-3.5 py-3 text-[13px] text-brand-red">
      {children}
    </div>
  );
}

export function AuthSuccess({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[18px] rounded-[10px] border border-brand-border2 bg-[rgba(34,197,94,0.08)] px-3.5 py-3 text-center text-[13px] text-brand-green">
      {children}
    </div>
  );
}

export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 text-center text-[13px] text-brand-fg-hint [&_a]:font-semibold [&_a]:text-brand-green [&_a:hover]:underline">
      {children}
    </div>
  );
}
