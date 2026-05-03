import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import FavoriteButton from "@/components/favorite-button";
import GoogleMapsLink from "@/components/google-maps-link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type FavoriteRow = {
  id: string;
  auth_user_id: string;
  favorite_type: string;
  studio_id: string | null;
  product_id: string | null;
  vendor_id: string | null;
  created_at: string;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getStudioName(studio: any) {
  return studio?.name_en || studio?.name || studio?.name_ar || "Studio";
}

function getStudioHref(studio: any) {
  return `/studios/${studio?.slug || studio?.id}`;
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.name || "Gear";
}

function getProductHref(product: any) {
  return `/marketplace/products/${product?.slug || product?.id}`;
}

function getVendorName(vendor: any) {
  return (
    vendor?.business_name_en ||
    vendor?.business_name_ar ||
    vendor?.store_name ||
    "Vendor"
  );
}

function getVendorHref(vendor: any) {
  return `/vendor-store/${vendor?.slug || vendor?.id}`;
}

function findById(rows: any[], id: string | null) {
  if (!id) {
    return null;
  }

  return rows.find((row) => row.id === id) || null;
}

function EmptyState({
  titleEn,
  titleAr,
  descEn,
  descAr,
  href,
  actionEn,
  actionAr,
}: {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  href: string;
  actionEn: string;
  actionAr: string;
}) {
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: 34,
        background: "rgba(255,255,255,0.035)",
      }}
    >
      <h3>
        <T en={titleEn} ar={titleAr} />
      </h3>

      <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
        <T en={descEn} ar={descAr} />
      </p>

      <Link href={href} className="btn btn-primary" style={{ marginTop: 12 }}>
        <T en={actionEn} ar={actionAr} />
      </Link>
    </div>
  );
}

