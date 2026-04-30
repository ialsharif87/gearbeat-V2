import { requireVendorLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export default async function VendorProductsPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: products } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      id, 
      name_en, 
      name_ar, 
      status, 
      base_price, 
      category:marketplace_categories(name_en, name_ar),
      brand:marketplace_brands(name_en, name_ar),
      inventory:marketplace_inventory(quantity_available)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="badge">
            <T en="Product Management" ar="إدارة المنتجات" />
          </span>
          <h1><T en="My Products" ar="منتجاتي" /></h1>
          <p><T en="View and manage your marketplace listings." ar="عرض وإدارة قوائم المنتجات الخاصة بك." /></p>
        </div>
        <Link href="/vendor/products/new" className="btn btn-primary">
          <T en="+ Add Product" ar="+ إضافة منتج" />
        </Link>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><T en="Product" ar="المنتج" /></th>
              <th><T en="Category" ar="التصنيف" /></th>
              <th><T en="Stock" ar="المخزون" /></th>
              <th><T en="Price" ar="السعر" /></th>
              <th><T en="Status" ar="الحالة" /></th>
              <th><T en="Actions" ar="الإجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <T en="No products found." ar="لا توجد منتجات." />
                </td>
              </tr>
            ) : (
              products.map((p: any) => {
                const stock = p.inventory?.[0]?.quantity_available || 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name_en}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{p.name_ar}</div>
                    </td>
                    <td>{p.category?.name_en || "—"}</td>
                    <td>
                       <span style={{ color: stock > 0 ? 'white' : '#ff4d4d', fontWeight: 600 }}>
                          {stock} <small><T en="Units" ar="وحدة" /></small>
                       </span>
                    </td>
                    <td>{p.base_price} SAR</td>
                    <td>
                      <span className={`badge badge-${p.status === 'approved' ? 'success' : p.status === 'pending_approval' ? 'warning' : 'secondary'}`}>
                        {p.status}
                      </span>
                    </td>
                  <td>
                    <Link href={`/vendor/products/${p.id}/edit`} className="btn btn-small">
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
    </div>
  );
}
