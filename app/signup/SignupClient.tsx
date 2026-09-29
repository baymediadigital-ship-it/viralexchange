"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import { AuthError, AuthField, AuthFooter, AuthShell, AuthSub, AuthSubmit, AuthSuccess, AuthTitle } from "@/components/AuthShell";

export default function SignupClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp({ email, password, fullName });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNeedsConfirmation(true);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <AuthShell>
        <AuthTitle>Check your email</AuthTitle>
        <AuthSuccess>We sent a confirmation link to {email}. Click it to activate your account, then log in.</AuthSuccess>
        <AuthFooter>
          <a href="/login">Back to log in</a>
        </AuthFooter>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthTitle>Create your account</AuthTitle>
      <AuthSub>Track your listings and applications in one place</AuthSub>
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={handleSubmit}>
        <AuthField label="Name" id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
        <AuthField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <AuthField
          label="Password"
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          required
        />
        <AuthSubmit loading={loading}>{loading ? "Creating account..." : "Sign up"}</AuthSubmit>
      </form>
      <AuthFooter>
        Already have an account? <a href="/login">Log in</a>
      </AuthFooter>
    </AuthShell>
  );
}
