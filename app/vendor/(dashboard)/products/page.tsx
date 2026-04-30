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
    <div className="dashboard-page">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge">
            <T en="Product Management" ar="إدارة المنتجات" />
          </span>
          <h1>
            <T en="My Products" ar="منتجاتي" />
          </h1>
          <p>
            <T
              en="View and manage your marketplace listings."
              ar="عرض وإدارة قوائم المنتجات الخاصة بك."
            />
          </p>
        </div>

        <Link href="/vendor/products/new" className="btn btn-primary">
          <T en="+ Add Product" ar="+ إضافة منتج" />
        </Link>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <T en="Product" ar="المنتج" />
              </th>
              <th>
                <T en="Category" ar="التصنيف" />
              </th>
              <th>
                <T en="Stock" ar="المخزون" />
              </th>
              <th>
                <T en="Price" ar="السعر" />
              </th>
              <th>
                <T en="Status" ar="الحالة" />
              </th>
              <th>
                <T en="Actions" ar="الإجراءات" />
              </th>
            </tr>
          </thead>

          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                  <T en="No products found." ar="لا توجد منتجات." />
                </td>
              </tr>
            ) : (
              products.map((product: any) => {
                const stock = getProductStock(product);

                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.name_en}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        {product.name_ar}
                      </div>
                    </td>

                    <td>{product.category?.name_en || "—"}</td>

                    <td>
                      <span
                        style={{
                          color: stock > 0 ? "white" : "#ff4d4d",
                          fontWeight: 600,
                        }}
                      >
                        {stock}{" "}
                        <small>
                          <T en="Units" ar="وحدة" />
                        </small>
                      </span>
                    </td>

                    <td>{Number(product.base_price || 0).toFixed(2)} SAR</td>

                    <td>
                      <span
                        className={`badge badge-${
                          product.status === "approved"
                            ? "success"
                            : product.status === "pending_approval"
                              ? "warning"
                              : "secondary"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        href={`/vendor/products/${product.id}/edit`}
                        className="btn btn-small"
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
    </div>
  );
}
