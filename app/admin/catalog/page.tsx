import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value || null;
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) || 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlugFromName(nameEn: string, nameAr: string) {
  return normalizeSlug(nameEn || nameAr);
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

function buildCategoryPayload(formData: FormData) {
  const nameEn = getText(formData, "name_en");
  const nameAr = getText(formData, "name_ar");
  const rawSlug = getText(formData, "slug");
  const slug = normalizeSlug(rawSlug || buildSlugFromName(nameEn, nameAr));

  if (!nameEn || nameEn.length < 2) {
    throw new Error("English category name is required.");
  }

  if (!nameAr || nameAr.length < 2) {
    throw new Error("Arabic category name is required.");
  }

  if (!slug || slug.length < 2) {
    throw new Error("Category slug is required.");
  }

  return {
    name_en: nameEn,
    name_ar: nameAr,
    slug,
    description_en: getNullableText(formData, "description_en"),
    description_ar: getNullableText(formData, "description_ar"),
    parent_id: getNullableText(formData, "parent_id"),
    is_active: getCheckbox(formData, "is_active"),
    sort_order: getNumber(formData, "sort_order") || 100,
    updated_at: new Date().toISOString(),
  };
}

function buildBrandPayload(formData: FormData) {
  const nameEn = getText(formData, "name_en");
  const nameAr = getText(formData, "name_ar");
  const rawSlug = getText(formData, "slug");
  const slug = normalizeSlug(rawSlug || buildSlugFromName(nameEn, nameAr));

  if (!nameEn || nameEn.length < 2) {
    throw new Error("English brand name is required.");
  }

  if (!nameAr || nameAr.length < 2) {
    throw new Error("Arabic brand name is required.");
  }

  if (!slug || slug.length < 2) {
    throw new Error("Brand slug is required.");
  }

  return {
    name_en: nameEn,
    name_ar: nameAr,
    slug,
    website_url: getNullableText(formData, "website_url"),
    logo_url: getNullableText(formData, "logo_url"),
    is_active: getCheckbox(formData, "is_active"),
    sort_order: getNumber(formData, "sort_order") || 100,
    updated_at: new Date().toISOString(),
  };
}

export default async function AdminCatalogPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const [categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin
      .from("marketplace_categories")
      .select(`
        id,
        name_en,
        name_ar,
        slug,
        description_en,
        description_ar,
        parent_id,
        is_active,
        sort_order,
        created_at,
        updated_at
      `)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true }),

    supabaseAdmin
      .from("marketplace_brands")
      .select(`
        id,
        name_en,
        name_ar,
        slug,
        website_url,
        logo_url,
        is_active,
        sort_order,
        created_at,
        updated_at
      `)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (brandsResult.error) {
    throw new Error(brandsResult.error.message);
  }

  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];

  async function createCategory(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const payload = buildCategoryPayload(formData);

    const { error } = await supabaseAdmin
      .from("marketplace_categories")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  async function updateCategory(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const categoryId = getText(formData, "category_id");

    if (!categoryId) {
      throw new Error("Category id is required.");
    }

    const payload = buildCategoryPayload(formData);

    const { error } = await supabaseAdmin
      .from("marketplace_categories")
      .update(payload)
      .eq("id", categoryId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  async function toggleCategoryStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const categoryId = getText(formData, "category_id");
    const nextStatus = getText(formData, "is_active") === "true";

    if (!categoryId) {
      throw new Error("Category id is required.");
    }

    const { error } = await supabaseAdmin
      .from("marketplace_categories")
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  async function createBrand(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const payload = buildBrandPayload(formData);

    const { error } = await supabaseAdmin
      .from("marketplace_brands")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  async function updateBrand(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const brandId = getText(formData, "brand_id");

    if (!brandId) {
      throw new Error("Brand id is required.");
    }

    const payload = buildBrandPayload(formData);

    const { error } = await supabaseAdmin
      .from("marketplace_brands")
      .update(payload)
      .eq("id", brandId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  async function toggleBrandStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const brandId = getText(formData, "brand_id");
    const nextStatus = getText(formData, "is_active") === "true";

    if (!brandId) {
      throw new Error("Brand id is required.");
    }

    const { error } = await supabaseAdmin
      .from("marketplace_brands")
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/catalog");
    revalidatePath("/vendor/products/new");
    revalidatePath("/vendor/products/bulk");
  }

  const activeCategories = categories.filter((category: any) => category.is_active);
  const inactiveCategories = categories.filter((category: any) => !category.is_active);
  const activeBrands = brands.filter((brand: any) => brand.is_active);
  const inactiveBrands = brands.filter((brand: any) => !brand.is_active);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Catalog" ar="الكتالوج" />
        </span>

        <h1>
          <T en="Admin Catalog Management" ar="إدارة التصنيفات والعلامات" />
        </h1>

        <p>
          <T
            en="Manage marketplace categories and brands used by vendors when adding products."
            ar="إدارة تصنيفات وعلامات المتجر التي يستخدمها التجار عند إضافة المنتجات."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">🧩</div>
          <div className="stat-content">
            <label>
              <T en="Active Categories" ar="تصنيفات فعالة" />
            </label>
            <div className="stat-value">{activeCategories.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <label>
              <T en="Inactive Categories" ar="تصنيفات غير فعالة" />
            </label>
            <div className="stat-value">{inactiveCategories.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <label>
              <T en="Active Brands" ar="علامات فعالة" />
            </label>
            <div className="stat-value">{activeBrands.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <label>
              <T en="Total Brands" ar="إجمالي العلامات" />
            </label>
            <div className="stat-value">{brands.length}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Create category" ar="إنشاء تصنيف" />
        </h2>

        <form action={createCategory} style={{ marginTop: 20, display: "grid", gap: 18 }}>
          <div className="grid grid-4">
            <div>
              <label>Name English</label>
              <input name="name_en" className="input" required placeholder="Microphones" />
            </div>

            <div>
              <label>Name Arabic</label>
              <input name="name_ar" className="input" required placeholder="الميكروفونات" />
            </div>

            <div>
              <label>Slug</label>
              <input name="slug" className="input" placeholder="microphones" />
            </div>

            <div>
              <label>Sort order</label>
              <input name="sort_order" className="input" type="number" defaultValue={100} />
            </div>
          </div>

          <div className="grid grid-3">
            <div>
              <label>Parent category</label>
              <select name="parent_id" className="input" defaultValue="">
                <option value="">No parent</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en} / {category.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Description English</label>
              <input name="description_en" className="input" placeholder="Category description" />
            </div>
          </div>

          <div>
            <label>Description Arabic</label>
            <input name="description_ar" className="input" placeholder="وصف التصنيف" />
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input name="is_active" type="checkbox" defaultChecked />
            Active
          </label>

          <button type="submit" className="btn btn-primary btn-large">
            <T en="Create Category" ar="إنشاء التصنيف" />
          </button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Categories" ar="التصنيفات" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Sort</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No categories found." ar="لا توجد تصنيفات." />
                  </td>
                </tr>
              ) : (
                categories.map((category: any) => (
                  <tr key={category.id}>
                    <td>
                      <div style={{ fontWeight: 900 }}>{category.name_en}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {category.name_ar}
                      </div>
                    </td>

                    <td>{category.slug}</td>

                    <td>
                      <span className={category.is_active ? "badge badge-success" : "badge"}>
                        {category.is_active ? "active" : "inactive"}
                      </span>
                    </td>

                    <td>{category.sort_order}</td>

                    <td>{formatDate(category.created_at)}</td>

                    <td>
                      <form action={toggleCategoryStatus}>
                        <input type="hidden" name="category_id" value={category.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={category.is_active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className={
                            category.is_active
                              ? "btn btn-small btn-danger"
                              : "btn btn-small btn-success"
                          }
                        >
                          {category.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Edit categories" ar="تعديل التصنيفات" />
        </h2>

        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          {categories.map((category: any) => (
            <details key={category.id} className="card">
              <summary style={{ cursor: "pointer", fontWeight: 900 }}>
                {category.name_en} — {category.slug}
              </summary>

              <form action={updateCategory} style={{ marginTop: 18, display: "grid", gap: 16 }}>
                <input type="hidden" name="category_id" value={category.id} />

                <div className="grid grid-4">
                  <div>
                    <label>Name English</label>
                    <input name="name_en" className="input" required defaultValue={category.name_en || ""} />
                  </div>

                  <div>
                    <label>Name Arabic</label>
                    <input name="name_ar" className="input" required defaultValue={category.name_ar || ""} />
                  </div>

                  <div>
                    <label>Slug</label>
                    <input name="slug" className="input" required defaultValue={category.slug || ""} />
                  </div>

                  <div>
                    <label>Sort order</label>
                    <input name="sort_order" className="input" type="number" defaultValue={category.sort_order || 100} />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div>
                    <label>Parent category</label>
                    <select name="parent_id" className="input" defaultValue={category.parent_id || ""}>
                      <option value="">No parent</option>
                      {categories
                        .filter((item: any) => item.id !== category.id)
                        .map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name_en} / {item.name_ar}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label>Description English</label>
                    <input name="description_en" className="input" defaultValue={category.description_en || ""} />
                  </div>
                </div>

                <div>
                  <label>Description Arabic</label>
                  <input name="description_ar" className="input" defaultValue={category.description_ar || ""} />
                </div>

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input name="is_active" type="checkbox" defaultChecked={Boolean(category.is_active)} />
                  Active
                </label>

                <button type="submit" className="btn btn-primary">
                  <T en="Save Category" ar="حفظ التصنيف" />
                </button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Create brand" ar="إنشاء علامة تجارية" />
        </h2>

        <form action={createBrand} style={{ marginTop: 20, display: "grid", gap: 18 }}>
          <div className="grid grid-4">
            <div>
              <label>Name English</label>
              <input name="name_en" className="input" required placeholder="Shure" />
            </div>

            <div>
              <label>Name Arabic</label>
              <input name="name_ar" className="input" required placeholder="Shure" />
            </div>

            <div>
              <label>Slug</label>
              <input name="slug" className="input" placeholder="shure" />
            </div>

            <div>
              <label>Sort order</label>
              <input name="sort_order" className="input" type="number" defaultValue={100} />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <label>Website URL</label>
              <input name="website_url" className="input" placeholder="https://www.shure.com" />
            </div>

            <div>
              <label>Logo URL</label>
              <input name="logo_url" className="input" placeholder="https://..." />
            </div>
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input name="is_active" type="checkbox" defaultChecked />
            Active
          </label>

          <button type="submit" className="btn btn-primary btn-large">
            <T en="Create Brand" ar="إنشاء العلامة" />
          </button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Brands" ar="العلامات التجارية" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Sort</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No brands found." ar="لا توجد علامات تجارية." />
                  </td>
                </tr>
              ) : (
                brands.map((brand: any) => (
                  <tr key={brand.id}>
                    <td>
                      <div style={{ fontWeight: 900 }}>{brand.name_en}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {brand.name_ar}
                      </div>
                    </td>

                    <td>{brand.slug}</td>

                    <td>
                      <span className={brand.is_active ? "badge badge-success" : "badge"}>
                        {brand.is_active ? "active" : "inactive"}
                      </span>
                    </td>

                    <td>{brand.sort_order}</td>

                    <td>{brand.website_url || "—"}</td>

                    <td>
                      <form action={toggleBrandStatus}>
                        <input type="hidden" name="brand_id" value={brand.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={brand.is_active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className={
                            brand.is_active
                              ? "btn btn-small btn-danger"
                              : "btn btn-small btn-success"
                          }
                        >
                          {brand.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Edit brands" ar="تعديل العلامات" />
        </h2>

        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          {brands.map((brand: any) => (
            <details key={brand.id} className="card">
              <summary style={{ cursor: "pointer", fontWeight: 900 }}>
                {brand.name_en} — {brand.slug}
              </summary>

              <form action={updateBrand} style={{ marginTop: 18, display: "grid", gap: 16 }}>
                <input type="hidden" name="brand_id" value={brand.id} />

                <div className="grid grid-4">
                  <div>
                    <label>Name English</label>
                    <input name="name_en" className="input" required defaultValue={brand.name_en || ""} />
                  </div>

                  <div>
                    <label>Name Arabic</label>
                    <input name="name_ar" className="input" required defaultValue={brand.name_ar || ""} />
                  </div>

                  <div>
                    <label>Slug</label>
                    <input name="slug" className="input" required defaultValue={brand.slug || ""} />
                  </div>

                  <div>
                    <label>Sort order</label>
                    <input name="sort_order" className="input" type="number" defaultValue={brand.sort_order || 100} />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div>
                    <label>Website URL</label>
                    <input name="website_url" className="input" defaultValue={brand.website_url || ""} />
                  </div>

                  <div>
                    <label>Logo URL</label>
                    <input name="logo_url" className="input" defaultValue={brand.logo_url || ""} />
                  </div>
                </div>

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input name="is_active" type="checkbox" defaultChecked={Boolean(brand.is_active)} />
                  Active
                </label>

                <button type="submit" className="btn btn-primary">
                  <T en="Save Brand" ar="حفظ العلامة" />
                </button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
