import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import T from "@/components/t";
import { createAdminClient } from "@/lib/supabase/admin";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

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

function getProductDescription(product: any) {
  return product?.description_en || product?.description_ar || "";
}

function getImages(product: any) {
  const images = product?.images;

  if (Array.isArray(images)) {
    return images.map((image) => String(image || "").trim()).filter(Boolean);
  }

  if (typeof images === "string" && images.trim()) {
    return [images.trim()];
  }

  return [];
}

function getCategoryName(category: any) {
  const row = Array.isArray(category) ? category[0] : category;

  if (!row) {
    return "—";
  }

  return row.name_en || row.name_ar || row.slug || "—";
}

function getBrandName(brand: any) {
  const row = Array.isArray(brand) ? brand[0] : brand;

  if (!row) {
    return "—";
  }

  return row.name_en || row.name_ar || row.slug || "—";
}

function getVendorName(vendor: any) {
  if (!vendor) {
    return "GearBeat Vendor";
  }

  return (
    vendor.business_name_en ||
    vendor.business_name_ar ||
    vendor.store_name ||
    "GearBeat Vendor"
  );
}

function getSpecifications(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== "admin_review")
    .map(([key, itemValue]) => ({
      key,
      value: String(itemValue || ""),
    }))
    .filter((item) => item.key && item.value);
}

function getProductUrl(product: any) {
  return `/marketplace/products/${product.slug || product.id}`;
}

