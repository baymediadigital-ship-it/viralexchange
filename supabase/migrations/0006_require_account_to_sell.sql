-- Listing approvals, part 2. Apply right AFTER the code that requires an
-- account to sell is live (the old code still lets logged-out visitors submit).
--
-- 1. Selling requires an account: replaces 0002's anonymous-insert policy.
-- 2. Sellers can only edit their own listing while it's still under review
--    (draft). Once approved, changes go through an admin.

drop policy if exists "listings_insert_own_or_anon" on listings;
drop policy if exists "listings_insert_own" on listings;
create policy "listings_insert_own" on listings
  for insert to authenticated
  with check (seller_id = auth.uid());

drop policy if exists "listings_update_own" on listings;
create policy "listings_update_own" on listings
  for update to authenticated
  using (seller_id = auth.uid() and status = 'draft')
  with check (seller_id = auth.uid());
