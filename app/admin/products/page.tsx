import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { DbRow, readText } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

const PRODUCT_STATUSES = [
  "draft",
  "pending",
  "pending_review",
  "under_review",
  "approved",
  "active",
  "published",
  "rejected",
  "inactive",
  "archived",
  "out_of_stock",
];

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value || null;
}

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getBadgeClass(status: string | null | undefined) {
  if (status === "approved" || status === "active" || status === "published") {
    return "badge badge-success";
  }

  if (status === "pending" || status === "pending_review" || status === "under_review") {
    return "badge badge-warning";
  }

  if (status === "rejected" || status === "archived" || status === "inactive") {
    return "badge badge-danger";
  }

  return "badge";
}

function getProductName(product: DbRow) {
  return readText(product, ["name_en", "name_ar", "name", "sku"], "Product");
}

function getCategoryName(category: any) {
  const row = Array.isArray(category) ? category[0] : category;
  if (!row) return "—";
  return readText(row, ["name_en", "name_ar", "slug"], "—");
}

function getBrandName(brand: any) {
  const row = Array.isArray(brand) ? brand[0] : brand;
  if (!row) return "—";
  return readText(row, ["name_en", "name_ar", "slug"], "—");
}

function getVendorName(vendor: DbRow | undefined) {
  if (!vendor) return "—";
  return readText(vendor, [
    "business_name_en",
    "business_name_ar",
    "store_name",
    "full_name",
    "email",
  ], "Vendor");
}

function getProductImages(product: DbRow) {
  const images = product.images;

  if (Array.isArray(images)) {
    return images.filter(Boolean).slice(0, 4) as string[];
  }

  if (typeof images === "string" && images) {
    return [images];
  }

  return [];
}

