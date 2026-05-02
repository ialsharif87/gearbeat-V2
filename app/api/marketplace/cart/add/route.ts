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

function getProductPrice(product: any) {
  const salePrice = Number(product.sale_price || 0);
  const basePrice = Number(product.base_price || 0);

  if (salePrice > 0 && salePrice < basePrice) {
    return salePrice;
  }

  return basePrice;
}

async function ensureActiveCart({
  supabaseAdmin,
  authUserId,
  currencyCode,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  authUserId: string;
  currencyCode: string;
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
      currency_code: currencyCode || "SAR",
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const productId = cleanText(body.productId || body.product_id);
    const variantId = cleanText(body.variantId || body.variant_id) || null;
    const quantity = cleanInteger(body.quantity || 1);

    if (!productId) {
      return NextResponse.json(
        { error: "Product id is required." },
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

    const { data: product, error: productError } = await supabaseAdmin
      .from("marketplace_products")
      .select(`
        id,
        vendor_id,
        base_price,
        sale_price,
        stock_quantity,
        currency_code,
        status,
        is_active
      `)
      .eq("id", productId)
      .in("status", ["approved", "active", "published"])
      .eq("is_active", true)
      .maybeSingle();

    if (productError) {
      throw new Error(productError.message);
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product is not available." },
        { status: 404 }
      );
    }

    let availableStock = Number(product.stock_quantity || 0);
    let unitPrice = getProductPrice(product);

    if (variantId) {
      const { data: variant, error: variantError } = await supabaseAdmin
        .from("marketplace_product_variants")
        .select("id, product_id, price_adjustment, stock_quantity, is_active")
        .eq("id", variantId)
        .eq("product_id", product.id)
        .eq("is_active", true)
        .maybeSingle();

      if (variantError) {
        throw new Error(variantError.message);
      }

      if (!variant) {
        return NextResponse.json(
          { error: "Product variant is not available." },
          { status: 404 }
        );
      }

      availableStock = Number(variant.stock_quantity || 0);
      unitPrice = unitPrice + Number(variant.price_adjustment || 0);
    }

    if (availableStock <= 0) {
      return NextResponse.json(
        { error: "Product is out of stock." },
        { status: 400 }
      );
    }

    if (quantity > availableStock) {
      return NextResponse.json(
        {
          error: `Only ${availableStock} units are available.`,
        },
        { status: 400 }
      );
    }

    const cart = await ensureActiveCart({
      supabaseAdmin,
      authUserId: user.id,
      currencyCode: product.currency_code || "SAR",
    });

    const { data: existingItem, error: existingItemError } = await supabaseAdmin
      .from("marketplace_cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("auth_user_id", user.id)
      .eq("product_id", product.id)
      .is("variant_id", variantId)
      .maybeSingle();

    if (existingItemError) {
      throw new Error(existingItemError.message);
    }

    if (existingItem?.id) {
      const nextQuantity = Number(existingItem.quantity || 0) + quantity;

      if (nextQuantity > availableStock) {
        return NextResponse.json(
          {
            error: `Only ${availableStock} units are available.`,
          },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("marketplace_cart_items")
        .update({
          quantity: nextQuantity,
          unit_price: unitPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .eq("auth_user_id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("marketplace_cart_items")
        .insert({
          cart_id: cart.id,
          auth_user_id: user.id,
          product_id: product.id,
          variant_id: variantId,
          vendor_id: product.vendor_id,
          quantity,
          unit_price: unitPrice,
          currency_code: product.currency_code || "SAR",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    await supabaseAdmin
      .from("marketplace_carts")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", cart.id);

    return NextResponse.json({
      ok: true,
      cartId: cart.id,
      message: "Product added to cart.",
    });
  } catch (error) {
    console.error("Cart add error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not add product to cart.",
      },
      { status: 500 }
    );
  }
}