export default async function CustomerSavedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=customer");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("auth_user_id, full_name, email, role, preferred_currency")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect("/login?account=customer");
  }

  if (profile.role !== "customer") {
    redirect("/forbidden");
  }

  const { data: favorites, error: favoritesError } = await supabaseAdmin
    .from("customer_favorites")
    .select("id, auth_user_id, favorite_type, studio_id, product_id, vendor_id, created_at")
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (favoritesError) {
    throw new Error(favoritesError.message);
  }

  const favoriteRows = (favorites || []) as FavoriteRow[];

  const studioIds = uniqueValues(
    favoriteRows
      .filter((favorite) => favorite.favorite_type === "studio")
      .map((favorite) => favorite.studio_id)
  );

  const productIds = uniqueValues(
    favoriteRows
      .filter((favorite) => favorite.favorite_type === "product")
      .map((favorite) => favorite.product_id)
  );

  const vendorIds = uniqueValues(
    favoriteRows
      .filter((favorite) => favorite.favorite_type === "vendor")
      .map((favorite) => favorite.vendor_id)
  );

  const [studiosResult, productsResult, vendorsResult] = await Promise.all([
    studioIds.length > 0
      ? supabaseAdmin
          .from("studios")
          .select(`
            id,
            slug,
            name,
            name_en,
            name_ar,
            city,
            city_name,
            district,
            address_line,
            google_maps_url,
            latitude,
            longitude,
            price_from,
            cover_image_url,
            verified,
            verified_location,
            booking_enabled,
            status
          `)
          .in("id", studioIds)
      : Promise.resolve({ data: [], error: null }),

    productIds.length > 0
      ? supabaseAdmin
          .from("marketplace_products")
          .select(`
            id,
            slug,
            name_en,
            name_ar,
            base_price,
            status,
            vendor_id
          `)
          .in("id", productIds)
      : Promise.resolve({ data: [], error: null }),

    vendorIds.length > 0
      ? supabaseAdmin
          .from("vendor_profiles")
          .select(`
            id,
            slug,
            business_name_en,
            business_name_ar,
            contact_email,
            country_code,
            city_name,
            status,
            business_verification_status
          `)
          .in("id", vendorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (studiosResult.error) {
    throw new Error(studiosResult.error.message);
  }

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  if (vendorsResult.error) {
    throw new Error(vendorsResult.error.message);
  }

  const studios = studiosResult.data || [];
  const products = productsResult.data || [];
  const vendors = vendorsResult.data || [];
  const currency = profile.preferred_currency || "SAR";

  const savedStudios = favoriteRows.filter(
    (favorite) => favorite.favorite_type === "studio"
  );

  const savedProducts = favoriteRows.filter(
    (favorite) => favorite.favorite_type === "product"
  );

  const savedVendors = favoriteRows.filter(
    (favorite) => favorite.favorite_type === "vendor"
  );

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Saved" ar="المفضلة" />
          </p>

          <h1 style={{ marginTop: 10 }}>
            <T en="Your saved places and gear" ar="الأماكن والمعدات المحفوظة" />
          </h1>

          <p className="gb-muted-text" style={{ maxWidth: 760 }}>
            <T
              en="Keep your favorite studios, gear, and vendors in one place."
              ar="احتفظ بالاستوديوهات والمعدات والتجار المفضلين لديك في مكان واحد."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/studios" className="btn btn-primary">
            <T en="Explore studios" ar="استكشف الاستوديوهات" />
          </Link>

          <Link href="/marketplace" className="btn">
            <T en="Shop gear" ar="تسوق المعدات" />
          </Link>

          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <section className="gb-customer-grid" style={{ marginTop: 28 }}>
          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🎙️</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Saved Studios" ar="استوديوهات محفوظة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>{savedStudios.length}</div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🎛️</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Saved Gear" ar="معدات محفوظة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>{savedProducts.length}</div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🏪</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Saved Vendors" ar="تجار محفوظون" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>{savedVendors.length}</div>
            </div>
          </div>
        </section>

      <section className="card" style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2>
              <T en="Saved Studios" ar="الاستوديوهات المحفوظة" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Your favorite creative spaces and studios."
                ar="مساحاتك الإبداعية والاستوديوهات المفضلة."
              />
            </p>
          </div>

          <Link href="/studios/near-me" className="btn">
            <T en="Studios near me" ar="استوديوهات قريبة مني" />
          </Link>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 16,
          }}
        >
          {savedStudios.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                titleEn="No saved studios yet"
                titleAr="لا توجد استوديوهات محفوظة بعد"
                descEn="Tap the heart on any studio to save it here."
                descAr="اضغط على علامة القلب في أي استوديو لحفظه هنا."
                href="/studios"
                actionEn="Browse studios"
                actionAr="تصفح الاستوديوهات"
              />
            </div>
          ) : (
            savedStudios.map((favorite) => {
              const studio = findById(studios, favorite.studio_id);

              if (!studio) {
                return null;
              }

              const location = [studio.district, studio.city_name || studio.city]
                .filter(Boolean)
                .join(", ");

              return (
                <article key={favorite.id} className="card">
                  <div
                    style={{
                      minHeight: 160,
                      borderRadius: 18,
                      background: studio.cover_image_url
                        ? `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.45)), url(${studio.cover_image_url}) center/cover`
                        : "linear-gradient(135deg, rgba(207,167,98,0.16), rgba(255,255,255,0.04))",
                    }}
                  />

                  <div style={{ marginTop: 14 }}>
                    <h3>{getStudioName(studio)}</h3>

                    <p style={{ color: "var(--muted)", marginTop: 6 }}>
                      {location || "Location details coming soon"}
                    </p>

                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {studio.verified ? (
                        <span className="badge badge-success">
                          <T en="Verified" ar="موثق" />
                        </span>
                      ) : null}

                      {studio.verified_location ? (
                        <span className="badge badge-success">
                          <T en="Location verified" ar="الموقع موثق" />
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <strong>{formatMoney(studio.price_from, currency)}</strong>

                      <FavoriteButton
                        type="studio"
                        studioId={studio.id}
                        compact
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <Link href={getStudioHref(studio)} className="btn btn-primary">
                        <T en="View studio" ar="عرض الاستوديو" />
                      </Link>

                      <GoogleMapsLink
                        googleMapsUrl={studio.google_maps_url}
                        latitude={studio.latitude}
                        longitude={studio.longitude}
                        cityName={studio.city_name || studio.city}
                        district={studio.district}
                        addressLine={studio.address_line}
                        mode="directions"
                        className="btn"
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="card" style={{ marginTop: 28 }}>
        <h2>
          <T en="Saved Gear" ar="المعدات المحفوظة" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <T
            en="Gear and marketplace products you want to revisit."
            ar="المعدات ومنتجات المتجر التي تريد الرجوع لها لاحقًا."
          />
        </p>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {savedProducts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                titleEn="No saved gear yet"
                titleAr="لا توجد معدات محفوظة بعد"
                descEn="Save gear you like from the marketplace."
                descAr="احفظ المعدات التي تعجبك من المتجر."
                href="/marketplace"
                actionEn="Open marketplace"
                actionAr="فتح المتجر"
              />
            </div>
          ) : (
            savedProducts.map((favorite) => {
              const product = findById(products, favorite.product_id);

              if (!product) {
                return null;
              }

              return (
                <article key={favorite.id} className="card">
                  <span className="badge">
                    <T en="Gear" ar="معدات" />
                  </span>

                  <h3 style={{ marginTop: 12 }}>{getProductName(product)}</h3>

                  <p style={{ color: "var(--muted)", marginTop: 6 }}>
                    {product.status || "marketplace item"}
                  </p>

                  <strong style={{ display: "block", marginTop: 12 }}>
                    {formatMoney(product.base_price, currency)}
                  </strong>

                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={getProductHref(product)} className="btn btn-primary">
                      <T en="View gear" ar="عرض المنتج" />
                    </Link>

                    <FavoriteButton
                      type="product"
                      productId={product.id}
                      compact
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="card" style={{ marginTop: 28 }}>
        <h2>
          <T en="Saved Vendors" ar="التجار المحفوظون" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <T
            en="Vendors and stores you trust or want to follow."
            ar="التجار والمتاجر التي تثق بها أو ترغب بمتابعتها."
          />
        </p>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {savedVendors.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                titleEn="No saved vendors yet"
                titleAr="لا يوجد تجار محفوظون بعد"
                descEn="Save trusted gear vendors and stores."
                descAr="احفظ التجار والمتاجر الموثوقة."
                href="/marketplace"
                actionEn="Browse vendors"
                actionAr="تصفح التجار"
              />
            </div>
          ) : (
            savedVendors.map((favorite) => {
              const vendor = findById(vendors, favorite.vendor_id);

              if (!vendor) {
                return null;
              }

              return (
                <article key={favorite.id} className="card">
                  <span
                    className={
                      vendor.business_verification_status === "approved"
                        ? "badge badge-success"
                        : "badge"
                    }
                  >
                    {vendor.business_verification_status === "approved"
                      ? "Verified vendor"
                      : vendor.status || "Vendor"}
                  </span>

                  <h3 style={{ marginTop: 12 }}>{getVendorName(vendor)}</h3>

                  <p style={{ color: "var(--muted)", marginTop: 6 }}>
                    {[vendor.city_name, vendor.country_code]
                      .filter(Boolean)
                      .join(", ") || "Vendor location"}
                  </p>

                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={getVendorHref(vendor)} className="btn btn-primary">
                      <T en="View vendor" ar="عرض التاجر" />
                    </Link>

                    <FavoriteButton
                      type="vendor"
                      vendorId={vendor.id}
                      compact
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
      </div>
    </main>
  );
}
