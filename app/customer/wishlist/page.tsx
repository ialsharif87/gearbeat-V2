import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";
import ProductCard from "../../../components/product-card";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch wishlist items
  const { data: wishlist } = await supabase
    .from("marketplace_wishlists")
    .select(`
      id,
      product:marketplace_products(
        id, name_en, name_ar, slug, base_price,
        brand:marketplace_brands(name_en),
        category:marketplace_categories(name_en, name_ar, slug),
        images:marketplace_product_images(image_url)
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Saved" ar="المفضلة" />
          </p>

          <h1 style={{ marginTop: 10 }}>
            <T en="My Wishlist" ar="قائمة أمنياتي" />
          </h1>

          <p className="gb-muted-text">
            <T
              en="Save the gear you love and buy it later."
              ar="احفظ المعدات التي تحبها واشترها لاحقاً."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/marketplace" className="btn btn-primary">
            <T en="Explore Marketplace" ar="استكشف السوق" />
          </Link>

          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <div style={{ marginTop: 28 }}>
          {!wishlist || wishlist.length === 0 ? (
            <div className="gb-empty-state" style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: "4rem", marginBottom: 20 }}>❤️</div>
              <h3>
                <T en="Your wishlist is empty" ar="قائمة أمنياتك فارغة" />
              </h3>
              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Start adding gear to your favorites!"
                  ar="ابدأ بإضافة المعدات إلى مفضلاتك!"
                />
              </p>
              <Link href="/gear" className="btn btn-primary" style={{ marginTop: 30 }}>
                <T en="Explore Marketplace" ar="استكشف السوق" />
              </Link>
            </div>
          ) : (
            <div className="gb-customer-grid">
              {wishlist.map((item: any) => (
                <ProductCard key={item.id} product={item.product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
