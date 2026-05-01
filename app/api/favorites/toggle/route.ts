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

function buildInsertPayload({
  authUserId,
  favoriteType,
  targetId,
}: {
  authUserId: string;
  favoriteType: FavoriteType;
  targetId: string;
}) {
  return {
    auth_user_id: authUserId,
    favorite_type: favoriteType,
    studio_id: favoriteType === "studio" ? targetId : null,
    product_id: favoriteType === "product" ? targetId : null,
    vendor_id: favoriteType === "vendor" ? targetId : null,
  };
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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const targetColumn = getTargetColumn(favoriteType);

    const { data: existingFavorite, error: existingError } = await supabaseAdmin
      .from("customer_favorites")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("favorite_type", favoriteType)
      .eq(targetColumn, targetId)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingFavorite) {
      const { error: deleteError } = await supabaseAdmin
        .from("customer_favorites")
        .delete()
        .eq("id", existingFavorite.id)
        .eq("auth_user_id", user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return NextResponse.json({
        ok: true,
        saved: false,
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from("customer_favorites")
      .insert(
        buildInsertPayload({
          authUserId: user.id,
          favoriteType,
          targetId,
        })
      );

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      ok: true,
      saved: true,
    });
  } catch (error) {
    console.error("Favorite toggle error:", error);

    return NextResponse.json(
      { error: "Could not update favorite." },
      { status: 500 }
    );
  }
}
