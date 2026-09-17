import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import MarketplaceCheckoutBox from "@/components/marketplace-checkout-box";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.sku || "Product";
}

export default async function MarketplaceCheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=customer");
  }

  const supabaseAdmin = createAdminClient();

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

  const itemsResult = cart?.id
    ? await supabaseAdmin
        .from("marketplace_cart_items")
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          currency_code,
          product:marketplace_products(
            id,
            sku,
            name_en,
            name_ar,
            status,
            is_active,
            stock_quantity
          ),
          variant:marketplace_product_variants(
            id,
            variant_name,
            name_en,
            name_ar,
            stock_quantity,
            is_active
          )
        `)
        .eq("cart_id", cart.id)
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }

  const items = itemsResult.data || [];

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
  }, 0);

  const currency = cart?.currency_code || items[0]?.currency_code || "SAR";

  return (
    <main className="dashboard-page" style={{ maxWidth: 1160, margin: "0 auto" }}>
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
            <T en="Checkout" ar="الدفع" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Marketplace checkout" ar="إتمام طلب المتجر" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            <T
              en="Review your cart and create a test payment checkout session."
              ar="راجع السلة وأنشئ جلسة دفع تجريبية."
            />
          </p>
        </div>

        <Link href="/marketplace/cart" className="btn">
          <T en="Back to cart" ar="الرجوع للسلة" />
        </Link>
      </section>

      <section
        style={{
          marginTop: 26,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 380px",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div className="card">
          <h2>
            <T en="Checkout items" ar="عناصر الطلب" />
          </h2>

          {items.length === 0 ? (
            <div
              style={{
                marginTop: 18,
                padding: 30,
                borderRadius: 18,
                background: "rgba(255,255,255,0.035)",
                textAlign: "center",
              }}
            >
              <h3>
                <T en="No active cart items" ar="لا توجد عناصر في السلة" />
              </h3>

              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Go back to the marketplace and add products."
                  ar="ارجع إلى المتجر وأضف منتجات."
                />
              </p>

              <Link href="/marketplace" className="btn btn-primary">
                <T en="Browse marketplace" ar="تصفح المتجر" />
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {items.map((item: any) => {
                const product = Array.isArray(item.product)
                  ? item.product[0]
                  : item.product;

                const variant = Array.isArray(item.variant)
                  ? item.variant[0]
                  : item.variant;

                const lineTotal =
                  Number(item.quantity || 0) * Number(item.unit_price || 0);

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>{getProductName(product)}</strong>
                        <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                          SKU: {product?.sku || "—"}
                          {variant ? ` · ${variant.variant_name || variant.name_en}` : ""}
                        </p>
                      </div>

                      <strong>{formatMoney(lineTotal, currency)}</strong>
                    </div>

                    <p style={{ color: "var(--muted)", margin: 0 }}>
                      Qty: {item.quantity} · Unit:{" "}
                      {formatMoney(item.unit_price, currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside style={{ display: "grid", gap: 18 }}>
          <div className="card">
            <h2>
              <T en="Summary" ar="الملخص" />
            </h2>

            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Items" ar="العناصر" />
                </span>
                <strong>{items.length}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Subtotal" ar="الإجمالي" />
                </span>
                <strong>{formatMoney(subtotal, currency)}</strong>
              </div>
            </div>
          </div>

          {items.length > 0 ? <MarketplaceCheckoutBox /> : null}
        </aside>
      </section>
    </main>
  );
}
