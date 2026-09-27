-- The public /deals marketing page shows asking price + subscriber count for
-- every deal in progress (intentional social proof), but only reveals the
-- channel name once a deal closes. The base `deals` table is admin-only, so
-- expose a masked view instead of relaxing RLS on the table itself.
create view deals_public_pipeline as
select
  id,
  case when stage = 'closed' then channel_name else null end as channel_name,
  niche,
  subscribers_snapshot,
  asking_price_usd,
  stage,
  case when stage = 'closed' then closed_price_usd else null end as closed_price_usd,
  close_date,
  created_at
from deals
order by created_at desc;

grant select on deals_public_pipeline to anon, authenticated;

-- This grant was missed in 0001 -- deals_public_status (buyer/seller's own deal
-- status) needs it for logged-in users to actually read the view.
grant select on deals_public_status to authenticated;
