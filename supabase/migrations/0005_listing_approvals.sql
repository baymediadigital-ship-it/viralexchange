-- Listing approvals.
--
-- 1. A "rejected" status, so a declined submission reads as "Not approved" to
--    the seller instead of looking like they withdrew it.
-- 2. Selling now requires an account: replaces 0002's anonymous-insert policy.
-- 3. Sellers can only edit their own listing while it's still under review
--    (draft). Once approved, changes go through an admin.
-- 4. The status guard also lets the server's service role through. The
--    Telegram approval webhook has no user session (auth.uid() is null), so
--    without this every Approve tap would be rejected by the trigger.

alter type listing_status add value if not exists 'rejected';

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

create or replace function prevent_seller_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if auth.role() = 'service_role' then
      return new;
    end if;
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change listing status.';
    end if;
  end if;
  return new;
end;
$$;
