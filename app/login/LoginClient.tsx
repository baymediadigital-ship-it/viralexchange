"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { AuthError, AuthField, AuthFooter, AuthShell, AuthSub, AuthSubmit, AuthTitle } from "@/components/AuthShell";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(searchParams.get("next") || "/account");
    router.refresh();
  }

  return (
    <AuthShell>
      <AuthTitle>Welcome back</AuthTitle>
      <AuthSub>Log in to see your listings and applications</AuthSub>
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={handleSubmit}>
        <AuthField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <AuthField label="Password" id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <AuthSubmit loading={loading}>{loading ? "Logging in..." : "Log in"}</AuthSubmit>
      </form>
      <AuthFooter>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </AuthFooter>
    </AuthShell>
  );
}
