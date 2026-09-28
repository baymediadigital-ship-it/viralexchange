"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../auth.css";
import { signIn } from "@/lib/actions/auth";

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
    <div className="auth-page">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          <div className="auth-logo-img">
            <img src="/logo.jpg" alt="VX" />
          </div>
          <div className="auth-logo-name">VIRALEXCHANGE</div>
        </a>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Log in to see your listings and applications</div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <div className="auth-footer">
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
}