async function getProductBySlugOrId(slug: string) {
  const supabaseAdmin = createAdminClient();

  const baseSelect = `
    id,
    vendor_id,
    category_id,
    brand_id,
    sku,
    slug,
    name_en,
    name_ar,
    description_en,
    description_ar,
    base_price,
    sale_price,
    stock_quantity,
    currency_code,
    status,
    is_active,
    images,
    specifications,
    created_at,
    updated_at,
    category:marketplace_categories(
      id,
      slug,
      name_en,
      name_ar
    ),
    brand:marketplace_brands(
      id,
      slug,
      name_en,
      name_ar
    )
  `;

  const bySlug = await supabaseAdmin
    .from("marketplace_products")
    .select(baseSelect)
    .eq("slug", slug)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .maybeSingle();

  if (bySlug.error) {
    throw new Error(bySlug.error.message);
  }

  if (bySlug.data) {
    return bySlug.data;
  }

  if (!isUuid(slug)) {
    return null;
  }

  const byId = await supabaseAdmin
    .from("marketplace_products")
    .select(baseSelect)
    .eq("id", slug)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .maybeSingle();

  if (byId.error) {
    throw new Error(byId.error.message);
  }

  return byId.data;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabaseAdmin = createAdminClient();

  const product = await getProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  const images = getImages(product);
  const mainImage = images[0] || "";
  const specifications = getSpecifications(product.specifications);
  const price = product.sale_price || product.base_price;
  const hasSalePrice =
    product.sale_price &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.base_price || 0);

  const vendorResult = product.vendor_id
    ? await supabaseAdmin
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
        .or(`id.eq.${product.vendor_id},auth_user_id.eq.${product.vendor_id}`)
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  if (vendorResult.error) {
    console.warn("Product vendor lookup failed:", vendorResult.error.message);
  }

  const vendor = vendorResult.data;

  const relatedResult = await supabaseAdmin
    .from("marketplace_products")
    .select(`
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
      category_id,
      brand_id
    `)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (relatedResult.error) {
    console.warn("Related products lookup failed:", relatedResult.error.message);
  }

  const relatedProducts = relatedResult.data || [];

  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <Link href="/marketplace" className="btn">
          <T en="Back to marketplace" ar="الرجوع للمتجر" />
        </Link>
      </section>

      <section
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 460px)",
          gap: 26,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              minHeight: 460,
              display: "grid",
              placeItems: "center",
              position: "relative",
              background:
                "radial-gradient(circle at center, rgba(207,167,98,0.18), rgba(255,255,255,0.035))",
            }}
          >
            {mainImage ? (
              <Image
                src={mainImage}
                alt={getProductName(product)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                style={{
                  objectFit: "cover",
                }}
                priority
                loading="eager"
                decoding="sync"
              />
            ) : (
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 30,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(207,167,98,0.16)",
                  fontSize: "3rem",
                }}
              >
                🎛️
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 12,
              }}
            >
              {images.slice(0, 8).map((image) => (
                <div
                  key={image}
                  className="card"
                  style={{
                    padding: 0,
                    height: 100,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="100px"
                    style={{
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside
          className="card"
          style={{
            position: "sticky",
            top: 20,
            display: "grid",
            gap: 18,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              {getCategoryName(product.category)}
            </span>
            <span className="badge">
              {getBrandName(product.brand)}
            </span>
            <span className="badge badge-gold">GearBeat Verified</span>
          </div>

          <div>
            <h1 style={{ margin: 0, lineHeight: 1.2 }}>
              {getProductName(product)}
            </h1>

            {/* Pilot Ready Banner */}
            <div style={{ marginTop: 12, background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.85rem' }}>
              <strong style={{ color: '#D4AF37' }}>
                <T en="Pilot Listing – Purchases are for demo purposes only." ar="قائمة تجريبية – المشتريات لأغراض العرض فقط." />
              </strong>
            </div>

            <p style={{ color: "var(--muted)", marginTop: 10 }}>
              SKU: {product.sku || "—"}
            </p>
          </div>

          <div>
            <strong style={{ fontSize: "1.8rem" }}>
              {formatMoney(price, product.currency_code || "SAR")}
            </strong>

            {hasSalePrice ? (
              <span
                style={{
                  marginInlineStart: 10,
                  color: "var(--muted)",
                  textDecoration: "line-through",
                }}
              >
                {formatMoney(product.base_price, product.currency_code || "SAR")}
              </span>
            ) : null}
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background:
                Number(product.stock_quantity || 0) > 0
                  ? "rgba(0,255,136,0.08)"
                  : "rgba(255,77,77,0.08)",
              border:
                Number(product.stock_quantity || 0) > 0
                  ? "1px solid rgba(0,255,136,0.18)"
                  : "1px solid rgba(255,77,77,0.18)",
            }}
          >
            {Number(product.stock_quantity || 0) > 0 ? (
              <strong style={{ color: "#baffd7" }}>
                <T en="In stock" ar="متوفر" /> · {product.stock_quantity}
              </strong>
            ) : (
              <strong style={{ color: "#ffb0b0" }}>
                <T en="Out of stock" ar="غير متوفر" />
              </strong>
            )}
          </div>

          <div
            className="card"
            style={{
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.15)",
            }}
          >
            <div className="flex-between" style={{ alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: '0.8rem', letterSpacing: 1, color: 'var(--gb-gold)' }}>
                <T en="CERTIFIED VENDOR" ar="تاجر معتمد" />
              </strong>
              <span style={{ fontSize: '1.2rem' }}>💎</span>
            </div>

            <h3 style={{ marginTop: 8, marginBottom: 6, fontSize: '1.4rem' }}>
              {getVendorName(vendor)}
            </h3>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                <T en="Identity Verified" ar="الهوية موثقة" />
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                <T en="GearBeat Partner" ar="شريك جيربيت" />
              </span>
            </div>

            <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0, fontSize: '0.85rem' }}>
              <T
                en="This vendor has been vetted by GearBeat and meets all professional standards for pro-audio equipment sales."
                ar="هذا التاجر معتمد من GearBeat ويلبي جميع المعايير المهنية لبيع المعدات الصوتية الاحترافية."
              />
            </p>
          </div>

          <AddToCartButton
            productId={product.id}
            maxQuantity={Number(product.stock_quantity || 0)}
            disabled={Number(product.stock_quantity || 0) <= 0}
          />

          <p style={{ fontSize: '0.75rem', color: 'var(--gb-gold)', textAlign: 'center', margin: 0 }}>
            <T 
              en="Pilot Phase: Add to cart to preview the checkout flow. No real payments. Payment status is verified by GearBeat backend only." 
              ar="المرحلة التجريبية: أضف للسلة لمعاينة عملية الدفع. لا توجد مدفوعات حقيقية. يتم التحقق من حالة الدفع من قبل أنظمة جيربيت الخلفية فقط." 
            />
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              onClick={undefined}
              disabled
            >
              <T en="Save favorite — soon" ar="حفظ بالمفضلة — قريبًا" />
            </button>

            <Link
              href={`/marketplace?brand=${product.brand_id || ""}`}
              className="btn"
            >
              <T en="More from brand" ar="المزيد من العلامة" />
            </Link>
          </div>
        </aside>
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
        <div className="card">
          <h2>
            <T en="Product details" ar="تفاصيل المنتج" />
          </h2>

          {getProductDescription(product) ? (
            <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              {getProductDescription(product)}
            </p>
          ) : (
            <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              <T
                en="No detailed description has been added yet."
                ar="لم يتم إضافة وصف تفصيلي بعد."
              />
            </p>
          )}

          {specifications.length > 0 ? (
            <div style={{ marginTop: 22 }}>
              <h3>
                <T en="Specifications" ar="المواصفات" />
              </h3>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {specifications.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 14,
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.035)",
                    }}
                  >
                    <strong>{item.key}</strong>
                    <span style={{ color: "var(--muted)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="card" style={{ background: 'rgba(212, 175, 55, 0.02)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 20 }}>
            <T en="Buyer Protection" ar="حماية المشتري" />
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { icon: '🛡️', en: 'Authentic Gear', ar: 'معدات أصلية' },
              { icon: '🎚️', en: 'Pro Audio Grade', ar: 'جودة صوت احترافية' },
              { icon: '🤝', en: 'Trusted Seller', ar: 'بائع موثوق' },
              { icon: '📦', en: 'Insured Delivery', ar: 'توصيل مؤمن' },
              { icon: '💳', en: 'Pilot Verification', ar: 'تحقق تجريبي' },
              { icon: '🎙️', en: 'Studio Tested', ar: 'مختبر في الاستوديو' },
            ].map(item => (
              <div key={item.en} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  <T en={item.en} ar={item.ar} />
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px dashed #333' }}>
            <p style={{ color: "var(--muted)", fontSize: '0.75rem', lineHeight: 1.6, margin: 0 }}>
              <T
                en="All marketplace transactions are protected by GearBeat. Vendors are vetted for professional standards."
                ar="جميع معاملات المتجر محمية من قبل GearBeat. يتم فحص التجار وفقاً للمعايير المهنية."
              />
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link href="/marketplace" className="btn btn-outline w-full" style={{ textAlign: 'center' }}>
              <T en="Continue shopping" ar="متابعة التسوق" />
            </Link>
          </div>
        </aside>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="card" style={{ marginTop: 28 }}>
          <h2>
            <T en="Related products" ar="منتجات مشابهة" />
          </h2>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 14,
            }}
          >
            {relatedProducts.map((item: any) => {
              const itemImages = getImages(item);
              const itemImage = itemImages[0] || "";
              const itemPrice = item.sale_price || item.base_price;

              return (
                <Link
                  key={item.id}
                  href={getProductUrl(item)}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      height: 130,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                    }}
                  >
                    {itemImage ? (
                      <Image
                        src={itemImage}
                        alt={getProductName(item)}
                        fill
                        sizes="(max-width: 480px) 100vw, 210px"
                        style={{
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <span style={{ fontSize: "2rem" }}>🎛️</span>
                    )}
                  </div>

                  <strong>{getProductName(item)}</strong>
                  <span style={{ color: "var(--muted)" }}>
                    {formatMoney(itemPrice, item.currency_code || "SAR")}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
