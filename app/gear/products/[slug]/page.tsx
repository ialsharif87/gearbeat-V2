import { createClient } from "../../../../lib/supabase/server";
import T from "../../../../components/t";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "../../../../components/add-to-cart-button";
import AddReviewForm from "../../../../components/add-review-form";
import ProductGallery from "../../../../components/product-gallery";

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
        <ProductGallery images={product.images || []} productName={product.name_en} />

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

      {/* REVIEWS SECTION */}
      <div className="product-reviews-section section-padding" style={{ marginTop: 60, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-head">
          <h2><T en="Customer Reviews" ar="مراجعات العملاء" /></h2>
        </div>
        
        <div className="grid grid-checkout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 60, marginTop: 40 }}>
           <div className="rating-sidebar">
              <div className="rating-summary card">
                 <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--gb-gold)' }}>4.8</div>
                 <div style={{ display: 'flex', gap: 5, fontSize: '1.5rem', marginBottom: 10 }}>⭐⭐⭐⭐⭐</div>
                 <p style={{ color: 'var(--muted)' }}><T en="Based on 12 reviews" ar="بناءً على 12 مراجعة" /></p>
              </div>
              <AddReviewForm productId={product.id} />
           </div>
           
           <div className="reviews-list" style={{ display: 'grid', gap: 30 }}>
              <div className="card review-card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <strong>Ahmed A.</strong>
                    <span style={{ color: 'var(--gb-gold)' }}>⭐⭐⭐⭐⭐</span>
                 </div>
                 <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                    <T 
                      en="Incredible audio interface! The preamps are super clean and the build quality is top-notch. Highly recommended for home studios." 
                      ar="واجهة صوتية مذهلة! المكبرات الصوتية نقية جداً وجودة التصنيع ممتازة. أنصح بها بشدة للاستوديوهات المنزلية." 
                    />
                 </p>
                 <div style={{ marginTop: 15, fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>April 28, 2026</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
