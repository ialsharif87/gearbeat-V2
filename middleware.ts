import { NextResponse, type NextRequest } from "next/server";
import { getSubdomainRootRedirectPath } from "./lib/subdomain-routing";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const redirectPath = getSubdomainRootRedirectPath({
    forwardedHostHeader: request.headers.get("x-forwarded-host"),
    hostHeader: request.headers.get("host"),
    nextUrlHostname: request.nextUrl.hostname,
    pathname: request.nextUrl.pathname,
  });

  if (redirectPath) {
    // Keep Supabase auth/session cookie refresh behavior even for root redirects.
    const sessionResponse = await updateSession(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;

    const redirectResponse = NextResponse.redirect(redirectUrl);
    for (const cookie of sessionResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    return redirectResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
