import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_FAVORITE_TYPES = ["studio", "product", "vendor"] as const;

type FavoriteType = (typeof ALLOWED_FAVORITE_TYPES)[number];

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function isAllowedFavoriteType(value: string): value is FavoriteType {
  return ALLOWED_FAVORITE_TYPES.includes(value as FavoriteType);
}

function getTargetColumn(type: FavoriteType) {
  if (type === "studio") {
    return "studio_id";
  }

  if (type === "product") {
    return "product_id";
  }

  return "vendor_id";
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

    const favoriteType = cleanText(body.favoriteType || body.type);
    const targetId = cleanText(body.targetId);

    if (!isAllowedFavoriteType(favoriteType)) {
      return NextResponse.json(
        { error: "Invalid favorite type." },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { error: "Missing favorite target id." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        saved: false,
        authenticated: false,
      });
    }

    const supabaseAdmin = createAdminClient();
    const targetColumn = getTargetColumn(favoriteType);

    const { data, error } = await supabaseAdmin
      .from("customer_favorites")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("favorite_type", favoriteType)
      .eq(targetColumn, targetId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      saved: Boolean(data),
      authenticated: true,
    });
  } catch (error) {
    console.error("Favorite status error:", error);

    return NextResponse.json(
      { error: "Could not check favorite status." },
      { status: 500 }
    );
  }
}
