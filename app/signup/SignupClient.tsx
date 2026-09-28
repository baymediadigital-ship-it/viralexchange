"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../auth.css";
import { signUp } from "@/lib/actions/auth";

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
      <div className="auth-page">
        <div className="auth-card">
          <a href="/" className="auth-logo">
            <div className="auth-logo-img">
              <img src="/logo.jpg" alt="VX" />
            </div>
            <div className="auth-logo-name">VIRALEXCHANGE</div>
          </a>
          <div className="auth-title">Check your email</div>
          <div className="auth-success">
            We sent a confirmation link to {email}. Click it to activate your account, then log in.
          </div>
          <div className="auth-footer">
            <a href="/login">Back to log in</a>
          </div>
        </div>
      </div>
    );
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
        <div className="auth-title">Create your account</div>
        <div className="auth-sub">Track your listings and applications in one place</div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
