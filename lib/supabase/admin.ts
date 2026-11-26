import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for trusted server code with no user session (the
 * Telegram webhook). Bypasses RLS, so never import this from client code and
 * never use it for anything a request's own user could do with their session.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
