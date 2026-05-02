import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function formatCartItem(item: any) {
  const product = Array.isArray(item.product) ? item.product[0] : item.product;
  const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;

  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unit_price || 0);

  return {
    id: item.id,
    cartId: item.cart_id,
    productId: item.product_id,
    variantId: item.variant_id,
    vendorId: item.vendor_id,
    quantity,
    unitPrice,
    lineTotal: quantity * unitPrice,
    currencyCode: item.currency_code || "SAR",
    product,
    variant,
  };
}

async function ensureActiveCart({
  supabaseAdmin,
  authUserId,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  authUserId: string;
}) {
  const { data: existingCart, error: existingError } = await supabaseAdmin
    .from("marketplace_carts")
    .select("id, auth_user_id, status, currency_code")
    .eq("auth_user_id", authUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingCart?.id) {
    return existingCart;
  }

  const { data: createdCart, error: createError } = await supabaseAdmin
    .from("marketplace_carts")
    .insert({
      auth_user_id: authUserId,
      status: "active",
      currency_code: "SAR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id, auth_user_id, status, currency_code")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return createdCart;
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

    const cart = await ensureActiveCart({
      supabaseAdmin,
      authUserId: user.id,
    });

    const { data: cartItems, error: itemsError } = await supabaseAdmin
      .from("marketplace_cart_items")
      .select(`
        id,
        cart_id,
        auth_user_id,
        product_id,
        variant_id,
        vendor_id,
        quantity,
        unit_price,
        currency_code,
        created_at,
        updated_at,
        product:marketplace_products(
          id,
          slug,
          sku,
          name_en,
          name_ar,
          base_price,
          sale_price,
          stock_quantity,
          currency_code,
          images,
          status,
          is_active
        ),
        variant:marketplace_product_variants(
          id,
          variant_name,
          name_en,
          name_ar,
          sku,
          price_adjustment,
          stock_quantity,
          is_active
        )
      `)
      .eq("cart_id", cart.id)
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const items = (cartItems || []).map(formatCartItem);
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.lineTotal || 0),
      0
    );

    return NextResponse.json({
      ok: true,
      cart,
      items,
      subtotal,
      itemCount: items.reduce(
        (sum: number, item: any) => sum + Number(item.quantity || 0),
        0
      ),
      currencyCode: cart.currency_code || "SAR",
    });
  } catch (error) {
    console.error("Cart get error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load cart.",
      },
      { status: 500 }
    );
  }
}
