"use server";

import { createClient } from "@/lib/supabase/server";

export type SubmitValuationLeadInput = {
  email: string;
  channelName: string;
  channelUrl: string;
  subscribers?: number;
  valuationLowUsd: number;
  valuationHighUsd: number;
  tier: string;
  niche: string;
  confidence: string;
};

export async function submitValuationLead(input: SubmitValuationLeadInput) {
  if (!input.email?.includes("@")) return { error: "Please enter a valid email." };

  const supabase = await createClient();
  const { error } = await supabase.from("valuation_leads").insert({
    email: input.email.trim(),
    channel_name: input.channelName,
    channel_url: input.channelUrl,
    subscribers: input.subscribers ?? null,
    valuation_low_usd: input.valuationLowUsd,
    valuation_high_usd: input.valuationHighUsd,
    tier: input.tier,
    niche: input.niche,
    confidence: input.confidence,
  });

  if (error) {
    console.error("submitValuationLead failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
  return { success: true };
}
