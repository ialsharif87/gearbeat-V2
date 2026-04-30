import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";
import ProductCard from "../../../components/product-card";
import Link from "next/link";

export default async function ProductListingPage({
  searchParams
}: {
  searchParams: Promise<{ 
    q?: string, 
    category?: string, 
    brand?: string, 
    minPrice?: string, 
    maxPrice?: string 
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Filters Data (Categories & Brands)
  const [categoriesRes, brandsRes] = await Promise.all([
    supabase.from("marketplace_categories").select("id, name_en, name_ar, slug").eq("status", "active"),
    supabase.from("marketplace_brands").select("id, name_en, name_ar, slug").eq("status", "active")
  ]);

  // 2. Build Products Query
  let query = supabase
    .from("marketplace_products")
    .select(`
      id, name_en, name_ar, slug, base_price,
      brand:marketplace_brands(name_en),
      category:marketplace_categories(name_en, name_ar, slug),
      images:marketplace_product_images(image_url)
    `)
    .eq("status", "approved");

  // Apply Search Filter
  if (params.q) {
    query = query.or(`name_en.ilike.%${params.q}%,name_ar.ilike.%${params.q}%`);
  }

  // Apply Category Filter
  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  // Apply Brand Filter
  if (params.brand) {
    query = query.eq("brand_id", params.brand);
  }

  // Apply Price Filters
  if (params.minPrice) query = query.gte("base_price", params.minPrice);
  if (params.maxPrice) query = query.lte("base_price", params.maxPrice);

  const { data: products } = await query.order("created_at", { ascending: false });

  return (
    <div className="section-padding">
      <div className="section-head">
        <h1><T en="Browse Gear" ar="تصفح المعدات" /></h1>
        <p><T en="Find the perfect tools for your production." ar="جد الأدوات المثالية لإنتاجك الموسيقي." /></p>
      </div>

      <div className="marketplace-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, marginTop: 40 }}>
        
        {/* SIDEBAR FILTERS */}
        <aside className="filters-sidebar">
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <div className="filter-group">
              <h4><T en="Search" ar="بحث" /></h4>
              <form action="/gear/products" method="GET">
                 <input 
                  type="text" 
                  name="q" 
                  defaultValue={params.q} 
                  placeholder="Microphones, Interfaces..." 
                  className="input input-small" 
                  style={{ width: '100%' }}
                />
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.brand && <input type="hidden" name="brand" value={params.brand} />}
              </form>
            </div>

            <div className="filter-group" style={{ marginTop: 30 }}>
              <h4><T en="Categories" ar="الأقسام" /></h4>
              <div className="filter-options" style={{ display: 'grid', gap: 10, marginTop: 15 }}>
                <Link href="/gear/products" className={`filter-link ${!params.category ? 'active' : ''}`}>
                   <T en="All Categories" ar="كل الأقسام" />
                </Link>
                {categoriesRes.data?.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/gear/products?category=${cat.id}${params.brand ? `&brand=${params.brand}` : ''}`} 
                    className={`filter-link ${params.category === cat.id ? 'active' : ''}`}
                  >
                    <T en={cat.name_en} ar={cat.name_ar} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="filter-group" style={{ marginTop: 30 }}>
              <h4><T en="Brands" ar="العلامات التجارية" /></h4>
              <div className="filter-options" style={{ display: 'grid', gap: 10, marginTop: 15 }}>
                <Link href="/gear/products" className={`filter-link ${!params.brand ? 'active' : ''}`}>
                   <T en="All Brands" ar="كل الماركات" />
                </Link>
                {brandsRes.data?.map(brand => (
                  <Link 
                    key={brand.id} 
                    href={`/gear/products?brand=${brand.id}${params.category ? `&category=${params.category}` : ''}`} 
                    className={`filter-link ${params.brand === brand.id ? 'active' : ''}`}
                  >
                    <T en={brand.name_en} ar={brand.name_ar} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="filter-group" style={{ marginTop: 30 }}>
              <Link href="/gear/products" className="btn btn-secondary btn-small w-full">
                <T en="Clear All" ar="مسح الفلاتر" />
              </Link>
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="products-listing">
          {products && products.length > 0 ? (
            <div className="grid grid-3">
              {products.map(p => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '100px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
              <h3><T en="No gear found" ar="لم يتم العثور على معدات" /></h3>
              <p><T en="Try adjusting your filters or search query." ar="حاول تغيير الفلاتر أو كلمة البحث." /></p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
