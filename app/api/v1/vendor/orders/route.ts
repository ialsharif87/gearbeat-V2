import { NextResponse } from "next/server";
import {
  authenticateVendorApiRequest,
  logVendorApiRequest,
} from "@/lib/vendor-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await authenticateVendorApiRequest(request, "orders:read");

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("marketplace_order_items")
      .select(`
        id,
        order_id,
        product_id,
        vendor_id,
        quantity,
        unit_price,
        price,
        total_price,
        line_total,
        total_amount,
        status,
        created_at,
        product:marketplace_products(
          id,
          sku,
          name_en,
          name_ar
        )
      `)
      .eq("vendor_id", auth.vendorId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/orders",
      method: "GET",
      statusCode: 200,
      responseSummary: { count: data?.length || 0 },
    });

    return NextResponse.json({
      ok: true,
      orderItems: data || [],
    });
  } catch (error) {
    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/orders",
      method: "GET",
      statusCode: 500,
      responseSummary: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load orders.",
      },
      { status: 500 }
    );
  }
}
