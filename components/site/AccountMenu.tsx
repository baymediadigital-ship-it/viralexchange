"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, LogOut, Settings, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { useSignOut } from "@/lib/useSignOut";
import { cn } from "@/lib/utils";

const itemClass = "cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[14px] text-vx-body focus:bg-vx-subtle focus:text-vx-ink [&_svg]:size-4 [&_svg]:text-vx-muted";

/**
 * Right side of the nav: a "Log in" link when signed out, or an avatar that
 * opens the account menu when signed in, so people can always tell which
 * state they're in.
 */
export function AccountMenu() {
  const user = useAuthUser();
  const signOut = useSignOut();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    createClient()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(data?.role === "admin"));
  }, [user]);

  // Reserve the avatar's space while checking, so the nav doesn't jump.
  if (user === undefined) return <span className="order-3 size-9 shrink-0" aria-hidden />;

  if (user === null) {
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    return (
      <Link
        href={`/login${next}`}
        className="order-1 hidden rounded-full px-3 py-1.5 text-[14px] text-vx-muted transition-[color,background-color] duration-150 hover:bg-vx-subtle hover:text-vx-ink sm:inline-flex"
      >
        Log in
      </Link>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined)?.trim() || "";
  const initial = (name || user.email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="order-3 flex size-9 shrink-0 items-center justify-center rounded-full border border-vx-accent/30 bg-vx-green-bg text-[14px] font-medium text-vx-green ring-offset-2 ring-offset-vx-surface transition-[scale,box-shadow] duration-150 outline-none hover:ring-2 hover:ring-vx-line-strong focus-visible:ring-2 focus-visible:ring-vx-faint active:scale-[0.94] data-popup-open:ring-2 data-popup-open:ring-vx-line-strong"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="vx-page w-60 rounded-xl border border-vx-line bg-vx-surface p-1.5 text-vx-ink shadow-[0_16px_40px_-16px_rgba(var(--vx-shadow-rgb),0.35)] ring-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 pt-2 pb-2.5">
            {name && <div className="truncate text-[14px] font-medium text-vx-ink">{name}</div>}
            <div className={cn("truncate text-[13px] font-normal text-vx-muted", !name && "text-vx-ink")}>{user.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-0 bg-vx-line" />
        <DropdownMenuItem className={itemClass} render={<Link href="/account" />}>
          <LayoutList aria-hidden /> My listings
        </DropdownMenuItem>
        <DropdownMenuItem className={itemClass} render={<Link href="/account/settings" />}>
          <Settings aria-hidden /> Settings
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem className={itemClass} render={<Link href="/admin" />}>
            <ShieldCheck aria-hidden /> Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="mx-0 bg-vx-line" />
        <DropdownMenuItem className={itemClass} onClick={() => signOut()}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
