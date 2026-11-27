-- Pre-launch, part 1. Safe to apply BEFORE the matching code ships (purely
-- additive: nothing the live site uses is removed here).
--
-- 1. listings_public: the only public window onto listings. Non-identifying
--    columns of approved listings, no channel name/link, seller contact or
--    admin notes. Like deals_public_pipeline, it's owned by postgres so it
--    reads past RLS, and exposes exactly these columns.
-- 2. listings.seller_notes: the sell form's "Anything else to know?" box,
--    which was previously thrown away.
-- 3. listing_inquiries: "Express interest" requests from buyers. Anyone can
--    submit one; only admins can read them.

create or replace view listings_public as
select
  id,
  niche,
  sub_niche,
  subscribers,
  monthly_views,
  asking_price_usd,
  monetization,
  language,
  account_age_months,
  created_at
from listings
where status = 'available';

grant select on listings_public to anon, authenticated;

alter table listings add column if not exists seller_notes text;

create table if not exists listing_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  budget text,
  message text,
  created_at timestamptz not null default now()
);

alter table listing_inquiries enable row level security;

drop policy if exists "listing_inquiries_insert_any" on listing_inquiries;
create policy "listing_inquiries_insert_any" on listing_inquiries
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "listing_inquiries_admin" on listing_inquiries;
create policy "listing_inquiries_admin" on listing_inquiries
  for all using (is_admin());
