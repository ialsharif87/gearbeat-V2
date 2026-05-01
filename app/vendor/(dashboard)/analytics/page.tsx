import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SafeResult<T> = {
  data: T | null;
  error: any;
};

async function safeQuery<T>(
  queryPromise: PromiseLike<SafeResult<T>>
): Promise<T | null> {
  const { data, error } = await queryPromise;

  if (error) {
    console.warn("Vendor analytics optional query failed:", error.message);
    return null;
  }

  return data;
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getProductName(product: any) {
  return (
    product?.name_en ||
    product?.name_ar ||
    product?.name ||
    product?.title ||
    "Product"
  );
}

function getOrderItemAmount(item: any) {
  return Number(
    item.total_price ||
      item.line_total ||
      item.total_amount ||
      item.amount ||
      Number(item.quantity || 1) * Number(item.unit_price || item.price || 0) ||
      0
  );
}

function getCommissionAmount(item: any, grossAmount: number) {
  const directCommission = Number(
    item.commission_amount ||
      item.platform_commission_amount ||
      item.admin_commission_amount ||
      0
  );

  if (directCommission > 0) {
    return directCommission;
  }

  const commissionRate = Number(
    item.commission_rate ||
      item.platform_commission_rate ||
      0
  );

  if (commissionRate > 0) {
    return grossAmount * (commissionRate / 100);
  }

  return 0;
}

function getNetAmount(item: any, grossAmount: number, commissionAmount: number) {
  const directNet = Number(
    item.net_amount ||
      item.vendor_net_amount ||
      item.payout_amount ||
      0
  );

  if (directNet > 0) {
    return directNet;
  }

  return Math.max(grossAmount - commissionAmount, 0);
}

function normalizeStatus(value: unknown) {
  return String(value || "pending").toLowerCase();
}

function StatCard({
  icon,
  labelEn,
  labelAr,
  value,
  hint,
}: {
  icon: string;
  labelEn: string;
  labelAr: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <label>
          <T en={labelEn} ar={labelAr} />
        </label>
        <div className="stat-value">{value}</div>
        {hint ? (
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RevenueBar({
  label,
  value,
  maxValue,
  currency,
}: {
  label: string;
  value: number;
  maxValue: number;
  currency: string;
}) {
  const percent =
    maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{label}</span>
        <strong>{formatMoney(value, currency)}</strong>
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(207,167,98,0.95), rgba(255,255,255,0.6))",
          }}
        />
      </div>
    </div>
  );
}

export default async function VendorAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=vendor");
  }

  const supabaseAdmin = createAdminClient();

  const profile = await safeQuery<any>(
    supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email, role, preferred_currency")
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  if (!profile) {
    redirect("/login?account=vendor");
  }

  if (profile.role !== "vendor" && profile.role !== "admin") {
    redirect("/forbidden");
  }

  const vendorProfile = await safeQuery<any>(
    supabaseAdmin
      .from("vendor_profiles")
      .select(`
        id,
        auth_user_id,
        business_name_en,
        business_name_ar,
        store_name,
        status,
        business_verification_status,
        country_code,
        city_name
      `)
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  const vendorIdCandidates = [
    user.id,
    vendorProfile?.id,
    vendorProfile?.auth_user_id,
  ].filter(Boolean);

  const vendorPrimaryId = vendorProfile?.id || user.id;
  const currency = profile.preferred_currency || "SAR";

  const products = await safeQuery<any[]>(
    supabaseAdmin
      .from("marketplace_products")
      .select(`
        id,
        vendor_id,
        name_en,
        name_ar,
        name,
        slug,
        status,
        base_price,
        created_at
      `)
      .in("vendor_id", vendorIdCandidates)
      .order("created_at", { ascending: false })
      .limit(100)
  );

  const orderItems = await safeQuery<any[]>(
    supabaseAdmin
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
        amount,
        commission_amount,
        platform_commission_amount,
        admin_commission_amount,
        commission_rate,
        platform_commission_rate,
        net_amount,
        vendor_net_amount,
        payout_amount,
        status,
        created_at,
        product:marketplace_products(
          id,
          name_en,
          name_ar,
          name,
          slug,
          base_price
        )
      `)
      .in("vendor_id", vendorIdCandidates)
      .order("created_at", { ascending: false })
      .limit(200)
  );

  const productRows = products || [];
  const itemRows = orderItems || [];

  const enrichedItems = itemRows.map((item: any) => {
    const grossAmount = getOrderItemAmount(item);
    const commissionAmount = getCommissionAmount(item, grossAmount);
    const netAmount = getNetAmount(item, grossAmount, commissionAmount);
    const status = normalizeStatus(item.status);

    return {
      ...item,
      grossAmount,
      commissionAmount,
      netAmount,
      normalizedStatus: status,
    };
  });

  const paidItems = enrichedItems.filter((item) =>
    ["paid", "completed", "fulfilled", "delivered", "shipped"].includes(
      item.normalizedStatus
    )
  );

  const pendingItems = enrichedItems.filter((item) =>
    ["pending", "created", "processing", "confirmed"].includes(
      item.normalizedStatus
    )
  );

  const cancelledItems = enrichedItems.filter((item) =>
    ["cancelled", "canceled", "refunded", "rejected"].includes(
      item.normalizedStatus
    )
  );

  const grossSales = paidItems.reduce(
    (sum, item) => sum + Number(item.grossAmount || 0),
    0
  );

  const pendingSales = pendingItems.reduce(
    (sum, item) => sum + Number(item.grossAmount || 0),
    0
  );

  const commissionTotal = paidItems.reduce(
    (sum, item) => sum + Number(item.commissionAmount || 0),
    0
  );

  const netPayout = paidItems.reduce(
    (sum, item) => sum + Number(item.netAmount || 0),
    0
  );

  const productPerformanceMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      quantity: number;
      grossAmount: number;
      netAmount: number;
    }
  >();

  for (const item of enrichedItems) {
    const productId = String(item.product_id || item.product?.id || "unknown");
    const existing = productPerformanceMap.get(productId);

    const quantity = Number(item.quantity || 1);
    const productName = getProductName(item.product);

    if (!existing) {
      productPerformanceMap.set(productId, {
        productId,
        productName,
        quantity,
        grossAmount: Number(item.grossAmount || 0),
        netAmount: Number(item.netAmount || 0),
      });
    } else {
      existing.quantity += quantity;
      existing.grossAmount += Number(item.grossAmount || 0);
      existing.netAmount += Number(item.netAmount || 0);
    }
  }

  const productPerformance = Array.from(productPerformanceMap.values())
    .sort((a, b) => b.grossAmount - a.grossAmount)
    .slice(0, 8);

  const maxProductGross = productPerformance.reduce(
    (max, item) => Math.max(max, item.grossAmount),
    0
  );

  const vendorName =
    vendorProfile?.business_name_en ||
    vendorProfile?.business_name_ar ||
    vendorProfile?.store_name ||
    profile.full_name ||
    "Vendor";

  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Vendor Analytics" ar="تحليلات التاجر" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Revenue dashboard" ar="لوحة الأرباح" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 780 }}>
            <T
              en="Track sales, estimated commission, net payout, order item status, and product performance."
              ar="تابع المبيعات، العمولة المتوقعة، صافي الأرباح، حالة الطلبات، وأداء المنتجات."
            />{" "}
            — {vendorName}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/vendor/products" className="btn">
            <T en="Products" ar="المنتجات" />
          </Link>

          <Link href="/vendor/orders" className="btn btn-primary">
            <T en="Orders" ar="الطلبات" />
          </Link>
        </div>
      </section>

      <section className="stats-grid" style={{ marginTop: 28 }}>
        <StatCard
          icon="💰"
          labelEn="Gross Sales"
          labelAr="إجمالي المبيعات"
          value={formatMoney(grossSales, currency)}
          hint="Paid/completed items"
        />

        <StatCard
          icon="🏦"
          labelEn="Net Payout"
          labelAr="صافي الأرباح"
          value={formatMoney(netPayout, currency)}
          hint="Estimated vendor net"
        />

        <StatCard
          icon="📊"
          labelEn="Commission"
          labelAr="العمولة"
          value={formatMoney(commissionTotal, currency)}
          hint="Estimated platform commission"
        />

        <StatCard
          icon="⏳"
          labelEn="Pending Sales"
          labelAr="مبيعات معلقة"
          value={formatMoney(pendingSales, currency)}
          hint={`${pendingItems.length} pending items`}
        />
      </section>

      <section className="stats-grid" style={{ marginTop: 18 }}>
        <StatCard
          icon="🎛️"
          labelEn="Products"
          labelAr="المنتجات"
          value={productRows.length}
        />

        <StatCard
          icon="✅"
          labelEn="Paid Items"
          labelAr="عناصر مدفوعة"
          value={paidItems.length}
        />

        <StatCard
          icon="📝"
          labelEn="Pending Items"
          labelAr="عناصر معلقة"
          value={pendingItems.length}
        />

        <StatCard
          icon="↩️"
          labelEn="Cancelled / Refunded"
          labelAr="ملغاة / مستردة"
          value={cancelledItems.length}
        />
      </section>

      <section
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 22 }}>
          <div className="card">
            <h2>
              <T en="Top product performance" ar="أفضل أداء للمنتجات" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Simple revenue bars based on recent order item data."
                ar="مؤشرات بسيطة حسب بيانات عناصر الطلبات الأخيرة."
              />
            </p>

            <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
              {productPerformance.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  <T
                    en="No product sales data yet."
                    ar="لا توجد بيانات مبيعات للمنتجات بعد."
                  />
                </div>
              ) : (
                productPerformance.map((product) => (
                  <RevenueBar
                    key={product.productId}
                    label={`${product.productName} · Qty ${product.quantity}`}
                    value={product.grossAmount}
                    maxValue={maxProductGross}
                    currency={currency}
                  />
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Recent order items" ar="آخر عناصر الطلبات" />
            </h2>

            <div className="table-responsive" style={{ marginTop: 18 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {enrichedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                        <T
                          en="No order items found."
                          ar="لا توجد عناصر طلبات."
                        />
                      </td>
                    </tr>
                  ) : (
                    enrichedItems.slice(0, 30).map((item: any) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 800 }}>
                            {getProductName(item.product)}
                          </div>
                          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                            Qty: {item.quantity || 1}
                          </div>
                        </td>

                        <td>
                          <span className="badge">{item.normalizedStatus}</span>
                        </td>

                        <td>{formatMoney(item.grossAmount, currency)}</td>
                        <td>{formatMoney(item.commissionAmount, currency)}</td>
                        <td>
                          <strong>{formatMoney(item.netAmount, currency)}</strong>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside style={{ display: "grid", gap: 22 }}>
          <div
            className="card"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(207,167,98,0.20), transparent 35%), rgba(255,255,255,0.035)",
              border: "1px solid rgba(207,167,98,0.22)",
            }}
          >
            <span className="badge badge-gold">
              <T en="Vendor status" ar="حالة التاجر" />
            </span>

            <h2 style={{ marginTop: 10 }}>{vendorName}</h2>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Profile status" ar="حالة الملف" />
                </span>
                <strong>{vendorProfile?.status || "—"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Verification" ar="التوثيق" />
                </span>
                <strong>{vendorProfile?.business_verification_status || "—"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Country" ar="الدولة" />
                </span>
                <strong>{vendorProfile?.country_code || "—"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="City" ar="المدينة" />
                </span>
                <strong>{vendorProfile?.city_name || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Revenue explanation" ar="شرح الأرباح" />
            </h2>

            <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              <li>
                <T
                  en="Gross sales are based on paid or completed order items."
                  ar="إجمالي المبيعات يعتمد على عناصر الطلبات المدفوعة أو المكتملة."
                />
              </li>
              <li>
                <T
                  en="Commission is estimated from item commission fields when available."
                  ar="العمولة تقديرية حسب حقول العمولة في عناصر الطلب عند توفرها."
                />
              </li>
              <li>
                <T
                  en="Net payout is estimated and not a final finance settlement."
                  ar="صافي الأرباح تقديري وليس تسوية مالية نهائية."
                />
              </li>
            </ul>
          </div>

          <div className="card">
            <h2>
              <T en="Quick actions" ar="إجراءات سريعة" />
            </h2>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <Link href="/vendor/products" className="btn">
                <T en="Manage products" ar="إدارة المنتجات" />
              </Link>

              <Link href="/vendor/orders" className="btn">
                <T en="Manage orders" ar="إدارة الطلبات" />
              </Link>

              <Link href="/vendor/profile" className="btn">
                <T en="Vendor profile" ar="ملف التاجر" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
