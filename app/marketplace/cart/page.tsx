import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
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

function getProductImage(product: any) {
  const images = product?.images;

  if (Array.isArray(images) && images.length > 0) {
    return String(images[0] || "");
  }

  if (typeof images === "string" && images) {
    return images;
  }

  return "";
}

export default async function MarketplaceCartPage() {
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

  const cartItemsResult = cart?.id
    ? await supabaseAdmin
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
          product:marketplace_products(
            id,
            slug,
            sku,
            name_en,
            name_ar,
            stock_quantity,
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
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (cartItemsResult.error) {
    throw new Error(cartItemsResult.error.message);
  }

  const items = cartItemsResult.data || [];

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
  }, 0);

  const itemCount = items.reduce((sum: number, item: any) => {
    return sum + Number(item.quantity || 0);
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
            <T en="Cart" ar="السلة" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Marketplace cart" ar="سلة المتجر" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            <T
              en="Review your selected products before checkout."
              ar="راجع المنتجات المختارة قبل إتمام الطلب."
            />
          </p>
        </div>

        <Link href="/marketplace" className="btn">
          <T en="Continue shopping" ar="متابعة التسوق" />
        </Link>
      </section>

      <section
        style={{
          marginTop: 26,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div className="card">
          <h2>
            <T en="Cart items" ar="عناصر السلة" />
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
                <T en="Your cart is empty" ar="سلتك فارغة" />
              </h3>

              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Add products from the marketplace to start your order."
                  ar="أضف منتجات من المتجر لبدء طلبك."
                />
              </p>

              <Link href="/marketplace" className="btn btn-primary">
                <T en="Browse marketplace" ar="تصفح المتجر" />
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
              {items.map((item: any) => {
                const product = Array.isArray(item.product)
                  ? item.product[0]
                  : item.product;
                const variant = Array.isArray(item.variant)
                  ? item.variant[0]
                  : item.variant;

                const image = getProductImage(product);
                const lineTotal =
                  Number(item.quantity || 0) * Number(item.unit_price || 0);

                const maxQuantity = variant
                  ? Number(variant.stock_quantity || 0)
                  : Number(product?.stock_quantity || 0);

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px minmax(0, 1fr)",
                      gap: 14,
                      background: "rgba(255,255,255,0.035)",
                    }}
                  >
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.04)",
                        overflow: "hidden",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={getProductName(product)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.8rem" }}>🎛️</span>
                      )}
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0 }}>{getProductName(product)}</h3>
                          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                            SKU: {product?.sku || "—"}
                            {variant ? ` · ${variant.variant_name || variant.name_en}` : ""}
                          </p>
                        </div>

                        <strong>
                          {formatMoney(lineTotal, item.currency_code || currency)}
                        </strong>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <form
                          action="/api/marketplace/cart/update"
                          method="post"
                          style={{ display: "flex", gap: 8, alignItems: "center" }}
                        >
                          <span style={{ color: "var(--muted)" }}>
                            <T en="Qty" ar="الكمية" />
                          </span>

                          <input
                            className="input"
                            name="quantity"
                            type="number"
                            min="1"
                            max={Math.max(maxQuantity, 1)}
                            defaultValue={item.quantity}
                            style={{ width: 90 }}
                          />

                          <input type="hidden" name="itemId" value={item.id} />

                          <button
                            type="button"
                            className="btn btn-small"
                            data-cart-update
                            data-item-id={item.id}
                          >
                            <T en="Update" ar="تحديث" />
                          </button>
                        </form>

                        <form>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            data-cart-remove
                            data-item-id={item.id}
                          >
                            <T en="Remove" ar="حذف" />
                          </button>
                        </form>
                      </div>

                      <p style={{ color: "var(--muted)", margin: 0 }}>
                        <T en="Unit price" ar="سعر الوحدة" />:{" "}
                        {formatMoney(item.unit_price, item.currency_code || currency)} ·{" "}
                        <T en="Available" ar="المتوفر" />: {maxQuantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside
          className="card"
          style={{
            position: "sticky",
            top: 20,
            display: "grid",
            gap: 16,
          }}
        >
          <h2>
            <T en="Order summary" ar="ملخص الطلب" />
          </h2>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Items" ar="العناصر" />
              </span>
              <strong>{itemCount}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Subtotal" ar="الإجمالي" />
              </span>
              <strong>{formatMoney(subtotal, currency)}</strong>
            </div>
          </div>

          <Link
            href={items.length > 0 ? "/marketplace/checkout" : "/marketplace"}
            className={items.length > 0 ? "btn btn-primary btn-large" : "btn btn-large"}
          >
            {items.length > 0 ? (
              <T en="Proceed to checkout" ar="إتمام الطلب" />
            ) : (
              <T en="Browse products" ar="تصفح المنتجات" />
            )}
          </Link>

          <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
            <T
              en="Checkout will be connected in the next patch."
              ar="سيتم ربط الدفع في الباتش التالي."
            />
          </p>
        </aside>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("click", async function(event) {
              const updateButton = event.target.closest("[data-cart-update]");
              const removeButton = event.target.closest("[data-cart-remove]");

              if (updateButton) {
                const form = updateButton.closest("form");
                const itemId = updateButton.getAttribute("data-item-id");
                const quantity = form.querySelector("input[name='quantity']").value;

                const response = await fetch("/api/marketplace/cart/update", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ itemId, quantity })
                });

                if (response.ok) {
                  window.location.reload();
                } else {
                  const data = await response.json().catch(() => null);
                  alert(data && data.error ? data.error : "Could not update cart.");
                }
              }

              if (removeButton) {
                const itemId = removeButton.getAttribute("data-item-id");

                const response = await fetch("/api/marketplace/cart/remove", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ itemId })
                });

                if (response.ok) {
                  window.location.reload();
                } else {
                  const data = await response.json().catch(() => null);
                  alert(data && data.error ? data.error : "Could not remove item.");
                }
              }
            });
          `,
        }}
      />
    </main>
  );
}
