import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: products } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      *,
      profiles!marketplace_products_vendor_auth_user_id_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Marketplace Products" ar="منتجات المتجر" />
      </h1>

      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Product" ar="المنتج" /></th>
              <th style={thStyle}><T en="Seller" ar="التاجر" /></th>
              <th style={thStyle}><T en="Price" ar="السعر" /></th>
              <th style={thStyle}><T en="Stock" ar="المخزون" /></th>
              <th style={thStyle}><T en="Created" ar="تاريخ الإضافة" /></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.profiles?.full_name || "Unknown"}</td>
                <td style={tdStyle}>{p.price} SAR</td>
                <td style={tdStyle}>{p.stock_quantity}</td>
                <td style={tdStyle}>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <T en="No products found." ar="لا توجد منتجات." />
          </div>
        )}
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };
