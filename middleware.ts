import { NextResponse, type NextRequest } from "next/server";
import { getSubdomainRootRewritePath } from "./lib/subdomain-routing";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const rewritePath = getSubdomainRootRewritePath(
    request.nextUrl.hostname,
    request.nextUrl.pathname
  );

  if (rewritePath) {
    // Keep Supabase auth/session cookie refresh behavior even for root rewrites.
    const sessionResponse = await updateSession(request);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;

    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    for (const cookie of sessionResponse.cookies.getAll()) {
      rewriteResponse.cookies.set(cookie);
    }

    return rewriteResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.\\.(?:svg|png|jpg|jpeg|gif|webp)$).)"
  ]
};
