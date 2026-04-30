import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

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

function renderStars(rating: unknown) {
  const value = Number(rating || 0);
  const safeValue = Number.isFinite(value)
    ? Math.max(0, Math.min(5, Math.round(value)))
    : 0;

  return "★".repeat(safeValue) + "☆".repeat(5 - safeValue);
}

function profileNameByAuthUserId(profiles: any[], authUserId: string) {
  const profile = profiles.find(
    (item: any) => item.auth_user_id === authUserId
  );

  return profile?.full_name || profile?.email || "Customer";
}

function productNameById(products: any[], productId: string) {
  const product = products.find((item: any) => item.id === productId);

  return product?.name_en || product?.name_ar || "Product";
}

export default async function VendorReviewsPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: products, error: productsError } = await supabaseAdmin
    .from("marketplace_products")
    .select("id, name_en, name_ar")
    .eq("vendor_id", user.id);

  if (productsError) {
    throw new Error(productsError.message);
  }

  const vendorProducts = products || [];
  const productIds = vendorProducts.map((product: any) => product.id);

  if (productIds.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <span className="badge">
            <T en="Reviews" ar="التقييمات" />
          </span>
          <h1>
            <T en="Customer Reviews" ar="تقييمات العملاء" />
          </h1>
          <p>
            <T
              en="You do not have products yet, so there are no reviews to show."
              ar="لا توجد لديك منتجات حتى الآن، لذلك لا توجد تقييمات لعرضها."
            />
          </p>
        </div>

        <div className="card" style={{ marginTop: 30, textAlign: "center" }}>
          <h2>
            <T en="No products found" ar="لا توجد منتجات" />
          </h2>
          <p>
            <T
              en="Create products first. Reviews will appear here after customers review them."
              ar="أنشئ المنتجات أولًا. ستظهر التقييمات هنا بعد أن يقيّمها العملاء."
            />
          </p>
        </div>
      </div>
    );
  }

  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from("marketplace_reviews")
    .select(`
      id,
      product_id,
      customer_auth_user_id,
      rating,
      comment,
      vendor_reply,
      created_at
    `)
    .in("product_id", productIds)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  const reviewRows = reviews || [];

  const customerAuthUserIds = Array.from(
    new Set(
      reviewRows
        .map((review: any) => review.customer_auth_user_id)
        .filter(Boolean)
    )
  );

  const { data: customerProfiles, error: customerProfilesError } =
    customerAuthUserIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select("auth_user_id, full_name, email")
          .in("auth_user_id", customerAuthUserIds)
      : { data: [], error: null };

  if (customerProfilesError) {
    throw new Error(customerProfilesError.message);
  }

  const profiles = customerProfiles || [];

  const totalReviews = reviewRows.length;
  const averageRating =
    totalReviews > 0
      ? reviewRows.reduce(
          (sum: number, review: any) => sum + Number(review.rating || 0),
          0
        ) / totalReviews
      : 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Reviews" ar="التقييمات" />
        </span>
        <h1>
          <T en="Customer Reviews" ar="تقييمات العملاء" />
        </h1>
        <p>
          <T
            en="Monitor customer feedback for products that belong to your vendor account."
            ar="تابع آراء العملاء على المنتجات التابعة لحساب التاجر الخاص بك."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <label>
              <T en="Average Rating" ar="متوسط التقييم" />
            </label>
            <div className="stat-value">{averageRating.toFixed(1)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <label>
              <T en="Total Reviews" ar="إجمالي التقييمات" />
            </label>
            <div className="stat-value">{totalReviews}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30, display: "grid", gap: 16 }}>
        {reviewRows.length === 0 ? (
          <div className="card" style={{ textAlign: "center" }}>
            <h2>
              <T en="No reviews yet" ar="لا توجد تقييمات بعد" />
            </h2>
            <p>
              <T
                en="Reviews will appear here after customers submit feedback for your products."
                ar="ستظهر التقييمات هنا بعد أن يرسل العملاء آراءهم حول منتجاتك."
              />
            </p>
          </div>
        ) : (
          reviewRows.map((review: any) => {
            const productName = productNameById(
              vendorProducts,
              review.product_id
            );

            const customerName = profileNameByAuthUserId(
              profiles,
              review.customer_auth_user_id
            );

            return (
              <div key={review.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "var(--gb-gold)",
                        fontSize: "1.1rem",
                        letterSpacing: 2,
                      }}
                    >
                      {renderStars(review.rating)}
                    </div>

                    <h3 style={{ marginTop: 8 }}>
                      <T en="Customer Review" ar="تقييم العميل" />
                    </h3>

                    <p style={{ color: "var(--muted)", marginTop: 4 }}>
                      {productName} · {customerName}
                    </p>
                  </div>

                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.85rem",
                      textAlign: "right",
                    }}
                  >
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {review.comment ? (
                  <p style={{ marginTop: 18, lineHeight: 1.7 }}>
                    {review.comment}
                  </p>
                ) : (
                  <p style={{ marginTop: 18, color: "var(--muted)" }}>
                    <T en="No written comment." ar="لا يوجد تعليق مكتوب." />
                  </p>
                )}

                {review.vendor_reply ? (
                  <div
                    style={{
                      marginTop: 18,
                      padding: 14,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <strong>
                      <T en="Vendor Reply" ar="رد التاجر" />
                    </strong>
                    <p style={{ marginTop: 8 }}>{review.vendor_reply}</p>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
