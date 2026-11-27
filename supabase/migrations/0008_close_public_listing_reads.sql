-- Pre-launch, part 2. Apply right AFTER the code that reads listings_public
-- is live (the old code still reads the listings table directly).
--
-- The public could read every column of approved listings through the API,
-- including channel_name and channel_url, which the site deliberately keeps
-- private until a buyer is verified. The public now reads listings_public
-- instead; sellers still see their own rows and admins see everything.

drop policy if exists "listings_select_available" on listings;
