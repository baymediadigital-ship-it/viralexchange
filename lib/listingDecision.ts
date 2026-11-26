import type { SupabaseClient } from "@supabase/supabase-js";
import { emailListingDecision } from "@/lib/email";

const LISTING_FOR_EMAIL = "channel_name,channel_url,niche,subscribers,asking_price_usd,seller_contact_name,seller_contact_email,status,seller:profiles(email)";

type Row = {
  channel_name: string;
  channel_url: string | null;
  niche: string | null;
  subscribers: number | null;
  asking_price_usd: number | null;
  seller_contact_name: string | null;
  seller_contact_email: string | null;
  status: string;
  seller: { email: string | null } | null;
};

/** Snapshot of a listing before a status change, so we can tell the seller about the decision after. */
export async function loadListingForDecision(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("listings").select(LISTING_FOR_EMAIL).eq("id", id).maybeSingle();
  return (data as unknown as Row | null) ?? null;
}

/** Emails the seller when a listing moves from review to approved or rejected. Never throws. */
export async function emailDecisionIfReviewed(before: Row | null, newStatus: string) {
  if (!before || before.status !== "draft") return;
  const decision = newStatus === "available" ? "approved" : newStatus === "rejected" ? "rejected" : null;
  if (!decision) return;
  // The account email is verified; fall back to the contact the seller typed.
  const to = before.seller?.email || before.seller_contact_email;
  await emailListingDecision(before, to ?? null, decision);
}
