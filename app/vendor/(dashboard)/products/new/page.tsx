import { requireVendorLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch categories and brands for the dropdowns
  const [categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin.from("marketplace_categories").select("id, name_en, name_ar").eq("status", "active"),
    supabaseAdmin.from("marketplace_brands").select("id, name_en, name_ar").eq("status", "active")
  ]);

  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];

  async function handleAddProduct(formData: FormData) {
    "use server";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nameEn = formData.get("name_en") as string;
    const nameAr = formData.get("name_ar") as string;
    const categoryId = formData.get("category_id") as string;
    const brandId = formData.get("brand_id") as string;
    const basePrice = Number(formData.get("base_price"));
    const descEn = formData.get("description_en") as string;
    const descAr = formData.get("description_ar") as string;
    
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

    const supabaseAdmin = createAdminClient();

    const { data: product, error } = await supabaseAdmin
      .from("marketplace_products")
      .insert({
        vendor_id: user.id,
        name_en: nameEn,
        name_ar: nameAr,
        slug,
        category_id: categoryId || null,
        brand_id: brandId || null,
        base_price: basePrice,
        description_en: descEn,
        description_ar: descAr,
        status: 'pending_approval'
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // Create a default variant
    await supabaseAdmin.from("marketplace_product_variants").insert({
      product_id: product.id,
      sku: `SKU-${product.id.substring(0, 8).toUpperCase()}`,
      status: 'active'
    });

    redirect("/vendor/products");
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="New Listing" ar="قائمة جديدة" />
          </span>
          <h1><T en="Add Product" ar="إضافة منتج" /></h1>
          <p><T en="Fill in the details below to create your marketplace listing." ar="املأ التفاصيل أدناه لإنشاء قائمة المنتجات الخاصة بك." /></p>
        </div>
      </div>

      <form action={handleAddProduct} className="card" style={{ marginTop: 30 }}>
        <div className="grid grid-2">
          <div>
            <label><T en="Product Name (English)" ar="اسم المنتج (إنجليزي)" /></label>
            <input name="name_en" className="input" required placeholder="Sony WH-1000XM5" />
          </div>
          <div>
            <label><T en="Product Name (Arabic)" ar="اسم المنتج (عربي)" /></label>
            <input name="name_ar" className="input" required placeholder="سوني WH-1000XM5" />
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <div>
            <label><T en="Category" ar="التصنيف" /></label>
            <select name="category_id" className="input" required>
              <option value=""><T en="Select Category" ar="اختر التصنيف" /></option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_en} / {c.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label><T en="Brand" ar="العلامة التجارية" /></label>
            <select name="brand_id" className="input">
              <option value=""><T en="Select Brand" ar="اختر العلامة" /></option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name_en}</option>
              ))}
            </select>
          </div>
          <div>
            <label><T en="Base Price (SAR)" ar="السعر الأساسي (ريال)" /></label>
            <input name="base_price" type="number" className="input" required placeholder="1299" />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label><T en="Description (English)" ar="الوصف (إنجليزي)" /></label>
          <textarea name="description_en" className="input" rows={5} placeholder="Detailed product specifications..." />
        </div>

        <div style={{ marginTop: 20 }}>
          <label><T en="Description (Arabic)" ar="الوصف (عربي)" /></label>
          <textarea name="description_ar" className="input" rows={5} placeholder="مواصفات المنتج بالتفصيل..." />
        </div>

        <div style={{ marginTop: 30, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <T en="Save Product" ar="حفظ المنتج" />
          </button>
        </div>
      </form>
    </div>
  );
}
