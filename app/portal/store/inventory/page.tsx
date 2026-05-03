import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";
import Link from "next/link";

export default async function VendorInventoryPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: products } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      id,
      name_en,
      name_ar,
      variants:marketplace_product_variants(
        id,
        sku,
        inventory:marketplace_inventory(
          quantity
        )
      )
    `)
    .eq("vendor_id", user.id);

  return (
    <main 
      className="dashboard-page" 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px' 
      }}
    >
      <section style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
          <T en="Inventory" ar="المخزون" />
        </h1>
        <p style={{ color: "#888", fontSize: '0.9rem', marginTop: '8px' }}>
          <T
            en="Track product stock levels and inventory updates."
            ar="تابع كميات المنتجات وتحديثات المخزون."
          />
        </p>
      </section>

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
              <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Product" ar="المنتج" /></th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Stock" ar="الكمية" /></th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Status" ar="الحالة" /></th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Update" ar="تحديث" /></th>
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 48, color: '#666' }}>
                  <T en="No products found" ar="لا توجد منتجات" />
                </td>
              </tr>
            ) : (
              products.map((product: any) => {
                const stock = product.variants?.[0]?.inventory?.[0]?.quantity || 0;
                let status = <T en="In Stock" ar="متوفر" />;
                let statusColor = "#22c55e";
                
                if (stock === 0) {
                  status = <T en="Out of Stock" ar="نفد المخزون" />;
                  statusColor = "#ef4444";
                } else if (stock < 5) {
                  status = <T en="Low Stock" ar="مخزون منخفض" />;
                  statusColor = "#f97316";
                }

                return (
                  <tr 
                    key={product.id} 
                    style={{ borderBottom: '1px solid #111', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{product.name_en}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>{product.name_ar}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{stock}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: statusColor, fontSize: '0.85rem', fontWeight: 600 }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link 
                        href={`/portal/store/products/${product.id}/edit`}
                        style={{ color: '#cfa86e', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        <T en="Update" ar="تحديث" />
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
