"use server";

import { createClient } from "@/lib/supabase/server";
import { emailListingInquiry, isEmail } from "@/lib/email";
import { looksLikeBot } from "@/lib/spam";

export type ListingInquiryInput = {
  listingId: string;
  name: string;
  email: string;
  budget?: string;
  message?: string;
  website?: string; // honeypot
  startedAt?: number;
};

/** "Express interest" on a public listing: saved for admins, emailed to both sides. */
export async function submitListingInquiry(input: ListingInquiryInput) {
  if (looksLikeBot(input)) return { success: true };
  const name = input.name?.trim().slice(0, 80);
  const email = input.email?.trim().slice(0, 200);
  if (!name) return { error: "Please enter your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only approved listings can be asked about; the public view has no private details.
  const { data: listing } = await supabase
    .from("listings_public")
    .select("id,niche,subscribers,monthly_views,asking_price_usd")
    .eq("id", input.listingId)
    .maybeSingle();
  if (!listing) return { error: "This listing is no longer available." };

  const budget = input.budget?.trim().slice(0, 40) || null;
  const message = input.message?.trim().slice(0, 2000) || null;
  const { error } = await supabase.from("listing_inquiries").insert({
    listing_id: listing.id,
    user_id: user?.id ?? null,
    name,
    email,
    budget,
    message,
  });
  if (error) {
    console.error("submitListingInquiry failed:", error);
    return { error: "Something went wrong. Please try again, or email us." };
  }

  await emailListingInquiry({ listing, name, email, budget, message });
  return { success: true };
}
