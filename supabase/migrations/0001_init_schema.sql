-- ViralExchange initial schema
-- Replaces the Google Sheets + Apps Script "database" with real Postgres tables.

create extension if not exists "moddatetime" schema extensions;

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('buyer', 'seller', 'admin');

create type listing_status as enum (
  'draft',        -- submitted, awaiting staff review (default for all new submissions)
  'available',    -- "🟢 Available"
  'pending_sale', -- under offer / negotiating
  'sold',
  'withdrawn'     -- seller pulled it, or staff rejected it
);

create type deal_stage as enum (
  'inquiry',
  'negotiating',
  'due_diligence',
  'closed',
  'lost'          -- terminal-negative state; did not exist in the legacy sheet,
                  -- added so the admin panel has somewhere to move a dead deal
                  -- instead of leaving it stuck in "negotiating" forever
);

create type application_status as enum (
  'new', 'reviewing', 'contacted', 'matched', 'closed'
);

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'buyer',
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Block non-admins from changing their own role.
create function prevent_self_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change roles.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_self_role_change
  before update on profiles
  for each row execute procedure prevent_self_role_change();

-- ============================================================
-- LISTINGS (replaces the "Buyer Listings" sheet -- renamed since that
-- sheet actually held seller listings)
-- ============================================================

create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id),          -- nullable: migrated/anonymous rows
  seller_contact_name text,
  seller_contact_email text,
  channel_name text not null,
  niche text not null,
  sub_niche text,
  subscribers integer,
  monthly_views bigint,                             -- split from the legacy overloaded column
  monthly_revenue_usd numeric(12,2),                 -- split from the legacy overloaded column
  raw_monthly_metric_legacy text,                    -- original string, audit-only
  engagement_rate numeric(7,2), -- legacy sheet's engagement metric is miscalculated for many rows
                                 -- (seen values over 1900%) -- widened rather than rejecting real data
  monetization text,
  account_age_months integer,
  language text,
  asking_price_usd numeric(12,2),
  status listing_status not null default 'draft',
  raw_status_legacy text,                            -- original emoji/text, audit-only
  channel_url text not null,
  youtube_channel_id text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_idx on listings (status);
create index listings_seller_id_idx on listings (seller_id);

create trigger listings_set_updated_at
  before update on listings
  for each row execute procedure extensions.moddatetime(updated_at);

-- Only admins may change `status`; sellers can edit their own row otherwise.
create function prevent_seller_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change listing status.';
    end if;
  end if;
  return new;
end;
$$;

create trigger listings_prevent_seller_status_change
  before update on listings
  for each row execute procedure prevent_seller_status_change();

-- ============================================================
-- DEALS (replaces the "Deal Tracker" sheet -- admin-only, was 100%
-- hand-edited before)
-- ============================================================

create table deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),          -- nullable: sheet was never linked by ID
  buyer_id uuid references profiles(id),
  channel_name text not null,
  niche text,
  subscribers_snapshot integer,
  asking_price_usd numeric(12,2),
  offer_price_usd numeric(12,2),
  stage deal_stage not null default 'inquiry',
  closed_price_usd numeric(12,2),
  close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_stage_idx on deals (stage);
create index deals_listing_id_idx on deals (listing_id);

create trigger deals_set_updated_at
  before update on deals
  for each row execute procedure extensions.moddatetime(updated_at);

-- Narrow view exposing only what a buyer/seller should see about their own
-- deal -- no prices or internal notes.
create view deals_public_status as
  select id, listing_id, buyer_id, channel_name, stage, close_date
  from deals;

-- ============================================================
-- VALUATION LEADS (was write-only via Apps Script; the old flow fired two
-- near-duplicate POSTs per completed valuation -- collapses to one row
-- since Server Actions give us a single synchronous submit)
-- ============================================================

create table valuation_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  channel_name text,
  channel_url text,
  subscribers integer,
  valuation_low_usd numeric(12,2),
  valuation_high_usd numeric(12,2),
  tier text,
  niche text,
  confidence text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ACQUISITION APPLICATIONS (buyer leads for the /acquire program -- was
-- write-only via Apps Script, no pipeline state at all)
-- ============================================================

create table acquisition_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references profiles(id),
  name text not null,
  email text not null,
  contact text,
  budget_range text check (budget_range in (
    '3000_7000', '7000_15000', '15000_30000', '30000_plus'
  )),
  niche text,
  experience text,
  goals text,
  status application_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index acquisition_applications_applicant_id_idx on acquisition_applications (applicant_id);

create trigger acquisition_applications_set_updated_at
  before update on acquisition_applications
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- RLS
-- ============================================================

alter table profiles enable row level security;
alter table listings enable row level security;
alter table deals enable row level security;
alter table valuation_leads enable row level security;
alter table acquisition_applications enable row level security;

create function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_select_admin" on profiles for select using (is_admin());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

-- listings
create policy "listings_select_available" on listings for select using (status = 'available');
create policy "listings_select_own" on listings for select using (seller_id = auth.uid());
create policy "listings_select_admin" on listings for select using (is_admin());
create policy "listings_insert_own" on listings for insert with check (seller_id = auth.uid());
create policy "listings_update_own" on listings for update using (seller_id = auth.uid());
create policy "listings_all_admin" on listings for all using (is_admin());

-- deals: admin-only on the base table
create policy "deals_all_admin" on deals for all using (is_admin());

-- valuation_leads: public insert, admin-only read
create policy "valuation_leads_insert_public" on valuation_leads for insert with check (true);
create policy "valuation_leads_select_admin" on valuation_leads for select using (is_admin());

-- acquisition_applications: public insert, self + admin read
create policy "acquisition_applications_insert_public" on acquisition_applications for insert with check (true);
create policy "acquisition_applications_select_own" on acquisition_applications for select using (applicant_id = auth.uid());
create policy "acquisition_applications_select_admin" on acquisition_applications for select using (is_admin());
create policy "acquisition_applications_all_admin" on acquisition_applications for all using (is_admin());
