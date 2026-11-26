"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Spinner } from "@/components/site/form";
import { CONTACT_EMAIL } from "@/components/site/links";
import { signOut, updateName, updatePassword } from "@/lib/actions/auth";

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-vx-line bg-vx-surface p-6 sm:p-7">
      <h2 className="text-[17px] tracking-[-0.02em] text-vx-ink">{title}</h2>
      {sub && <p className="mt-1 text-[14px] text-vx-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Status({ error, ok }: { error: string; ok: string }) {
  if (error) return <p role="alert" className="text-[13px] text-vx-red">{error}</p>;
  if (ok) return <p role="status" className="text-[13px] text-vx-green">{ok}</p>;
  return null;
}

export function SettingsView({ email, name: initialName, resetting }: { email: string; name: string; resetting: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameMsg, setNameMsg] = useState({ error: "", ok: "" });
  const [savingName, startName] = useTransition();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState({ error: "", ok: "" });
  const [savingPw, startPw] = useTransition();

  return (
    <main className="mx-auto max-w-2xl px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-[13px] text-vx-muted transition-colors duration-150 hover:text-vx-ink">
        <ArrowLeft className="size-3.5" aria-hidden /> My account
      </Link>
      <h1 className="mt-4 text-[34px] leading-tight font-normal tracking-[-0.035em] text-vx-ink sm:text-[42px]">Settings</h1>

      {resetting && (
        <p role="status" className="mt-6 rounded-lg bg-vx-green-bg px-4 py-3 text-[14px] text-vx-green">
          You&apos;re signed in from your reset link. Choose a new password below.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4">
        <Card title="Profile" sub="Your name appears on your listings and in emails from us.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startName(async () => {
                setNameMsg({ error: "", ok: "" });
                const res = await updateName(name);
                if (res.error) setNameMsg({ error: res.error, ok: "" });
                else {
                  setNameMsg({ error: "", ok: "Saved." });
                  router.refresh();
                }
              });
            }}
            className="flex flex-col gap-4"
          >
            <Field id="name" label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-vx-body">Email</div>
              <div className="text-[14px] text-vx-ink">{email}</div>
              <p className="mt-1 text-[13px] text-vx-muted">
                To change it, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-vx-ink underline-offset-4 hover:underline">{CONTACT_EMAIL}</a> from this address.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="brand" size="pillSm" disabled={savingName || name.trim() === initialName.trim()}>
                {savingName && <Spinner />} Save
              </Button>
              <Status {...nameMsg} />
            </div>
          </form>
        </Card>

        <Card title={resetting ? "Set a new password" : "Password"} sub="At least 8 characters.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pw !== pw2) return setPwMsg({ error: "The two passwords don't match.", ok: "" });
              startPw(async () => {
                setPwMsg({ error: "", ok: "" });
                const res = await updatePassword(pw);
                if (res.error) setPwMsg({ error: res.error, ok: "" });
                else {
                  setPw("");
                  setPw2("");
                  setPwMsg({ error: "", ok: "Password updated." });
                }
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="pw" label="New password" type="password" autoComplete="new-password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} />
              <Field id="pw2" label="Confirm new password" type="password" autoComplete="new-password" minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="brand" size="pillSm" disabled={savingPw || pw.length < 8 || !pw2}>
                {savingPw && <Spinner />} Update password
              </Button>
              <Status {...pwMsg} />
            </div>
          </form>
        </Card>

        <Card title="Sign out" sub="Sign out of ViralExchange on this device.">
          <Button variant="brandOutline" size="pillSm" onClick={() => signOut()}>
            Sign out
          </Button>
        </Card>
      </div>
    </main>
  );
}
