import Image from "next/image";
import Link from "next/link";

type MarketplaceProductCardProps = {
  product: any;
  lang: "en" | "ar";
  priority?: boolean;
};

function getRow(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

function getImage(product: any) {
  const images = product?.images;
  if (Array.isArray(images) && images.length > 0) return String(images[0] || "");
  if (typeof images === "string" && images) return images;
  return "";
}

function formatMoney(value: unknown, currency: string, lang: "en" | "ar") {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return lang === "en" ? "Price on request" : "السعر عند الطلب";
  const label = currency === "SAR" ? (lang === "en" ? "SAR" : "ر.س") : currency;
  return `${amount.toFixed(2)} ${label}`;
}
export default function MarketplaceProductCard({
  product,
  lang,
  priority = false,
}: MarketplaceProductCardProps) {
  const category = getRow(product.category);
  const brand = getRow(product.brand);
  const vendor = getRow(product.vendor);
  const image = getImage(product);
  const name = (lang === "en" ? product.name_en : product.name_ar) || product.name_en || product.name_ar || product.sku || "Product";
  const description = (lang === "en" ? product.description_en : product.description_ar) || product.description_en || product.description_ar || "";
  const categoryName = (lang === "en" ? category?.name_en : category?.name_ar) || category?.name_en || category?.name_ar || "";
  const brandName = (lang === "en" ? brand?.name_en : brand?.name_ar) || brand?.name_en || brand?.name_ar || "";
  const vendorName = (lang === "en" ? vendor?.business_name_en : vendor?.business_name_ar) || vendor?.store_name || "";
  const currency = product.currency_code || "SAR";
  const price = Number(product.sale_price || product.base_price || 0);
  const basePrice = Number(product.base_price || 0);
  const hasSalePrice = Number(product.sale_price || 0) > 0 && Number(product.sale_price) < basePrice;

  return (
    <article className="card marketplace-card" style={{ overflow: "hidden", padding: 0, minHeight: "100%" }}>
      <Link
        href={`/marketplace/products/${product.slug || product.id}`}
        style={{ display: "flex", flexDirection: "column", minHeight: "100%", color: "inherit", textDecoration: "none" }}
      >        <div style={{ height: 190, position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.035)" }}>
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
              style={{ objectFit: "cover" }}
              priority={priority}
            />
          ) : (
            <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--gb-gold)", fontSize: "2.2rem" }}>
              🎚️
            </div>
          )}

          <span
            className="badge badge-gold"
            style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "rgba(11,15,22,.92)" }}
          >
            {lang === "en" ? "Catalog" : "كتالوج"}
          </span>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 10, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categoryName ? <span className="badge">{categoryName}</span> : null}
            {brandName ? <span className="badge">{brandName}</span> : null}
          </div>          <h3 style={{ margin: 0, lineHeight: 1.35, fontSize: "1.05rem" }}>{name}</h3>

          {description ? (
            <p
              style={{
                color: "var(--gb-text-muted)",
                lineHeight: 1.6,
                margin: 0,
                fontSize: "0.85rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          ) : null}

          <div>
            <strong style={{ fontSize: "1.15rem" }}>{formatMoney(price, currency, lang)}</strong>
            {hasSalePrice ? (
              <span style={{ marginInlineStart: 8, color: "var(--gb-text-muted)", textDecoration: "line-through", fontSize: "0.85rem" }}>
                {formatMoney(basePrice, currency, lang)}
              </span>
            ) : null}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {vendorName ? (
              <p style={{ margin: 0, color: "var(--gb-text-muted)", fontSize: "0.78rem" }}>{vendorName}</p>
            ) : null}
          </div>
          <span style={{ color: "var(--gb-gold-light)", fontSize: "0.8rem", fontWeight: 800 }}>
            {lang === "en" ? "View product details" : "عرض تفاصيل المنتج"} →
          </span>
        </div>
      </Link>
    </article>
  );
}
