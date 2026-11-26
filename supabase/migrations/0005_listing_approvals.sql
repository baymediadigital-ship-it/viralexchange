-- Listing approvals, part 1 (safe to apply before the matching code ships).
--
-- 1. A "rejected" status, so a declined submission reads as "Not approved" to
--    the seller instead of looking like they withdrew it.
-- 2. The role and listing-status guards let trusted callers through:
--    - the service role (the Telegram approval webhook, which has no user
--      session, so auth.uid() is null), and
--    - direct database sessions with no API request at all (the Supabase
--      dashboard / SQL editor, which only the project owner can reach).
--    Requests through the public API always carry a role claim (anon or
--    authenticated), so they still need a real admin. Without this there was
--    no way to create the first admin, or to change a status by hand.

alter type listing_status add value if not exists 'rejected';

create or replace function is_trusted_backend()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), 'direct') in ('service_role', 'direct');
$$;

create or replace function prevent_self_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_trusted_backend() then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change roles.';
    end if;
  end if;
  return new;
end;
$$;

create or replace function prevent_seller_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status and not is_trusted_backend() then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change listing status.';
    end if;
  end if;
  return new;
end;
$$;
