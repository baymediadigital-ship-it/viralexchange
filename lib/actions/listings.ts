"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyNewListing } from "@/lib/telegram";

export type SubmitListingInput = {
  channelName: string;
  channelUrl: string;
  niche: string;
  subNiche?: string;
  subscribers?: number;
  monthlyViews?: number;
  monthlyRevenueUsd?: number;
  engagementRate?: number;
  monetization?: string;
  accountAgeMonths?: number;
  language?: string;
  askingPriceUsd?: number;
  sellerContactName?: string;
  sellerContactEmail?: string;
};

export async function submitListing(input: SubmitListingInput) {
  if (!input.channelName?.trim()) return { error: "Please fetch your channel first." };
  if (!input.channelUrl?.trim()) return { error: "Missing channel URL." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Selling requires an account (also enforced by RLS), so sellers can track
  // their listing and we know who submitted it.
  if (!user) return { error: "Please log in to list your channel." };

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      channel_name: input.channelName.trim(),
      channel_url: input.channelUrl.trim(),
      niche: input.niche?.trim() || "Uncategorized",
      sub_niche: input.subNiche?.trim() || null,
      subscribers: input.subscribers ?? null,
      monthly_views: input.monthlyViews ?? null,
      monthly_revenue_usd: input.monthlyRevenueUsd ?? null,
      engagement_rate: input.engagementRate ?? null,
      monetization: input.monetization?.trim() || null,
      account_age_months: input.accountAgeMonths ?? null,
      language: input.language?.trim() || "English",
      asking_price_usd: input.askingPriceUsd ?? null,
      seller_contact_name: input.sellerContactName?.trim() || null,
      seller_contact_email: input.sellerContactEmail?.trim() || user.email || null,
    })
    .select("id,channel_name,channel_url,niche,subscribers,monthly_views,monthly_revenue_usd,asking_price_usd,monetization,seller_contact_name,seller_contact_email")
    .single();

  if (error || !listing) {
    console.error("submitListing failed:", error);
    return { error: "Something went wrong submitting your channel. Please try again." };
  }
  await notifyNewListing(listing);
  return { success: true };
}
