import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (e) {
    // Never let a proxy-level failure (e.g. missing env vars in this runtime)
    // take down every route on the site. Worst case here is /account or
    // /admin briefly fail to redirect an unauthenticated visitor -- each of
    // those routes still checks auth itself server-side regardless.
    console.error("proxy failed, passing request through:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
