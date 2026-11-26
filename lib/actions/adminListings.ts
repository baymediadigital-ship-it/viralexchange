"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Admin-only listing moderation. Runs with the admin's own session, so RLS
// (listings_all_admin) and the status trigger both see a real admin; the
// explicit role check here just gives a clean error instead of a DB failure.

export type ListingStatus = "draft" | "available" | "pending_sale" | "sold" | "withdrawn" | "rejected";

export type ListingEdits = {
  niche?: string;
  sub_niche?: string | null;
  asking_price_usd?: number | null;
  monetization?: string | null;
  language?: string | null;
  admin_notes?: string | null;
};

async function adminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? supabase : null;
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function setListingStatus(id: string, status: ListingStatus) {
  const supabase = await adminSession();
  if (!supabase) return { error: "Admins only." };
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) {
    console.error("setListingStatus failed:", error);
    return { error: "Couldn't update the listing." };
  }
  refresh();
  return { success: true };
}

export async function updateListing(id: string, edits: ListingEdits, approve = false) {
  const supabase = await adminSession();
  if (!supabase) return { error: "Admins only." };
  const clean: ListingEdits & { status?: ListingStatus } = {
    ...edits,
    niche: edits.niche?.trim() || "Uncategorized",
    sub_niche: edits.sub_niche?.trim() || null,
    monetization: edits.monetization?.trim() || null,
    language: edits.language?.trim() || null,
    admin_notes: edits.admin_notes?.trim() || null,
  };
  if (approve) clean.status = "available";
  const { error } = await supabase.from("listings").update(clean).eq("id", id);
  if (error) {
    console.error("updateListing failed:", error);
    return { error: "Couldn't save the changes." };
  }
  refresh();
  return { success: true };
}
