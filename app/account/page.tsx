import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountView, type AccountApplication, type AccountListing } from "./AccountView";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [listingsRes, applicationsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id,channel_name,niche,asking_price_usd,status,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("acquisition_applications")
      .select("id,niche,budget_range,status,created_at")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AccountView
      email={user.email ?? ""}
      listings={(listingsRes.data || []) as AccountListing[]}
      applications={(applicationsRes.data || []) as AccountApplication[]}
    />
  );
}
