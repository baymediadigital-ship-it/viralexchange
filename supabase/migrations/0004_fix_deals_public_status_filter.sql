-- 0001 created deals_public_status as a plain view with no row filter, relying
-- solely on a GRANT for access control. That's wrong: it exposed every deal's
-- channel_name/stage (even pre-close, which must stay private per this
-- business's own privacy model) to any authenticated caller, not just that
-- deal's own buyer/seller. Bake the ownership check into the view itself.
drop view deals_public_status;

create view deals_public_status as
select d.id, d.listing_id, d.buyer_id, d.channel_name, d.stage, d.close_date
from deals d
left join listings l on l.id = d.listing_id
where d.buyer_id = auth.uid() or l.seller_id = auth.uid();

grant select on deals_public_status to authenticated;
revoke select on deals_public_status from anon;
