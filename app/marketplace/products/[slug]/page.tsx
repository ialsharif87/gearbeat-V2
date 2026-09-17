import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import T from "@/components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatMoney(value: unknown, currency = "SAR") {
  const amount = Number(value || 0);
  return `${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} ${currency}`;
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.sku || "Product";
}

function getProductDescription(product: any) {
  return product?.description_en || product?.description_ar || "";
}

function getImages(product: any) {
  const images = product?.images;
  if (Array.isArray(images)) return images.map((item: unknown) => String(item || "").trim()).filter(Boolean);
  if (typeof images === "string" && images.trim()) return [images.trim()];
  return [];
}

function getRelationName(relation: any) {
  const row = Array.isArray(relation) ? relation[0] : relation;
  return row?.name_en || row?.name_ar || row?.slug || "—";
}

function getSpecifications(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== "admin_review")
    .map(([key, itemValue]) => ({ key, value: String(itemValue || "") }))
    .filter((item) => item.key && item.value);
}

async function getProductBySlugOrId(slug: string) {
  const supabaseAdmin = createAdminClient();
  const baseSelect = `
    id,vendor_id,category_id,brand_id,sku,slug,name_en,name_ar,
    description_en,description_ar,base_price,sale_price,currency_code,
    status,is_active,images,specifications,created_at,
    category:marketplace_categories(id,slug,name_en,name_ar),
    brand:marketplace_brands(id,slug,name_en,name_ar)
  `;

  const bySlug = await supabaseAdmin
    .from("marketplace_products")
    .select(baseSelect)
    .eq("slug", slug)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .maybeSingle();

  if (bySlug.error) throw new Error(bySlug.error.message);
  if (bySlug.data) return bySlug.data;
  if (!isUuid(slug)) return null;

  const byId = await supabaseAdmin
    .from("marketplace_products")
    .select(baseSelect)
    .eq("id", slug)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .maybeSingle();

  if (byId.error) throw new Error(byId.error.message);
  return byId.data;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabaseAdmin = createAdminClient();
  const product = await getProductBySlugOrId(slug);
  if (!product) notFound();

  const images = getImages(product);
  const mainImage = images[0] || "";
  const specifications = getSpecifications(product.specifications);
  const price = product.sale_price || product.base_price;
  const hasSalePrice = Boolean(
    product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.base_price || 0)
  );

  const vendorResult = product.vendor_id
    ? await supabaseAdmin
        .from("vendor_profiles")
        .select("id,business_name_en,business_name_ar,store_name")
        .or(`id.eq.${product.vendor_id},auth_user_id.eq.${product.vendor_id}`)
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  if (vendorResult.error) console.warn("Product vendor lookup failed:", vendorResult.error.message);
  const vendor = vendorResult.data;
  const vendorName = vendor?.business_name_en || vendor?.business_name_ar || vendor?.store_name || "Catalog partner";

  return (
    <main className="dashboard-page" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <Link href="/marketplace" className="btn btn-outline">
          <T en="Back to catalog" ar="العودة إلى الكتالوج" />
        </Link>
      </section>

      <section className="product-detail-grid">
        <div className="product-media-stack">
          <div className="card product-main-media">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={getProductName(product)}
                fill
                sizes="(max-width: 900px) 100vw, 58vw"
                style={{ objectFit: "cover" }}
                priority
              />
            ) : (
              <div className="product-placeholder">🎛️</div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="product-thumbnails">
              {images.slice(1, 7).map((image) => (
                <div className="card product-thumb" key={image}>
                  <Image src={image} alt="" fill sizes="120px" style={{ objectFit: "cover" }} loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="card product-summary">
          <div className="product-tags">
            <span className="badge">{getRelationName(product.category)}</span>
            <span className="badge">{getRelationName(product.brand)}</span>
            <span className="badge badge-gold"><T en="Catalog item" ar="منتج كتالوج" /></span>
          </div>

          <div>
            <h1>{getProductName(product)}</h1>
            <p className="product-sku">SKU: {product.sku || "—"}</p>
          </div>

          <div className="product-price-row">
            <strong>{formatMoney(price, product.currency_code || "SAR")}</strong>
            {hasSalePrice ? (
              <span className="product-old-price">{formatMoney(product.base_price, product.currency_code || "SAR")}</span>
            ) : null}
          </div>

          <div className="catalog-only-box">
            <strong><T en="Reference catalog only" ar="للمرجعية فقط" /></strong>
            <span>
              <T
                en="Online checkout, shipping, returns, and warranty handling are not enabled in the MVP."
                ar="الدفع الإلكتروني والشحن والإرجاع ومعالجة الضمان غير مفعلة في النسخة الأولية."
              />
            </span>
          </div>

          <div className="catalog-partner-box">
            <span className="product-sku"><T en="Listed by" ar="مُدرج بواسطة" /></span>
            <strong>{vendorName}</strong>
            <p>
              <T
                en="Vendor details are shown for catalog context only and do not imply a certification or transaction guarantee."
                ar="تظهر بيانات المورد لسياق الكتالوج فقط ولا تعني اعتمادًا أو ضمانًا للمعاملة."
              />
            </p>
          </div>
          <div className="product-actions">
            <Link href="/support" className="btn btn-primary">
              <T en="Ask about this product" ar="استفسر عن هذا المنتج" />
            </Link>
            <Link href="/marketplace" className="btn btn-outline">
              <T en="Browse more gear" ar="تصفح معدات أخرى" />
            </Link>
          </div>
        </aside>
      </section>

      <section className="product-detail-lower">
        <div className="card">
          <h2><T en="Product details" ar="تفاصيل المنتج" /></h2>
          {getProductDescription(product) ? (
            <p className="product-copy">{getProductDescription(product)}</p>
          ) : (
            <p className="product-copy"><T en="No detailed description has been added yet." ar="لم يتم إضافة وصف تفصيلي بعد." /></p>
          )}

          {specifications.length > 0 ? (
            <div className="spec-list">
              {specifications.map((item) => (
                <div key={item.key} className="spec-row">
                  <strong>{item.key}</strong>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="card mvp-commerce-status">
          <h2><T en="MVP commerce status" ar="حالة التجارة في النسخة الأولية" /></h2>
          <ul>
            <li><T en="Catalog browsing is available." ar="تصفح الكتالوج متاح." /></li>
            <li><T en="Product enquiries are available through support." ar="الاستفسار عن المنتجات متاح عبر الدعم." /></li>
            <li><T en="Online checkout is not enabled." ar="الدفع الإلكتروني غير مفعل." /></li>
            <li><T en="Shipping, returns, and warranty handling are not enabled." ar="الشحن والإرجاع ومعالجة الضمان غير مفعلة." /></li>
          </ul>
        </aside>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .product-detail-grid { margin-top: 24px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 430px); gap: 24px; align-items: start; }
        .product-media-stack { display: grid; gap: 12px; }
        .product-main-media { padding: 0; overflow: hidden; min-height: 480px; position: relative; background: radial-gradient(circle at center, rgba(212,175,55,.14), rgba(255,255,255,.025)); }
        .product-placeholder { font-size: 4rem; min-height: 480px; display: grid; place-items: center; }
        .product-thumbnails { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
        .product-thumb { padding: 0; height: 100px; overflow: hidden; position: relative; }
        .product-summary { position: sticky; top: 90px; display: grid; gap: 18px; }
        .product-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .product-summary h1 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.8rem); }
        .product-sku { color: var(--gb-text-muted); margin: 6px 0 0; font-size: .85rem; }
        .product-price-row { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
        .product-price-row strong { font-size: 1.8rem; color: var(--gb-gold-light); }
        .product-old-price { color: var(--gb-text-muted); text-decoration: line-through; }
        .catalog-only-box, .catalog-partner-box { display: grid; gap: 6px; padding: 14px; border-radius: 14px; border: 1px solid rgba(212,175,55,.18); background: rgba(212,175,55,.05); }
        .catalog-only-box span, .catalog-partner-box p { color: var(--gb-text-muted); line-height: 1.65; margin: 0; font-size: .88rem; }
        .product-actions { display: grid; gap: 10px; }
        .product-detail-lower { margin-top: 24px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 360px); gap: 20px; align-items: start; }
        .product-copy { color: var(--gb-text-muted); line-height: 1.85; margin-top: 14px; }
        .spec-list { margin-top: 20px; display: grid; gap: 8px; }
        .spec-row { display: flex; justify-content: space-between; gap: 16px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,.035); }
        .spec-row span { color: var(--gb-text-muted); text-align: end; }
        .mvp-commerce-status ul { margin: 16px 0 0; padding-inline-start: 20px; color: var(--gb-text-muted); line-height: 1.9; }
        @media (max-width: 900px) {
          .product-detail-grid, .product-detail-lower { grid-template-columns: 1fr; }
          .product-summary { position: static; }
        }
        @media (max-width: 600px) {
          .product-main-media, .product-placeholder { min-height: 330px; }
          .product-actions .btn { width: 100%; }
          .spec-row { flex-direction: column; gap: 4px; }
          .spec-row span { text-align: start; }
        }
      `}} />
    </main>
  );
}
