import Link from "next/link";
import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

function getProductStock(product: any) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const firstVariant = variants[0];

  if (!firstVariant) {
    return 0;
  }

  const inventory = firstVariant.inventory;

  if (Array.isArray(inventory)) {
    return Number(inventory[0]?.quantity || 0);
  }

  return Number(inventory?.quantity || 0);
}

export default async function VendorProductsPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: products, error } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      id,
      name_en,
      name_ar,
      status,
      base_price,
      created_at,
      category:marketplace_categories(name_en, name_ar),
      brand:marketplace_brands(name_en, name_ar),
      variants:marketplace_product_variants(
        id,
        sku,
        inventory:marketplace_inventory(
          quantity
        )
      )
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main 
      className="dashboard-page" 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px' 
      }}
    >
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: '40px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Products" ar="المنتجات" />
          </h1>
          <p style={{ color: "#888", fontSize: '0.9rem', marginTop: '8px' }}>
            <T
              en="View and manage your marketplace listings."
              ar="عرض وإدارة قوائم المنتجات الخاصة بك."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link 
            href="/portal/store/products/new" 
            style={{ 
              background: 'linear-gradient(135deg, #cfa86e, #b8923a)', 
              color: '#000', 
              borderRadius: '10px', 
              padding: '12px 24px', 
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>➕</span>
            <T en="Add Product" ar="إضافة منتج" />
          </Link>
        </div>
      </div>

      <div 
        className="gb-card" 
        style={{ 
          background: '#111', 
          borderRadius: '20px', 
          border: '1px solid #1e1e1e', 
          padding: '24px' 
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #1a1a1a', textAlign: 'start' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Product" ar="المنتج" />
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Category" ar="التصنيف" />
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Stock" ar="المخزون" />
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Price" ar="السعر" />
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Status" ar="الحالة" />
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>
                <T en="Edit" ar="تعديل" />
              </th>
            </tr>
          </thead>

          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 48, color: '#666' }}>
                  <T en="No products yet" ar="لا توجد منتجات بعد" />
                </td>
              </tr>
            ) : (
              products.map((product: any) => {
                const stock = getProductStock(product);

                const statusLabels: any = {
                  active: <T en="Active" ar="نشط" />,
                  draft: <T en="Draft" ar="مسودة" />,
                  out_of_stock: <T en="Out of Stock" ar="نفد المخزون" />,
                  suspended: <T en="Suspended" ar="موقوف" />
                };

                return (
                  <tr 
                    key={product.id} 
                    style={{ borderBottom: '1px solid #111', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{product.name_en}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>
                        {product.name_ar}
                      </div>
                    </td>

                    <td style={{ padding: '16px', color: '#888' }}>{product.category?.name_en || "—"}</td>

                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          color: stock > 0 ? "white" : "#f97316",
                          fontWeight: 600,
                        }}
                      >
                        {stock}
                      </span>
                    </td>

                    <td style={{ padding: '16px', fontWeight: 700 }}>{Number(product.base_price || 0).toFixed(2)} SAR</td>

                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '99px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: product.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: product.status === 'active' ? '#22c55e' : '#6b7280'
                        }}
                      >
                        {statusLabels[product.status] || product.status}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <Link
                        href={`/portal/store/products/${product.id}/edit`}
                        style={{ color: '#cfa86e', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        <T en="Edit" ar="تعديل" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
