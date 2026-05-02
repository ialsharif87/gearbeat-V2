import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAdminOrRedirect,
  requireVendorOrRedirect,
  isAdminRole as checkIsAdmin,
  isVendorRole as checkIsVendor,
} from "@/lib/auth-guards";
import {
  jsonOk,
  jsonError,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api-responses";

const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "refunded",
  "partially_refunded",
  "failed",
  "archived",
];

const ITEM_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "refunded",
  "partially_refunded",
  "failed",
];



export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const orderId = String(body.orderId || body.order_id || "").trim();
    const itemId = String(body.itemId || body.item_id || "").trim();
    const status = String(body.status || "").trim();
    const scope = String(body.scope || (itemId ? "item" : "order")).trim();

    if (!status) {
      return jsonError("Status is required.");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const supabaseAdmin = createAdminClient();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return serverError(profileError.message);
    }

    if (!profile) {
      return notFound("Profile not found.");
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const vendorIdCandidates = [
      user.id,
      vendorProfile?.id,
      vendorProfile?.auth_user_id,
    ].filter(Boolean);

    if (scope === "order") {
      if (!checkIsAdmin(profile.role as any)) {
        return NextResponse.json(
          { error: "Only admin can update full order status." },
          { status: 403 }
        );
      }

      if (!orderId) {
        return NextResponse.json(
          { error: "Order id is required." },
          { status: 400 }
        );
      }

      if (!ORDER_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: "Invalid order status." },
          { status: 400 }
        );
      }

      const paymentStatus =
        status === "paid" ||
        status === "processing" ||
        status === "shipped" ||
        status === "delivered" ||
        status === "completed"
          ? "paid"
          : status === "refunded"
            ? "refunded"
            : status === "partially_refunded"
              ? "partially_refunded"
              : status === "cancelled" || status === "canceled"
                ? "cancelled"
                : undefined;

      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (paymentStatus) {
        updatePayload.payment_status = paymentStatus;
      }

      const { data: updatedOrder, error: orderError } = await supabaseAdmin
        .from("marketplace_orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select("id, order_number, status, payment_status")
        .maybeSingle();

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!updatedOrder) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 }
        );
      }

      return jsonOk({
        order: updatedOrder,
        message: "Order status updated.",
      });
    }

    if (scope === "item") {
      if (!itemId) {
        return NextResponse.json(
          { error: "Order item id is required." },
          { status: 400 }
        );
      }

      if (!ITEM_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: "Invalid item status." },
          { status: 400 }
        );
      }

      let itemQuery = supabaseAdmin
        .from("marketplace_order_items")
        .select("id, order_id, vendor_id, status")
        .eq("id", itemId);

      if (checkIsVendor(profile.role as any)) {
        itemQuery = itemQuery.in("vendor_id", vendorIdCandidates);
      } else if (!checkIsAdmin(profile.role as any)) {
        return NextResponse.json(
          { error: "Only vendor or admin can update item status." },
          { status: 403 }
        );
      }

      const { data: item, error: itemLookupError } = await itemQuery.maybeSingle();

      if (itemLookupError) {
        throw new Error(itemLookupError.message);
      }

      if (!item) {
        return NextResponse.json(
          { error: "Order item not found or access denied." },
          { status: 404 }
        );
      }

      const { data: updatedItem, error: itemError } = await supabaseAdmin
        .from("marketplace_order_items")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .select("id, order_id, vendor_id, status")
        .maybeSingle();

      if (itemError) {
        throw new Error(itemError.message);
      }

      const { data: allItems } = await supabaseAdmin
        .from("marketplace_order_items")
        .select("id, status")
        .eq("order_id", item.order_id);

      const statuses = (allItems || []).map((row: any) => row.status);

      let nextOrderStatus = "";

      if (statuses.length > 0 && statuses.every((value: string) => value === "delivered")) {
        nextOrderStatus = "delivered";
      } else if (statuses.some((value: string) => value === "shipped")) {
        nextOrderStatus = "shipped";
      } else if (statuses.some((value: string) => value === "processing")) {
        nextOrderStatus = "processing";
      } else if (statuses.every((value: string) => value === "completed")) {
        nextOrderStatus = "completed";
      }

      if (nextOrderStatus) {
        await supabaseAdmin
          .from("marketplace_orders")
          .update({
            status: nextOrderStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.order_id);
      }

      return jsonOk({
        item: updatedItem,
        nextOrderStatus: nextOrderStatus || null,
        message: "Order item status updated.",
      });
    }

    return NextResponse.json(
      { error: "Invalid update scope." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Marketplace order status update failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update order status.",
      },
      { status: 500 }
    );
  }
}
