"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeNext";

export async function signUp(input: { email: string; password: string; fullName?: string; next?: string }) {
  const supabase = await createClient();
  // The confirmation email links back through /auth/callback, which then sends
  // the new user to wherever they were headed (e.g. the sell form).
  const origin = (await headers()).get("origin");
  const next = safeNext(input.next);
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName || null },
      ...(origin ? { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` } : {}),
    },
  });

  if (error) return { error: error.message };
  if (!data.session) return { needsEmailConfirmation: true };
  return { success: true };
}

/** Sends a reset link; always reports success so it can't be used to probe which emails have accounts. */
export async function requestPasswordReset(email: string) {
  if (!email?.includes("@")) return { error: "Please enter a valid email." };
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const next = encodeURIComponent("/account/settings?reset=1");
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    ...(origin ? { redirectTo: `${origin}/auth/callback?next=${next}` } : {}),
  });
  if (error) console.error("requestPasswordReset failed:", error.message);
  return { success: true };
}

export async function updatePassword(password: string) {
  if (!password || password.length < 8) return { error: "Use at least 8 characters." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateName(fullName: string) {
  const name = fullName.trim().slice(0, 80);
  if (!name) return { error: "Please enter your name." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };
  const [{ error: authError }, { error: profileError }] = await Promise.all([
    supabase.auth.updateUser({ data: { full_name: name } }),
    supabase.from("profiles").update({ full_name: name }).eq("id", user.id),
  ]);
  if (authError || profileError) {
    console.error("updateName failed:", authError || profileError);
    return { error: "Couldn't save your name. Please try again." };
  }
  return { success: true };
}
