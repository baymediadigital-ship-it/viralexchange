"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { AuthError, AuthField, AuthFooter, AuthShell, AuthSub, AuthSubmit, AuthSuccess, AuthTitle } from "@/components/AuthShell";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.error) return setError(result.error);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell>
        <AuthTitle>Check your email</AuthTitle>
        <AuthSuccess>If {email} has an account, we&apos;ve sent a link to reset your password. It expires in an hour.</AuthSuccess>
        <AuthFooter>
          <a href="/login">Back to log in</a>
        </AuthFooter>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthTitle>Reset your password</AuthTitle>
      <AuthSub>Enter your email and we&apos;ll send you a reset link</AuthSub>
      {error && <AuthError>{error}</AuthError>}
      <form onSubmit={handleSubmit}>
        <AuthField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <AuthSubmit loading={loading}>{loading ? "Sending..." : "Send reset link"}</AuthSubmit>
      </form>
      <AuthFooter>
        Remembered it? <a href="/login">Log in</a>
      </AuthFooter>
    </AuthShell>
  );
}
