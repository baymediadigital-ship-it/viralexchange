import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Shown in place of a form that needs an account. Sends people back to `next` afterwards. */
export function SignInGate({ next, title, sub }: { next: string; title: string; sub: string }) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border border-vx-line bg-vx-canvas text-vx-body">
        <Lock className="size-4" aria-hidden />
      </span>
      <h3 className="mt-5 text-[20px] font-normal tracking-[-0.02em] text-vx-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-vx-body">{sub}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link href={`/signup${q}`} className={buttonVariants({ variant: "brand", size: "pill" })}>
          Create a free account
        </Link>
        <Link href={`/login${q}`} className={buttonVariants({ variant: "brandOutline", size: "pill" })}>
          Log in
        </Link>
      </div>
    </div>
  );
}
