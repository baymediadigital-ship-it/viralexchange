"use client";

import { useState, useTransition } from "react";
import { Check, MessageSquare } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Field, SelectField, Spinner, fieldClass, labelClass } from "./form";
import { submitListingInquiry } from "@/lib/actions/inquiries";
import { fmt, nicheShort, usd } from "@/lib/format";
import { useAuthUser } from "@/lib/useAuthUser";
import { cn } from "@/lib/utils";

type Listing = { id: string; niche: string | null; subscribers: number | null; asking_price_usd: number | null };

const BUDGETS = ["Under $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000+", "Not sure yet"];

/** "Express interest" on a public listing: a short form that reaches us by email. */
export function InterestDialog({ listing, triggerClassName }: { listing: Listing; triggerClassName?: string }) {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", budget: "", message: "", website: "" });

  const label = `Verified ${nicheShort(listing.niche)} channel`;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setStartedAt(Date.now());
          setError("");
          // Prefill from the account when signed in; keep anything already typed.
          setForm((f) => ({
            ...f,
            name: f.name || (user?.user_metadata?.full_name as string | undefined) || "",
            email: f.email || user?.email || "",
          }));
        }
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant: "brandOutline", size: "pillSm" }), triggerClassName)}>
        <MessageSquare className="size-3.5 text-vx-accent" aria-hidden />
        Express interest
      </DialogTrigger>
      <DialogContent className="vx-page gap-0 rounded-xl border border-vx-line bg-vx-surface p-6 text-vx-ink ring-0 sm:max-w-md sm:p-7">
        {sent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-vx-green-bg text-vx-green">
              <Check className="size-5" aria-hidden />
            </span>
            <DialogTitle className="mt-5 text-[20px] font-normal tracking-[-0.02em] text-vx-ink">Thanks, we&apos;ll be in touch</DialogTitle>
            <DialogDescription className="mt-2 max-w-xs text-[14px] leading-relaxed text-vx-body">
              We&apos;ve sent a confirmation to {form.email}. Expect to hear from us within 24 hours.
            </DialogDescription>
            <Button variant="brandOutline" size="pillSm" className="mt-6" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                setError("");
                const res = await submitListingInquiry({ listingId: listing.id, ...form, startedAt });
                if (res.error) setError(res.error);
                else setSent(true);
              });
            }}
          >
            <DialogTitle className="text-[20px] font-normal tracking-[-0.02em] text-vx-ink">Interested in this channel?</DialogTitle>
            <DialogDescription className="mt-1.5 text-[14px] leading-relaxed text-vx-body">
              {label} · {fmt(listing.subscribers)} subscribers ·{" "}
              {listing.asking_price_usd ? `asking ${usd(Number(listing.asking_price_usd))}` : "open to offers"}. We&apos;ll share the name and
              full analytics once you&apos;re verified and have signed an NDA.
            </DialogDescription>

            <div className="mt-6 grid gap-4">
              <Field id={`i-name-${listing.id}`} label="Name" autoComplete="name" value={form.name} onChange={set("name")} required />
              <Field id={`i-email-${listing.id}`} label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
              <SelectField id={`i-budget-${listing.id}`} label="Budget (optional)" value={form.budget} onChange={set("budget")} className={cn(!form.budget && "[&_select]:text-vx-faint")}>
                <option value="">Select...</option>
                {BUDGETS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </SelectField>
              <div>
                <Label htmlFor={`i-msg-${listing.id}`} className={labelClass}>Anything we should know? (optional)</Label>
                <textarea
                  id={`i-msg-${listing.id}`}
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Timeline, experience, questions..."
                  className={cn(fieldClass, "h-auto w-full resize-y border py-2.5 outline-none")}
                />
              </div>
              {/* Honeypot: hidden from people, irresistible to bots. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={form.website}
                onChange={set("website")}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            </div>

            {error && <p role="alert" className="mt-4 text-[13px] text-vx-red">{error}</p>}

            <Button type="submit" variant="brand" size="pill" className="mt-6 w-full" disabled={pending}>
              {pending && <Spinner />}
              {pending ? "Sending..." : "Send"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
