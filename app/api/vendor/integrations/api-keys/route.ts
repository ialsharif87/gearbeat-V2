import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateVendorApiKey,
  getApiKeyPrefix,
  hashVendorApiKey,
} from "@/lib/vendor-api-auth";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

export async function GET() {
  try {
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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || !["vendor", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Vendor access required." },
        { status: 403 }
      );
    }

    const { data: keys, error } = await supabaseAdmin
      .from("vendor_api_keys")
      .select(`
        id,
        key_name,
        key_prefix,
        permissions,
        status,
        last_used_at,
        created_at,
        revoked_at
      `)
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      keys: keys || [],
    });
  } catch (error) {
    console.error("Vendor API keys list error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load API keys.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const keyName = cleanText(body?.keyName || body?.key_name) || "Vendor API Key";

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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || !["vendor", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Vendor access required." },
        { status: 403 }
      );
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const rawKey = generateVendorApiKey();
    const keyHash = hashVendorApiKey(rawKey);
    const keyPrefix = getApiKeyPrefix(rawKey);

    const { data: apiKey, error } = await supabaseAdmin
      .from("vendor_api_keys")
      .insert({
        auth_user_id: user.id,
        vendor_id: vendorProfile?.id || user.id,
        key_name: keyName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        permissions: [
          "products:read",
          "products:write",
          "inventory:write",
          "orders:read",
        ],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        key_name,
        key_prefix,
        permissions,
        status,
        created_at
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      apiKey,
      rawKey,
      message:
        "API key created. Copy it now because it will not be shown again.",
    });
  } catch (error) {
    console.error("Vendor API key create error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create API key.",
      },
      { status: 500 }
    );
  }
}
