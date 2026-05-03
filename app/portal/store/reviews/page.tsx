import Link from "next/link";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function renderStars(rating: number) {
  const filled = Math.round(rating);
  return (
    <span style={{ color: "#cfa86e", fontSize: "1.1rem", letterSpacing: "2px" }}>
      {"★".repeat(filled)}{"☆".repeat(5 - filled)}
    </span>
  );
}

export default async function VendorReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Step 1: Fetch reviews with joined data
  // Using marketplace_product_reviews as requested in prompt
  const { data: reviews, error } = await supabase
    .from("marketplace_product_reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      product:marketplace_products!inner(
        id,
        name_en,
        name_ar,
        vendor_auth_user_id
      ),
      reviewer:profiles(
        full_name
      )
    `)
    .eq("marketplace_products.vendor_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  const reviewRows = reviews || [];
  const totalReviews = reviewRows.length;

  // Step 3: Summary Calculations
  const averageRating = totalReviews > 0
    ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviewRows.filter(r => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <main 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px',
        color: '#fff'
      }}
    >
      {/* Header */}
      <section style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>
          <T en="Customer Reviews" ar="تقييمات العملاء" />
        </h1>
      </section>

      {/* Step 3: Summary Bar */}
      <section 
        style={{ 
          background: '#111', 
          borderRadius: '20px', 
          border: '1px solid #1e1e1e', 
          padding: '24px', 
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '40px',
          alignItems: 'center'
        }}
      >
        <div style={{ textAlign: 'center', borderRight: '1px solid #222', paddingRight: '40px' }}>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '8px' }}>
            <T en="Average Rating" ar="متوسط التقييم" />
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#cfa86e', lineHeight: 1 }}>
            {averageRating.toFixed(1)}
          </div>
          <div style={{ marginTop: '8px' }}>
            {renderStars(averageRating)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
            {totalReviews} <T en="Total Reviews" ar="إجمالي التقييمات" />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          {distribution.map(item => (
            <div key={item.star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#888', width: '30px' }}>{item.star}★</span>
              <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${item.percentage}%`, height: '100%', background: '#cfa86e' }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: '#666', width: '40px' }}>{Math.round(item.percentage)}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Step 2: Review List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {reviewRows.length === 0 ? (
          /* Step 4: Empty State */
          <div 
            style={{ 
              background: '#111', 
              borderRadius: '16px', 
              padding: '60px 24px', 
              textAlign: 'center',
              border: '1px solid #1e1e1e'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⭐</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              <T en="No reviews yet" ar="لا توجد تقييمات بعد" />
            </h2>
            <p style={{ color: '#666' }}>
              <T en="Reviews will appear here once customers rate your products." ar="ستظهر التقييمات هنا بعد أن يقيّم العملاء منتجاتك." />
            </p>
          </div>
        ) : (
          reviewRows.map((review: any) => (
            <div 
              key={review.id}
              style={{
                background: '#111',
                border: '1px solid #1e1e1e',
                borderRadius: '16px',
                padding: '20px 24px'
              }}
            >
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Link 
                  href={`/portal/store/products/${review.product?.id}`}
                  style={{ color: '#cfa86e', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}
                >
                  {review.product?.name_en || review.product?.name_ar}
                </Link>
                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                  {formatDate(review.created_at)}
                </span>
              </div>

              {/* Middle Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {renderStars(review.rating)}
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {review.rating.toFixed(1)} / 5
                </span>
              </div>

              {/* Bottom Row */}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#888', marginBottom: '8px' }}>
                  {review.reviewer?.full_name || <T en="Anonymous" ar="مجهول" />}
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#ccc' }}>
                  {review.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
