import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free client for public pages rendered on the server. It reads only
 * what the anonymous role may read (the public views), and because it doesn't
 * touch cookies, pages using it can be cached and revalidated.
 */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
