"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

export async function signIn(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
