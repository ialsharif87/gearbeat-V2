import { requireAdminLayoutAccess } from "../../../lib/route-guards";
import T from "../../../components/t";
import { revalidatePath } from "next/cache";

export default async function AdminProductsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: products } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      *,
      vendor:vendor_profiles(business_name_en, business_name_ar),
      category:marketplace_categories(name_en, name_ar)
    `)
    .order("created_at", { ascending: false });

  async function updateProductStatus(formData: FormData) {
    "use server";
    const productId = formData.get("product_id") as string;
    const status = formData.get("status") as string;

    const { createAdminClient } = await import("../../../lib/supabase/admin");
    const admin = createAdminClient();

    await admin
      .from("marketplace_products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", productId);

    revalidatePath("/admin/products");
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Marketplace Catalog" ar="كتالوج السوق" />
          </span>
          <h1><T en="Product Approval" ar="اعتماد المنتجات" /></h1>
          <p><T en="Review and manage products submitted by vendors." ar="مراجعة وإدارة المنتجات المقدمة من التجار." /></p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><T en="Product" ar="المنتج" /></th>
              <th><T en="Vendor" ar="التاجر" /></th>
              <th><T en="Price" ar="السعر" /></th>
              <th><T en="Status" ar="الحالة" /></th>
              <th><T en="Actions" ar="الإجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                  <T en="No products found." ar="لا توجد منتجات." />
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name_en}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{p.category?.name_en}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.vendor?.business_name_en}</div>
                  </td>
                  <td>{p.base_price} SAR</td>
                  <td>
                    <span className={`badge badge-${p.status === 'approved' ? 'success' : p.status === 'pending_approval' ? 'warning' : 'secondary'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <form action={updateProductStatus}>
                        <input type="hidden" name="product_id" value={p.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button type="submit" className="btn btn-small btn-success" disabled={p.status === 'approved'}>
                          <T en="Approve" ar="اعتماد" />
                        </button>
                      </form>
                      <form action={updateProductStatus}>
                        <input type="hidden" name="product_id" value={p.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <button type="submit" className="btn btn-small btn-danger" disabled={p.status === 'rejected'}>
                          <T en="Reject" ar="رفض" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
