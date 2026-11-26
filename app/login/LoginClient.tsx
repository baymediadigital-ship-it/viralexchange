"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safeNext";
import { AuthError, AuthField, AuthFooter, AuthShell, AuthSub, AuthSubmit, AuthTitle } from "@/components/AuthShell";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = safeNext(searchParams.get("next"));
  const signupHref = next === "/account" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  // Signs in from the browser so the nav's account menu hears about it right
  // away, then makes a single navigation. (Pushing and refreshing together
  // raced each other and sometimes needed a second click.) The button stays in
  // its loading state until the next page takes over.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const { error: authError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (authError) {
      setLoading(false);
      setError(authError.message === "Invalid login credentials" ? "That email and password don't match." : authError.message);
      return;
    }
    router.replace(next);
  }

  return (
    <AuthShell>
      <AuthTitle>Welcome back</AuthTitle>
      <AuthSub>Log in to see your listings and applications</AuthSub>
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={handleSubmit}>
        <AuthField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <AuthField label="Password" id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <div className="-mt-2 mb-2 text-right">
          <a href="/forgot-password" className="text-[13px] text-vx-muted underline-offset-4 hover:text-vx-ink hover:underline">Forgot password?</a>
        </div>
        <AuthSubmit loading={loading}>{loading ? "Logging in..." : "Log in"}</AuthSubmit>
      </form>
      <AuthFooter>
        Don&apos;t have an account? <a href={signupHref}>Sign up</a>
      </AuthFooter>
    </AuthShell>
  );
}
