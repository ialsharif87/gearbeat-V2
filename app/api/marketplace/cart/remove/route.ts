import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
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

    const itemId = cleanText(body.itemId || body.item_id);

    if (!itemId) {
      return NextResponse.json(
        { error: "Cart item id is required." },
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
      .from("marketplace_cart_items")
      .delete()
      .eq("id", itemId)
      .eq("auth_user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      message: "Cart item removed.",
    });
  } catch (error) {
    console.error("Cart remove error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not remove cart item.",
      },
      { status: 500 }
    );
  }
}
