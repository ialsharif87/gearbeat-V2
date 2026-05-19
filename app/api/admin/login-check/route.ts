import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SUPPORTED_ADMIN_ROLES = new Set([
  "admin",
  "super_admin",
  "operations",
  "support",
  "content",
  "sales",
  "finance",
]);

function safeErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const details: Record<string, unknown> = {};

  for (const key of ["name", "message", "code", "status"]) {
    if (
      typeof record[key] === "string" ||
      typeof record[key] === "number" ||
      typeof record[key] === "boolean"
    ) {
      details[key] = record[key];
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

function warnAdminLoginCheck(reason: string, details?: unknown) {
  console.warn("[admin-login-check]", reason, safeErrorDetails(details));
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      warnAdminLoginCheck("Session user lookup failed", userError);
      return NextResponse.json(
        {
          ok: false,
          code: "session_lookup_failed",
          message: "We could not verify your session. Please try again.",
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          code: "not_authenticated",
          message: "Please sign in again to access the admin console.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("id, admin_role, status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (adminError) {
      warnAdminLoginCheck("admin_users lookup failed", adminError);
      return NextResponse.json(
        {
          ok: false,
          code: "admin_lookup_failed",
          message: "We could not verify administrative access. Please try again.",
        },
        { status: 500 }
      );
    }

    if (!adminUser || adminUser.status !== "active") {
      warnAdminLoginCheck("Authenticated account is not an active admin");
      return NextResponse.json(
        {
          ok: false,
          code: "not_admin",
          message: "This account is not authorized for the admin console.",
        },
        { status: 403 }
      );
    }

    if (!SUPPORTED_ADMIN_ROLES.has(adminUser.admin_role)) {
      warnAdminLoginCheck("Authenticated admin has unsupported role", {
        code: "unsupported_admin_role",
      });
      return NextResponse.json(
        {
          ok: false,
          code: "unsupported_admin_role",
          message: "This admin role is not authorized for the admin console.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      role: adminUser.admin_role,
    });
  } catch (error) {
    warnAdminLoginCheck("Unexpected admin login check failure", error);
    return NextResponse.json(
      {
        ok: false,
        code: "unexpected_admin_check_failure",
        message: "We could not verify administrative access. Please try again.",
      },
      { status: 500 }
    );
  }
}
