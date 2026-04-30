import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

const ALLOWED_VENDOR_ITEM_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

type AllowedVendorItemStatus = (typeof ALLOWED_VENDOR_ITEM_STATUSES)[number];

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isAllowedVendorItemStatus(
  status: string
): status is AllowedVendorItemStatus {
  return ALLOWED_VENDOR_ITEM_STATUSES.includes(
    status as AllowedVendorItemStatus
  );
}

function formatMoney(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return "0.00 SAR";
  }

  return `${numberValue.toFixed(2)} SAR`;
}

function getOrderFromItems(items: any[]) {
  const firstItem = items[0];

  if (!firstItem) {
    return null;
  }

  if (Array.isArray(firstItem.order)) {
    return firstItem.order[0] || null;
  }

  return firstItem.order || null;
}

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: vendorItems, error } = await supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id,
      order_id,
      vendor_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      sku,
      quantity,
      unit_price,
      total_price,
      commission_amount,
      vendor_net_amount,
      status,
      created_at,
      product:marketplace_products(
        id,
        name_en,
        name_ar
      ),
      order:marketplace_orders(
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        customer_id,
        created_at
      )
    `)
    .eq("order_id", orderId)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!vendorItems || vendorItems.length === 0) {
    notFound();
  }

  const order = getOrderFromItems(vendorItems);

  async function updateItemStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin, user } = await requireVendorLayoutAccess();

    const itemId = getText(formData, "item_id");
    const status = getText(formData, "status");

    if (!itemId) {
      throw new Error("Missing order item id.");
    }

    if (!isAllowedVendorItemStatus(status)) {
      throw new Error("Invalid vendor item status.");
    }

    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from("marketplace_order_items")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .eq("vendor_id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!updatedItem) {
      throw new Error("Order item not found or not owned by this vendor.");
    }

    redirect(`/vendor/orders/${orderId}`);
  }

  const vendorSubtotal = vendorItems.reduce(
    (sum: number, item: any) => sum + Number(item.total_price || 0),
    0
  );

  const vendorCommission = vendorItems.reduce(
    (sum: number, item: any) => sum + Number(item.commission_amount || 0),
    0
  );

  const vendorNet = vendorItems.reduce(
    (sum: number, item: any) => sum + Number(item.vendor_net_amount || 0),
    0
  );

  return (
    <div className="dashboard-page">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge">
            <T en="Order Details" ar="تفاصيل الطلب" />
          </span>

          <h1>
            <T en="Vendor Order" ar="طلب التاجر" />{" "}
            {order?.order_number ? `#${order.order_number}` : `#${orderId.slice(0, 8)}`}
          </h1>

          <p>
            <T
              en="This page only shows the items in this order that belong to your vendor account."
              ar="هذه الصفحة تعرض فقط المنتجات التابعة لحساب التاجر الخاص بك داخل هذا الطلب."
            />
          </p>
        </div>

        <Link href="/vendor/orders" className="btn">
          <T en="Back to Orders" ar="الرجوع للطلبات" />
        </Link>
      </div>

      <div className="grid grid-3" style={{ marginTop: 30 }}>
        <div className="card">
          <span className="stat-label">
            <T en="Vendor Subtotal" ar="إجمالي منتجاتك" />
          </span>
          <strong className="stat-value">{formatMoney(vendorSubtotal)}</strong>
        </div>

        <div className="card">
          <span className="stat-label">
            <T en="Commission" ar="العمولة" />
          </span>
          <strong className="stat-value">{formatMoney(vendorCommission)}</strong>
        </div>

        <div className="card">
          <span className="stat-label">
            <T en="Vendor Net" ar="صافي التاجر" />
          </span>
          <strong className="stat-value">{formatMoney(vendorNet)}</strong>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <T en="Product" ar="المنتج" />
              </th>
              <th>
                <T en="SKU" ar="SKU" />
              </th>
              <th>
                <T en="Quantity" ar="الكمية" />
              </th>
              <th>
                <T en="Unit Price" ar="سعر الوحدة" />
              </th>
              <th>
                <T en="Total" ar="الإجمالي" />
              </th>
              <th>
                <T en="Status" ar="الحالة" />
              </th>
              <th>
                <T en="Update" ar="تحديث" />
              </th>
            </tr>
          </thead>

          <tbody>
            {vendorItems.map((item: any) => {
              const productName =
                item.product_name ||
                item.product?.name_en ||
                item.product?.name_ar ||
                "Product";

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{productName}</div>
                    {item.variant_name ? (
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        {item.variant_name}
                      </div>
                    ) : null}
                  </td>

                  <td>{item.sku || "—"}</td>

                  <td>{item.quantity || 0}</td>

                  <td>{formatMoney(item.unit_price)}</td>

                  <td>{formatMoney(item.total_price)}</td>

                  <td>
                    <span className="badge">{item.status || "pending"}</span>
                  </td>

                  <td>
                    <form
                      action={updateItemStatus}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <input type="hidden" name="item_id" value={item.id} />

                      <select
                        name="status"
                        className="input"
                        defaultValue={item.status || "confirmed"}
                        style={{ minWidth: 140 }}
                      >
                        <option value="confirmed">
                          Confirmed
                        </option>
                        <option value="processing">
                          Processing
                        </option>
                        <option value="shipped">
                          Shipped
                        </option>
                        <option value="delivered">
                          Delivered
                        </option>
                      </select>

                      <button type="submit" className="btn btn-small">
                        <T en="Save" ar="حفظ" />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Security Rule" ar="قاعدة الأمان" />
        </h2>
        <p>
          <T
            en="This page intentionally displays only this vendor's own order items. Full customer/order management remains an admin responsibility."
            ar="هذه الصفحة تعرض فقط منتجات هذا التاجر داخل الطلب. إدارة الطلب الكامل وبيانات العميل تبقى من صلاحيات الإدارة."
          />
        </p>
      </div>
    </div>
  );
}
