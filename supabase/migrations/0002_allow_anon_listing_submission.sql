-- Phase 1 wires the public "sell my channel" form before accounts exist (Phase 2).
-- The original listings_insert_own policy required seller_id = auth.uid(), which
-- is never true for an anonymous submitter (auth.uid() is null, and null = null
-- is null, not true, under RLS). Allow anonymous inserts with seller_id left null;
-- once Phase 2 ships, logged-in sellers still get seller_id set via auth.uid().
drop policy "listings_insert_own" on listings;

create policy "listings_insert_own_or_anon" on listings
  for insert
  with check (seller_id = auth.uid() or seller_id is null);
