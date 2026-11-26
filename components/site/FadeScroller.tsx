"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Horizontal scroller that fades whichever edge still has more content, and hides its scrollbar. */
export function FadeScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft > 2, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  const mask = `linear-gradient(to right, ${edges.start ? "transparent, black 40px" : "black, black"}, ${edges.end ? "black calc(100% - 40px), transparent" : "black, black"})`;
  return (
    <div
      ref={ref}
      className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  );
}
