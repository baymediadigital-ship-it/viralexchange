import { createPublicClient } from "@/lib/supabase/public";

// Server-side reads for public pages, so search engines get real deals and
// listings in the HTML. Each returns null on failure so pages can degrade.

export type PublicDeal = {
  id: string;
  channel_name: string | null; // only present once a deal is closed (see deals_public_pipeline)
  niche: string | null;
  subscribers_snapshot: number | null;
  asking_price_usd: number | null;
  closed_price_usd: number | null;
  close_date: string | null;
  stage: string;
};

export type PublicListingRow = {
  id: string;
  niche: string | null;
  subscribers: number | null;
  monthly_views: number | null;
  asking_price_usd: number | null;
};

const LISTING_FIELDS = "id,niche,subscribers,monthly_views,asking_price_usd";

/** Every non-lost deal, newest first. */
export async function getPipeline(): Promise<PublicDeal[] | null> {
  const { data, error } = await createPublicClient()
    .from("deals_public_pipeline")
    .select("id,channel_name,niche,subscribers_snapshot,asking_price_usd,closed_price_usd,close_date,stage")
    .neq("stage", "lost")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getPipeline failed:", error);
    return null;
  }
  return (data || []) as PublicDeal[];
}

/** Approved listings (no identifying details), newest first, plus the total count. */
export async function getPublicListings(limit?: number): Promise<{ rows: PublicListingRow[]; count: number } | null> {
  let q = createPublicClient().from("listings_public").select(LISTING_FIELDS, { count: "exact" }).order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error, count } = await q;
  if (error) {
    console.error("getPublicListings failed:", error);
    return null;
  }
  return { rows: (data || []) as PublicListingRow[], count: count ?? (data || []).length };
}
