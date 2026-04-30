import { createClient } from "../../../../lib/supabase/server";
import T from "../../../../components/t";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("marketplace_products")
    .select(`
      *,
      vendor:vendor_profiles(business_name_en, business_name_ar, logo_url, slug),
      brand:marketplace_brands(name_en, name_ar, logo_url),
      category:marketplace_categories(name_en, name_ar, slug),
      images:marketplace_product_images(image_url, sort_order),
      variants:marketplace_product_variants(*)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0]?.image_url || null;
  const otherImages = product.images?.slice(1) || [];

  return (
    <div className="product-details-page section-padding">
      <nav className="breadcrumb">
        <Link href="/gear"><T en="Marketplace" ar="السوق" /></Link>
        <span>/</span>
        <Link href={`/gear/categories/${product.category?.slug}`}>
          <T en={product.category?.name_en} ar={product.category?.name_ar} />
        </Link>
        <span>/</span>
        <span className="current">{product.name_en}</span>
      </nav>

      <div className="grid grid-2" style={{ gap: 60, marginTop: 30 }}>
        {/* LEFT: IMAGES */}
        <div className="product-gallery">
          <div className="main-image-box card">
            {mainImage ? (
              <img src={mainImage} alt={product.name_en} />
            ) : (
              <div className="placeholder">No Image</div>
            )}
          </div>
          {otherImages.length > 0 && (
            <div className="image-thumbnails" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginTop: 20 }}>
              {otherImages.map((img: any, i: number) => (
                <div key={i} className="card thumb-box">
                  <img src={img.image_url} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: INFO */}
        <div className="product-info">
          <div className="brand-badge">
            <T en={product.brand?.name_en} ar={product.brand?.name_ar} />
          </div>
          <h1 className="product-title">{product.name_en}</h1>
          <p className="product-subtitle">{product.name_ar}</p>

          <div className="price-tag" style={{ margin: '30px 0' }}>
            <span className="currency">SAR</span>
            <span className="amount">{product.base_price}</span>
            <span className="tax-info"><T en="Incl. VAT" ar="شامل الضريبة" /></span>
          </div>

          <div className="product-actions" style={{ display: 'grid', gap: 15 }}>
            <AddToCartButton product={product} />
            <button className="btn btn-secondary btn-large">
              <T en="Buy Now" ar="شراء الآن" />
            </button>
          </div>

          <div className="vendor-mini-card card" style={{ marginTop: 40, display: 'flex', gap: 15, alignItems: 'center' }}>
            <div className="vendor-logo" style={{ width: 50, height: 50, borderRadius: 10, background: 'white', overflow: 'hidden' }}>
               <img src={product.vendor?.logo_url || "https://ui-avatars.com/api/?name=" + product.vendor?.business_name_en} alt="" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}><T en="Sold by" ar="يباع بواسطة" /></label>
              <div style={{ fontWeight: 600 }}>
                <T en={product.vendor?.business_name_en} ar={product.vendor?.business_name_ar} />
              </div>
            </div>
            <Link href={`/vendor-store/${product.vendor?.slug}`} className="text-link" style={{ marginRight: 'auto' }}>
              <T en="Visit Store" ar="زيارة المتجر" />
            </Link>
          </div>

          <div className="product-description" style={{ marginTop: 40 }}>
            <div className="card-head">
              <h3><T en="Description" ar="الوصف" /></h3>
            </div>
            <div className="desc-content" style={{ marginTop: 15, lineHeight: 1.8, color: 'var(--muted)' }}>
              <p>{product.description_en}</p>
              <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
              <p style={{ textAlign: 'right' }}>{product.description_ar}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
