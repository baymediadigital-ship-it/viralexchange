-- Listing approvals, part 2. Apply right AFTER the code that requires an
-- account to sell is live (the old code still lets logged-out visitors submit).
--
-- 1. Selling requires an account: replaces 0002's anonymous-insert policy.
-- 2. Sellers can edit their own listing freely while it's under review. Once
--    it's approved they can still change the asking price (live or in
--    negotiation), but nothing else; sold, rejected and unlisted listings are
--    locked. Admins, the dashboard and the service role are unaffected.

drop policy if exists "listings_insert_own_or_anon" on listings;
drop policy if exists "listings_insert_own" on listings;
create policy "listings_insert_own" on listings
  for insert to authenticated
  with check (seller_id = auth.uid());

drop policy if exists "listings_update_own" on listings;
create policy "listings_update_own" on listings
  for update to authenticated
  using (seller_id = auth.uid() and status in ('draft', 'available', 'pending_sale'))
  with check (seller_id = auth.uid());

create or replace function limit_seller_edits_after_review()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if is_trusted_backend() or old.status = 'draft' then
    return new;
  end if;
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    return new;
  end if;
  if (to_jsonb(new) - 'asking_price_usd' - 'updated_at') is distinct from (to_jsonb(old) - 'asking_price_usd' - 'updated_at') then
    raise exception 'Once a listing is approved, only the asking price can be changed.';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_limit_seller_edits on listings;
create trigger listings_limit_seller_edits
  before update on listings
  for each row execute procedure limit_seller_edits_after_review();
