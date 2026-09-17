import Image from "next/image";
import Link from "next/link";

type MarketplaceProductCardProps = {
  product: any;
  lang: "en" | "ar";
  priority?: boolean;
};

export default function MarketplaceProductCard({ product, lang, priority = false }: MarketplaceProductCardProps) {
  const getProductName = (p: any) => p?.name_en || p?.name_ar || p?.name || p?.sku || "Product";
  const getProductDescription = (p: any) => p?.description_en || p?.description_ar || "";
  const getProductImage = (p: any) => {
    const images = p?.images;
    if (Array.isArray(images) && images.length > 0) return String(images[0] || "");
    if (typeof images === "string" && images) return images;
    return "";
  };
  const getCategoryName = (category: any) => {
    const row = Array.isArray(category) ? category[0] : category;
    return row ? (lang === "en" ? row.name_en : row.name_ar) || row.slug || "—" : "—";
  };
  const getBrandName = (brand: any) => {
    const row = Array.isArray(brand) ? brand[0] : brand;
    return row ? (lang === "en" ? row.name_en : row.name_ar) || row.slug || "—" : "—";
  };
  const getVendorName = (vendor: any) => {
    const row = Array.isArray(vendor) ? vendor[0] : vendor;
    if (!row) return lang === "en" ? "GearBeat Vendor" : "تاجر GearBeat";
    return (lang === "en" ? row.business_name_en : row.business_name_ar) || row.store_name || (lang === "en" ? "GearBeat Vendor" : "تاجر GearBeat");
  };
  const getProductUrl = (p: any) => `/marketplace/products/${p.slug || p.id}`;
  
  const formatMoney = (value: unknown, currency = "SAR") => {
    const numberValue = Number(value || 0);
    if (!Number.isFinite(numberValue)) return `0.00 ${currency}`;
    const displayCurrency = currency === "SAR" ? (lang === "en" ? "SAR" : "ر.س") : currency;
    return `${numberValue.toFixed(2)} ${displayCurrency}`;
  };

  const image = getProductImage(product);
  const price = product.sale_price || product.base_price;
  const hasSalePrice =
    product.sale_price &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.base_price || 0);

  return (
    <article
      className="card marketplace-card"
      style={{
        overflow: "hidden",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
      }}
    >
      <Link
        href={getProductUrl(product)}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            height: 190,
            aspectRatio: "16 / 9",
            background: "radial-gradient(circle at center, rgba(207,167,98,0.18), rgba(255,255,255,0.035))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {image ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src={image}
                alt={getProductName(product)}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
              />
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                zIndex: 2
              }}>
                <div style={{
                  background: 'rgba(212, 175, 55, 0.95)',
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                }}>
                  {lang === "en" ? "CERTIFIED VENDOR" : "تاجر معتمد"}
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: 'var(--gb-gold)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  border: '1px solid var(--gb-gold)',
                  backdropFilter: 'blur(4px)',
                  textAlign: 'center'
                }}>
                  {lang === "en" ? "PILOT READY" : "جاهز للتجربة"}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 22,
                display: "grid",
                placeItems: "center",
                background: "rgba(207,167,98,0.16)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gb-gold)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <circle cx="7.5" cy="7.5" r="1.5"></circle>
                <circle cx="16.5" cy="7.5" r="1.5"></circle>
                <circle cx="7.5" cy="16.5" r="1.5"></circle>
                <circle cx="16.5" cy="16.5" r="1.5"></circle>
              </svg>
            </div>
          )}
        </div>

        <div style={{ padding: 16, display: "grid", gap: 10, flex: 1, flexDirection: 'column' }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              {getCategoryName(product.category)}
            </span>
            <span className="badge">
              {getBrandName(product.brand)}
            </span>
          </div>

          <h3 style={{ margin: 0, lineHeight: 1.35, fontSize: '1rem' }}>
            {getProductName(product)}
          </h3>

          {getProductDescription(product) ? (
            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.6,
                margin: 0,
                fontSize: '0.85rem',
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {getProductDescription(product)}
            </p>
          ) : null}

          <div>
            <strong style={{ fontSize: "1.15rem" }}>
              {formatMoney(price, product.currency_code || "SAR")}
            </strong>

            {hasSalePrice ? (
              <span
                style={{
                  marginInlineStart: 8,
                  color: "var(--muted)",
                  textDecoration: "line-through",
                  fontSize: "0.9rem",
                }}
              >
                {formatMoney(
                  product.base_price,
                  product.currency_code || "SAR"
                )}
              </span>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              marginTop: 'auto',
              paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ display: 'grid' }}>
              <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 600 }}>
                {getVendorName(product.vendor)}
              </span>
              {Number(product.stock_quantity || 0) > 0 ? (
                <span style={{ color: "var(--gb-success)", fontSize: "0.65rem", fontWeight: 700 }}>
                  {lang === "en" ? "In Stock" : "متوفر"}
                </span>
              ) : (
                <span style={{ color: "var(--gb-danger)", fontSize: "0.65rem", fontWeight: 700 }}>
                  {lang === "en" ? "Out of Stock" : "غير متوفر"}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <span title={lang === "en" ? "Authentic Gear" : "معدات أصلية"}>🛡️</span>
              <span title={lang === "en" ? "Studio Tested" : "تم اختبارها في الاستوديو"}>🎙️</span>
              <span title={lang === "en" ? "Secure Payment" : "دفع آمن"}>💳</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
