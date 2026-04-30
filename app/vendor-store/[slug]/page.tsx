import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";
import ProductCard from "../../../components/product-card";
import { notFound } from "next/navigation";

export default async function VendorStorePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Vendor Profile
  const { data: vendor } = await supabase
    .from("vendor_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor) notFound();

  // 2. Fetch Vendor's Products
  const { data: products } = await supabase
    .from("marketplace_products")
    .select(`
      id, name_en, name_ar, slug, base_price,
      brand:marketplace_brands(name_en),
      category:marketplace_categories(name_en, name_ar, slug),
      images:marketplace_product_images(image_url)
    `)
    .eq("vendor_id", vendor.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div className="vendor-store-page">
      {/* VENDOR HEADER */}
      <header className="vendor-store-header section-padding" style={{ background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop) center/cover' }}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          <div className="vendor-avatar" style={{ width: 120, height: 120, borderRadius: 20, background: 'white', padding: 15 }}>
            <img src={vendor.logo_url || `https://ui-avatars.com/api/?name=${vendor.business_name_en}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>
              <T en={vendor.business_name_en} ar={vendor.business_name_ar} />
            </h1>
            <div style={{ display: 'flex', gap: 15, marginTop: 10, color: 'var(--gb-gold)' }}>
              <span>⭐ 4.9 (<T en="120+ Reviews" ar="١٢٠+ مراجعة" />)</span>
              <span>📍 <T en="Riyadh, Saudi Arabia" ar="الرياض، المملكة العربية السعودية" /></span>
            </div>
          </div>
        </div>
      </header>

      <div className="section-padding">
        <div className="section-head">
          <h2><T en="Product Catalog" ar="كتالوج المنتجات" /></h2>
          <p><T en={`Browse all gear from ${vendor.business_name_en}`} ar={`تصفح كافة المعدات من ${vendor.business_name_ar}`} /></p>
        </div>

        <div className="grid grid-4" style={{ marginTop: 40 }}>
          {products?.map(p => (
            <ProductCard key={p.id} product={p as any} />
          ))}
          {(!products || products.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
              <T en="No products available yet." ar="لا توجد منتجات متاحة بعد." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