export default async function AdminProductsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const productsResult = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      id,
      vendor_id,
      category_id,
      brand_id,
      sku,
      slug,
      name_en,
      name_ar,
      description_en,
      description_ar,
      base_price,
      sale_price,
      stock_quantity,
      currency_code,
      status,
      is_active,
      images,
      specifications,
      created_at,
      updated_at,
      category:marketplace_categories(
        id,
        slug,
        name_en,
        name_ar
      ),
      brand:marketplace_brands(
        id,
        slug,
        name_en,
        name_ar
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  const products = productsResult.data || [];
  const vendorIds = Array.from(
    new Set(products.map((product: any) => product.vendor_id).filter(Boolean))
  );

  const vendorsResult =
    vendorIds.length > 0
      ? await supabaseAdmin
          .from("vendor_profiles")
          .select(`
            id,
            auth_user_id,
            business_name_en,
            business_name_ar,
            store_name,
            status,
            business_verification_status
          `)
          .in("id", vendorIds)
      : { data: [], error: null };

  if (vendorsResult.error) {
    console.warn("Product vendors lookup failed:", vendorsResult.error.message);
  }

  const vendors = vendorsResult.data || [];

  const vendorById = new Map<string, any>();

  for (const vendor of vendors) {
    if (vendor.id) {
      vendorById.set(vendor.id, vendor);
    }

    if (vendor.auth_user_id) {
      vendorById.set(vendor.auth_user_id, vendor);
    }
  }

  async function setProductStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const productId = getText(formData, "product_id");
    const status = getText(formData, "status");
    const reviewNote = getNullableText(formData, "review_note");

    if (!productId) {
      throw new Error("Product id is required.");
    }

    if (!PRODUCT_STATUSES.includes(status)) {
      throw new Error("Invalid product status.");
    }

    const isActive =
      status === "approved" || status === "active" || status === "published";

    const metadataPatch = {
      admin_review_note: reviewNote,
      admin_reviewed_at: new Date().toISOString(),
    };

    const { data: existingProduct } = await supabaseAdmin
      .from("marketplace_products")
      .select("id, specifications")
      .eq("id", productId)
      .maybeSingle();

    const existingSpecifications =
      existingProduct?.specifications &&
      typeof existingProduct.specifications === "object" &&
      !Array.isArray(existingProduct.specifications)
        ? existingProduct.specifications
        : {};

    const { error } = await supabaseAdmin
      .from("marketplace_products")
      .update({
        status,
        is_active: isActive,
        specifications: {
          ...existingSpecifications,
          admin_review: metadataPatch,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/products");
    revalidatePath("/marketplace");
    revalidatePath("/vendor/products");
  }

  const pendingProducts = products.filter((product: any) =>
    ["pending", "pending_review", "under_review"].includes(product.status)
  );

  const approvedProducts = products.filter((product: any) =>
    ["approved", "active", "published"].includes(product.status)
  );

  const rejectedProducts = products.filter((product: any) =>
    ["rejected", "archived", "inactive"].includes(product.status)
  );

  const outOfStockProducts = products.filter(
    (product: any) =>
      product.status === "out_of_stock" || Number(product.stock_quantity || 0) <= 0
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Products Review" ar="مراجعة المنتجات" />
        </span>

        <h1>
          <T en="Admin Product Approval Center" ar="مركز اعتماد المنتجات" />
        </h1>

        <p>
          <T
            en="Review vendor products uploaded manually, by Excel, or through API before they appear publicly."
            ar="راجع منتجات التجار المضافة يدويًا أو عبر Excel أو API قبل ظهورها للعملاء."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>
              <T en="Pending Review" ar="بانتظار المراجعة" />
            </label>
            <div className="stat-value">{pendingProducts.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <label>
              <T en="Approved" ar="معتمدة" />
            </label>
            <div className="stat-value">{approvedProducts.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <label>
              <T en="Rejected / Archived" ar="مرفوضة / مؤرشفة" />
            </label>
            <div className="stat-value">{rejectedProducts.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <label>
              <T en="Out of Stock" ar="نفدت من المخزون" />
            </label>
            <div className="stat-value">{outOfStockProducts.length}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Products" ar="المنتجات" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Catalog</th>
                <th>Price / Stock</th>
                <th>Images</th>
                <th>Status</th>
                <th>Created</th>
                <th>Review</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No products found." ar="لا توجد منتجات." />
                  </td>
                </tr>
              ) : (
                (products as any[]).map((product: any) => {
                  const vendor = vendorById.get(product.vendor_id);
                  const images = getProductImages(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 900 }}>
                          {getProductName(product)}
                        </div>

                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          SKU: {product.sku || "—"}
                        </div>

                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          ID: {product.id}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800 }}>
                          {getVendorName(vendor)}
                        </div>

                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {vendor?.business_verification_status || vendor?.status || "—"}
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>Category:</strong>{" "}
                          {getCategoryName(
                            Array.isArray(product.category)
                              ? product.category[0]
                              : product.category
                          )}
                        </div>

                        <div style={{ marginTop: 4 }}>
                          <strong>Brand:</strong>{" "}
                          {getBrandName(
                            Array.isArray(product.brand)
                              ? product.brand[0]
                              : product.brand
                          )}
                        </div>
                      </td>

                      <td>
                        <div>
                          {formatMoney(
                            product.sale_price || product.base_price,
                            product.currency_code || "SAR"
                          )}
                        </div>

                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          Stock: {product.stock_quantity ?? 0}
                        </div>
                      </td>

                      <td>
                        {images.length > 0 ? (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {images.map((image: string) => (
                              <img
                                key={image}
                                src={image}
                                alt=""
                                style={{
                                  width: 46,
                                  height: 46,
                                  objectFit: "cover",
                                  borderRadius: 10,
                                  border: "1px solid rgba(255,255,255,0.12)",
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>No images</span>
                        )}
                      </td>

                      <td>
                        <span className={getBadgeClass(product.status)}>
                          {product.status}
                        </span>
                      </td>

                      <td>{formatDate(product.created_at)}</td>

                      <td>
                        <div style={{ display: "grid", gap: 8, minWidth: 180 }}>
                          <form action={setProductStatus}>
                            <input type="hidden" name="product_id" value={product.id} />
                            <input type="hidden" name="status" value="approved" />
                            <input
                              type="hidden"
                              name="review_note"
                              value="Approved by admin."
                            />
                            <button type="submit" className="btn btn-small btn-success">
                              Approve
                            </button>
                          </form>

                          <form action={setProductStatus}>
                            <input type="hidden" name="product_id" value={product.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              name="review_note"
                              className="input"
                              placeholder="Reject reason"
                            />
                            <button type="submit" className="btn btn-small btn-danger">
                              Reject
                            </button>
                          </form>

                          <form action={setProductStatus}>
                            <input type="hidden" name="product_id" value={product.id} />
                            <input type="hidden" name="status" value="archived" />
                            <input
                              type="hidden"
                              name="review_note"
                              value="Archived by admin."
                            />
                            <button type="submit" className="btn btn-small">
                              Archive
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Approval rules" ar="قواعد الاعتماد" />
        </h2>

        <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
          <li>
            <T
              en="New vendor products should stay pending_review until admin approval."
              ar="منتجات التاجر الجديدة تبقى pending_review إلى أن تعتمدها الإدارة."
            />
          </li>
          <li>
            <T
              en="Approved products can appear in the public marketplace after the listing page is connected."
              ar="المنتجات المعتمدة يمكن أن تظهر في المتجر العام بعد ربط صفحة العرض."
            />
          </li>
          <li>
            <T
              en="Rejected products remain visible to admin and vendor but should not appear publicly."
              ar="المنتجات المرفوضة تبقى ظاهرة للإدارة والتاجر ولا تظهر للعامة."
            />
          </li>
        </ul>
      </section>
    </div>
  );
}
