import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const keyId = cleanText(body?.keyId || body?.key_id);

    if (!keyId) {
      return NextResponse.json(
        { error: "API key id is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("vendor_api_keys")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", keyId)
      .eq("auth_user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      message: "API key revoked.",
    });
  } catch (error) {
    console.error("Vendor API key revoke error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not revoke API key.",
      },
      { status: 500 }
    );
  }
}
