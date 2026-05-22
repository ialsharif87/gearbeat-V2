import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeCustomerSocialLinkRow,
  validateCustomerSocialLinksPayload,
} from "@/lib/customer-social-links";

const SOCIAL_LINK_SELECT =
  "id, platform, url, handle, visibility, moderation_status, created_at, updated_at";

function userSafeServerError() {
  return NextResponse.json(
    { error: "Could not update social links." },
    { status: 500 }
  );
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("customer_social_links")
    .select(SOCIAL_LINK_SELECT)
    .eq("user_id", user.id)
    .order("platform", { ascending: true });

  if (error) {
    console.warn("Customer social links lookup failed", {
      message: error.message,
    });

    return NextResponse.json(
      { error: "Could not load social links." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    links: ((data || []) as Record<string, unknown>[]).map(
      normalizeCustomerSocialLinkRow
    ),
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateCustomerSocialLinksPayload(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { error: deleteError } = await supabase
    .from("customer_social_links")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    console.warn("Customer social links delete failed", {
      message: deleteError.message,
    });

    return userSafeServerError();
  }

  if (validation.links.length > 0) {
    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("customer_social_links")
      .insert(
        validation.links.map((link) => ({
          user_id: user.id,
          platform: link.platform,
          url: link.url,
          handle: link.handle,
          updated_at: now,
        }))
      );

    if (insertError) {
      console.warn("Customer social links insert failed", {
        message: insertError.message,
      });

      return userSafeServerError();
    }
  }

  const { data, error: readError } = await supabase
    .from("customer_social_links")
    .select(SOCIAL_LINK_SELECT)
    .eq("user_id", user.id)
    .order("platform", { ascending: true });

  if (readError) {
    console.warn("Customer social links reload failed", {
      message: readError.message,
    });

    return userSafeServerError();
  }

  return NextResponse.json({
    links: ((data || []) as Record<string, unknown>[]).map(
      normalizeCustomerSocialLinkRow
    ),
  });
}
