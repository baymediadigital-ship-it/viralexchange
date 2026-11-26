"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner, fieldClass } from "@/components/site/form";
import { updateMyAskingPrice } from "@/lib/actions/listings";
import { cn } from "@/lib/utils";

/** Inline asking-price editor on the seller's own listing. */
export function EditPrice({ id, price }: { id: string; price: number | null }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(price ? String(price) : "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSaved(false);
        }}
        className="mt-1.5 text-[13px] text-vx-muted underline-offset-4 transition-colors duration-150 hover:text-vx-ink hover:underline"
      >
        {saved ? "Price updated · Edit again" : "Edit asking price"}
      </button>
    );
  }

  return (
    <form
      className="mt-2.5 flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setError("");
          const res = await updateMyAskingPrice(id, Math.round(Number(value)));
          if (res.error) setError(res.error);
          else {
            setSaved(true);
            setOpen(false);
          }
        });
      }}
    >
      <label htmlFor={`price-${id}`} className="sr-only">New asking price in USD</label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-vx-muted">$</span>
        <Input
          id={`price-${id}`}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(fieldClass, "h-9 w-36 pl-6")}
        />
      </div>
      <Button type="submit" variant="brand" size="pillSm" disabled={pending || !value}>
        {pending && <Spinner />}
        Save
      </Button>
      <Button type="button" variant="ghost" size="pillSm" disabled={pending} onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {error && <p role="alert" className="w-full text-[13px] text-vx-red">{error}</p>}
    </form>
  );
}
