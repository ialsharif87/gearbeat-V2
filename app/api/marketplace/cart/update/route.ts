import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanInteger(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.max(Math.floor(numberValue), 1);
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
    const quantity = cleanInteger(body.quantity);

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

    const { data: item, error: itemError } = await supabaseAdmin
      .from("marketplace_cart_items")
      .select(`
        id,
        auth_user_id,
        product_id,
        variant_id,
        product:marketplace_products(
          id,
          stock_quantity,
          status,
          is_active
        ),
        variant:marketplace_product_variants(
          id,
          stock_quantity,
          is_active
        )
      `)
      .eq("id", itemId)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (itemError) {
      throw new Error(itemError.message);
    }

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 }
      );
    }

    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;

    if (!product || !["approved", "active", "published"].includes(product.status) || !product.is_active) {
      return NextResponse.json(
        { error: "Product is no longer available." },
        { status: 400 }
      );
    }

    const availableStock = variant
      ? Number(variant.stock_quantity || 0)
      : Number(product.stock_quantity || 0);

    if (quantity > availableStock) {
      return NextResponse.json(
        { error: `Only ${availableStock} units are available.` },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("marketplace_cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("auth_user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      ok: true,
      message: "Cart item updated.",
    });
  } catch (error) {
    console.error("Cart update error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update cart item.",
      },
      { status: 500 }
    );
  }
}
