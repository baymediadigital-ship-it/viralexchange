import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./SettingsView";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/settings");

  const { reset } = await searchParams;
  return (
    <SettingsView
      email={user.email ?? ""}
      name={(user.user_metadata?.full_name as string | undefined) ?? ""}
      resetting={reset === "1"}
    />
  );
}
