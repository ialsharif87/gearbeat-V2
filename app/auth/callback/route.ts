import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerProfileForUser } from "@/lib/customer-profile";

function safeRedirectUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  url.hash = "";
  return url;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const errorDescription = request.nextUrl.searchParams.get("error_description");
  const supabase = await createClient();
  const loginUrl = safeRedirectUrl(request, "/login");

  if (errorDescription) {
    loginUrl.searchParams.set("confirmation_error", "1");
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set("confirmation_error", "1");
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.warn("Customer auth callback code exchange failed", {
      message: error.message,
    });
    loginUrl.searchParams.set("confirmation_error", "1");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const result = await ensureCustomerProfileForUser(user);

    if (!result.ok) {
      console.warn("Customer auth callback profile ensure skipped", {
        reason: result.reason,
      });
    }
  }

  loginUrl.searchParams.set("confirmed", "1");
  return NextResponse.redirect(loginUrl);
}
