"use server";

import { createClient } from "@/lib/supabase/server";

const BUDGET_LABEL_TO_CODE: Record<string, string> = {
  "$3,000 — $7,000": "3000_7000",
  "$7,000 — $15,000": "7000_15000",
  "$15,000 — $30,000": "15000_30000",
  "$30,000+": "30000_plus",
};

export type SubmitAcquisitionApplicationInput = {
  name: string;
  email: string;
  contact?: string;
  budgetLabel: string;
  niche: string;
  experience: string;
  goals?: string;
};

export async function submitAcquisitionApplication(input: SubmitAcquisitionApplicationInput) {
  if (!input.name?.trim()) return { error: "Please enter your first name." };
  if (!input.email?.includes("@")) return { error: "Please enter a valid email." };
  const budgetRange = BUDGET_LABEL_TO_CODE[input.budgetLabel];
  if (!budgetRange) return { error: "Please select your budget range." };
  if (!input.niche?.trim()) return { error: "Please select a preferred niche." };
  if (!input.experience?.trim()) return { error: "Please select your experience level." };

  const supabase = await createClient();
  const { error } = await supabase.from("acquisition_applications").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    contact: input.contact?.trim() || null,
    budget_range: budgetRange,
    niche: input.niche.trim(),
    experience: input.experience.trim(),
    goals: input.goals?.trim() || null,
  });

  if (error) {
    console.error("submitAcquisitionApplication failed:", error);
    return { error: "Something went wrong submitting your application. Please try again." };
  }
  return { success: true };
}
