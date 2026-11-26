import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageTransition } from "@/components/site/PageTransition";
import { AdminListings, type AdminListing } from "./AdminListings";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,status,channel_name,channel_url,niche,sub_niche,subscribers,monthly_views,monthly_revenue_usd,engagement_rate,monetization,account_age_months,language,asking_price_usd,seller_contact_name,seller_contact_email,admin_notes,created_at,updated_at,seller:profiles(email,full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) console.error("admin listings load failed:", error);

  return (
    <PageTransition>
      <AdminListings listings={(data || []) as unknown as AdminListing[]} loadFailed={Boolean(error)} />
    </PageTransition>
  );
}
