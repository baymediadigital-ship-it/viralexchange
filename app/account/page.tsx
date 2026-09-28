import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usd, fmt } from "@/lib/format";

export const metadata: Metadata = { title: "My account" };

const LISTING_STATUS_LABEL: Record<string, string> = {
  draft: "Under review",
  available: "Live & available",
  pending_sale: "In negotiation",
  sold: "Sold",
  withdrawn: "Withdrawn",
};

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  new: "Submitted",
  reviewing: "In review",
  contacted: "Contacted",
  matched: "Matched",
  closed: "Closed",
};

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

  const listings = listingsRes.data || [];
  const applications = applicationsRes.data || [];

  return (
    <div className="account-main">
      <div className="account-h1">My account</div>
      <div className="account-sub">{user.email}</div>

      <div className="account-section">
        <div className="account-section-title">
          My listings <span className="count">{listings.length}</span>
        </div>
        {listings.length === 0 ? (
          <div className="account-empty">
            You haven&apos;t submitted a channel yet.
            <div style={{ marginTop: 14 }}>
              <a href="/#submit" className="account-cta">
                Sell a channel →
              </a>
            </div>
          </div>
        ) : (
          listings.map((l) => (
            <div className="account-card" key={l.id}>
              <div>
                <div className="account-card-name">{l.channel_name}</div>
                <div className="account-card-meta">
                  {l.niche || "—"} · {usd(l.asking_price_usd)}
                </div>
              </div>
              <span className={`account-badge badge-${l.status}`}>{LISTING_STATUS_LABEL[l.status] || l.status}</span>
            </div>
          ))
        )}
      </div>

      <div className="account-section">
        <div className="account-section-title">
          My acquisition applications <span className="count">{applications.length}</span>
        </div>
        {applications.length === 0 ? (
          <div className="account-empty">
            No applications yet.
            <div style={{ marginTop: 14 }}>
              <a href="/acquire" className="account-cta">
                Apply to acquire a channel →
              </a>
            </div>
          </div>
        ) : (
          applications.map((a) => (
            <div className="account-card" key={a.id}>
              <div>
                <div className="account-card-name">{a.niche || "Any niche"}</div>
                <div className="account-card-meta">Budget: {a.budget_range?.replace(/_/g, " ") || "—"}</div>
              </div>
              <span className={`account-badge badge-${a.status}`}>{APPLICATION_STATUS_LABEL[a.status] || a.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
