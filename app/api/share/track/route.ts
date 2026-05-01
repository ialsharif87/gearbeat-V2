import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_SHARE_TYPES = [
  "studio",
  "product",
  "vendor",
  "booking",
  "offer",
  "general",
];

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanOptionalUuid(value: unknown) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  return text;
}

function isAllowedShareType(value: string) {
  return ALLOWED_SHARE_TYPES.includes(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const shareType = cleanText(body.shareType || "general");
    const channel = cleanText(body.channel || "unknown");
    const sharedUrl = cleanText(body.sharedUrl);
    const referralCode = cleanText(body.referralCode);

    if (!isAllowedShareType(shareType)) {
      return NextResponse.json(
        { error: "Invalid share type." },
        { status: 400 }
      );
    }

    if (!sharedUrl) {
      return NextResponse.json(
        { error: "Shared URL is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("share_events").insert({
      auth_user_id: user?.id || null,
      share_type: shareType,
      studio_id: cleanOptionalUuid(body.studioId),
      product_id: cleanOptionalUuid(body.productId),
      vendor_id: cleanOptionalUuid(body.vendorId),
      referral_code: referralCode || null,
      channel,
      shared_url: sharedUrl,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Share tracking error:", error);

    return NextResponse.json(
      { error: "Could not track share." },
      { status: 500 }
    );
  }
}
