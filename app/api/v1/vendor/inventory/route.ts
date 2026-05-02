import { NextResponse } from "next/server";
import {
  authenticateVendorApiRequest,
  logVendorApiRequest,
} from "@/lib/vendor-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function parseNumber(value: unknown) {
  const valueNumber = Number(value || 0);
  return Number.isFinite(valueNumber) ? valueNumber : 0;
}

function parseInteger(value: unknown) {
  return Math.max(Math.floor(parseNumber(value)), 0);
}

export async function POST(request: Request) {
  const auth = await authenticateVendorApiRequest(request, "inventory:write");

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const sku = cleanText(body.sku);
    const stockQuantity = parseInteger(body.stock_quantity || body.stock);
    const basePrice =
      body.base_price === undefined && body.price === undefined
        ? null
        : parseNumber(body.base_price || body.price);

    if (!sku) {
      return NextResponse.json({ error: "SKU is required." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      stock_quantity: stockQuantity,
      updated_at: new Date().toISOString(),
    };

    if (basePrice !== null && basePrice > 0) {
      updatePayload.base_price = basePrice;
    }

    const supabaseAdmin = createAdminClient();

    const { data: updated, error } = await supabaseAdmin
      .from("marketplace_products")
      .update(updatePayload)
      .eq("vendor_id", auth.vendorId)
      .eq("sku", sku)
      .select("id, sku, stock_quantity, base_price")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Product not found for this vendor." },
        { status: 404 }
      );
    }

    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/inventory",
      method: "POST",
      statusCode: 200,
      requestSummary: { sku, stockQuantity, basePrice },
      responseSummary: { productId: updated.id },
    });

    return NextResponse.json({
      ok: true,
      product: updated,
      message: "Inventory updated.",
    });
  } catch (error) {
    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/inventory",
      method: "POST",
      statusCode: 500,
      responseSummary: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update inventory.",
      },
      { status: 500 }
    );
  }
}
