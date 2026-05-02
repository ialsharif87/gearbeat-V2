import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function createOrderNumber() {
  return `GB-MKT-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

function getProductPrice(product: any) {
  const salePrice = Number(product.sale_price || 0);
  const basePrice = Number(product.base_price || 0);

  if (salePrice > 0 && salePrice < basePrice) {
    return salePrice;
  }

  return basePrice;
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.sku || "Product";
}

function getSafeImages(product: any) {
  if (Array.isArray(product?.images)) {
    return product.images.filter(Boolean);
  }

  if (typeof product?.images === "string" && product.images) {
    return [product.images];
  }

  return [];
}

export async function POST() {
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: cart, error: cartError } = await supabaseAdmin
      .from("marketplace_carts")
      .select("id, auth_user_id, status, currency_code")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cartError) {
      throw new Error(cartError.message);
    }

    if (!cart) {
      return NextResponse.json(
        { error: "No active cart found." },
        { status: 400 }
      );
    }

    const { data: cartItems, error: cartItemsError } = await supabaseAdmin
      .from("marketplace_cart_items")
      .select(`
        id,
        cart_id,
        product_id,
        variant_id,
        vendor_id,
        quantity,
        unit_price,
        currency_code,
        product:marketplace_products(
          id,
          vendor_id,
          sku,
          slug,
          name_en,
          name_ar,
          base_price,
          sale_price,
          stock_quantity,
          currency_code,
          status,
          is_active,
          images
        ),
        variant:marketplace_product_variants(
          id,
          sku,
          variant_name,
          name_en,
          name_ar,
          price_adjustment,
          stock_quantity,
          is_active
        )
      `)
      .eq("cart_id", cart.id)
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: true });

    if (cartItemsError) {
      throw new Error(cartItemsError.message);
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    const validatedItems: any[] = [];
    let subtotalAmount = 0;
    const currencyCode = cart.currency_code || "SAR";

    for (const cartItem of cartItems) {
      const product = Array.isArray(cartItem.product)
        ? cartItem.product[0]
        : cartItem.product;

      const variant = Array.isArray(cartItem.variant)
        ? cartItem.variant[0]
        : cartItem.variant;

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart no longer exists." },
          { status: 400 }
        );
      }

      if (
        !["approved", "active", "published"].includes(product.status) ||
        !product.is_active
      ) {
        return NextResponse.json(
          {
            error: `${getProductName(product)} is no longer available.`,
          },
          { status: 400 }
        );
      }

      const quantity = Number(cartItem.quantity || 0);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid cart quantity." },
          { status: 400 }
        );
      }

      const availableStock = variant
        ? Number(variant.stock_quantity || 0)
        : Number(product.stock_quantity || 0);

      if (quantity > availableStock) {
        return NextResponse.json(
          {
            error: `${getProductName(product)} has only ${availableStock} units available.`,
          },
          { status: 400 }
        );
      }

      const baseUnitPrice =
        Number(cartItem.unit_price || 0) > 0
          ? Number(cartItem.unit_price || 0)
          : getProductPrice(product) + Number(variant?.price_adjustment || 0);

      if (!Number.isFinite(baseUnitPrice) || baseUnitPrice <= 0) {
        return NextResponse.json(
          {
            error: `${getProductName(product)} has invalid price.`,
          },
          { status: 400 }
        );
      }

      const lineTotal = quantity * baseUnitPrice;

      subtotalAmount += lineTotal;

      validatedItems.push({
        cartItem,
        product,
        variant,
        quantity,
        unitPrice: baseUnitPrice,
        lineTotal,
      });
    }

    if (subtotalAmount <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const orderNumber = createOrderNumber();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("marketplace_orders")
      .insert({
        auth_user_id: user.id,
        customer_auth_user_id: user.id,
        order_number: orderNumber,
        customer_name: profile?.full_name || null,
        customer_email: profile?.email || user.email || null,
        status: "pending_payment",
        payment_status: "unpaid",
        subtotal_amount: subtotalAmount,
        discount_amount: 0,
        coupon_discount_amount: 0,
        wallet_credit_used: 0,
        loyalty_points_redeemed: 0,
        shipping_amount: 0,
        tax_amount: 0,
        total_amount: subtotalAmount,
        currency_code: currencyCode,
        metadata: {
          source: "marketplace_cart_checkout",
          cart_id: cart.id,
          item_count: validatedItems.length,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id, order_number, total_amount, currency_code")
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const orderItemPayload = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant?.id || null,
      vendor_id: item.product.vendor_id || item.cartItem.vendor_id || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      price: item.unitPrice,
      line_total: item.lineTotal,
      total_price: item.lineTotal,
      total_amount: item.lineTotal,
      currency_code: item.product.currency_code || currencyCode,
      commission_rate: 0,
      commission_amount: 0,
      status: "pending",
      product_snapshot: {
        sku: item.product.sku,
        slug: item.product.slug,
        name_en: item.product.name_en,
        name_ar: item.product.name_ar,
        images: getSafeImages(item.product),
        variant: item.variant
          ? {
              id: item.variant.id,
              sku: item.variant.sku,
              name: item.variant.variant_name || item.variant.name_en,
            }
          : null,
      },
      metadata: {
        cart_item_id: item.cartItem.id,
      },
      created_at: nowIso,
      updated_at: nowIso,
    }));

    const { error: orderItemsError } = await supabaseAdmin
      .from("marketplace_order_items")
      .insert(orderItemPayload);

    if (orderItemsError) {
      throw new Error(orderItemsError.message);
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: checkoutSession, error: checkoutError } = await supabaseAdmin
      .from("checkout_payment_sessions")
      .insert({
        auth_user_id: user.id,
        source_type: "marketplace_order",
        source_id: order.id,
        provider_code: "manual",
        payment_method: "manual",
        installment_provider: null,
        amount: subtotalAmount,
        currency_code: currencyCode,
        status: "created",
        coupon_discount_amount: 0,
        wallet_credit_used: 0,
        loyalty_points_redeemed: 0,
        expires_at: expiresAt,
        metadata: {
          source: "marketplace_checkout",
          order_id: order.id,
          order_number: order.order_number,
          cart_id: cart.id,
          subtotal_amount: subtotalAmount,
          item_count: validatedItems.length,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id, amount, currency_code, status, expires_at")
      .single();

    if (checkoutError) {
      throw new Error(checkoutError.message);
    }

    await supabaseAdmin
      .from("marketplace_orders")
      .update({
        checkout_session_id: checkoutSession.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await supabaseAdmin
      .from("marketplace_carts")
      .update({
        status: "converted",
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          checkout_session_id: checkoutSession.id,
          converted_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", cart.id)
      .eq("auth_user_id", user.id);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      checkoutSessionId: checkoutSession.id,
      amount: Number(order.total_amount || subtotalAmount),
      currencyCode: order.currency_code || currencyCode,
      checkoutStatus: checkoutSession.status,
      expiresAt: checkoutSession.expires_at,
      message: "Marketplace order created. Manual test payment is ready.",
    });
  } catch (error) {
    console.error("Marketplace checkout create order failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create marketplace order.",
      },
      { status: 500 }
    );
  }
}
