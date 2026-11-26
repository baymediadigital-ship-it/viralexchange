"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs out in the browser, so every component watching the session (the
 * nav's account menu) updates immediately, then leaves any members-only page
 * and re-renders server components without the old session. Signing out only
 * on the server left the menu showing the user as logged in until a reload.
 * "local" ends this device's session only, matching the Settings copy.
 */
export function useSignOut() {
  const router = useRouter();
  return async () => {
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/");
    router.refresh();
  };
}
