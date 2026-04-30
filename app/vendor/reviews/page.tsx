import { requireVendorLayoutAccess } from "../../../lib/route-guards";
import T from "../../../components/t";
import Link from "next/link";

export default async function VendorReviewsPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch reviews for this vendor's products
  const { data: reviews } = await supabaseAdmin
    .from("marketplace_reviews")
    .select(`
      *,
      product:marketplace_products(id, name_en, name_ar, slug),
      profile:profiles(full_name)
    `)
    .eq("marketplace_products.vendor_id", user.id) // This join might need careful handling in Supabase or a view
    .order("created_at", { ascending: false });

  // Note: If the direct join above fails due to RLS or schema, 
  // we would fetch products first then reviews.

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge badge-gold"><T en="Feedback" ar="المراجعات" /></span>
          <h1><T en="Customer Reviews" ar="تقييمات العملاء" /></h1>
          <p><T en="Listen to your customers and improve your gear business." ar="استمع لعملائك وطوّر تجارتك في عالم المعدات." /></p>
        </div>
      </div>

      <div className="reviews-list" style={{ marginTop: 30, display: 'grid', gap: 20 }}>
        {!reviews || reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>⭐</div>
            <h3><T en="No reviews yet" ar="لا توجد مراجعات بعد" /></h3>
            <p><T en="Reviews will appear here once customers start rating your products." ar="ستظهر المراجعات هنا بمجرد أن يبدأ العملاء بتقييم منتجاتك." /></p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="card review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{review.profile?.full_name || 'Customer'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gb-gold)' }}>
                    {Array(review.rating).fill('⭐').join('')}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              <div style={{ marginBottom: 15, padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <Link href={`/gear/products/${review.product?.slug}`} className="text-link" style={{ fontSize: '0.9rem' }}>
                  {review.product?.name_en}
                </Link>
                <p style={{ marginTop: 8, fontStyle: 'italic' }}>"{review.comment}"</p>
              </div>

              {review.vendor_reply ? (
                <div className="vendor-reply" style={{ borderLeft: '3px solid var(--gb-gold)', paddingLeft: 15, marginTop: 15 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gb-gold)', fontWeight: 700 }}>
                    <T en="YOUR REPLY" ar="ردك" />
                  </label>
                  <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>{review.vendor_reply}</p>
                </div>
              ) : (
                <button className="btn btn-secondary btn-small" style={{ marginTop: 10 }}>
                  <T en="Reply to review" ar="الرد على المراجعة" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
