import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { redirect } from "next/navigation";

export default async function OwnerReviewsPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // Fetch reviews for all studios owned by this user
  const { data: reviews } = await supabaseAdmin
    .from("studio_reviews")
    .select(`
      *,
      studio:studios(id, name_en, name_ar),
      profile:profiles(full_name)
    `)
    .eq("studios.owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="section-padding">
      <div className="section-head">
        <span className="badge badge-gold"><T en="Reputation" ar="السمعة" /></span>
        <h1><T en="Studio Reviews" ar="مراجعات الاستديو" /></h1>
        <p><T en="See what artists are saying about your studios." ar="شاهد ما يقوله الفنانون عن استوديوهاتك." /></p>
      </div>

      <div className="reviews-list" style={{ marginTop: 40, display: 'grid', gap: 25 }}>
        {!reviews || reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 80 }}>
            <h3><T en="No reviews yet" ar="لا توجد مراجعات بعد" /></h3>
            <p><T en="Encourage your customers to leave a review after their booking." ar="شجع عملائك على ترك مراجعة بعد اكتمال حجزهم." /></p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div style={{ fontWeight: 700 }}>{review.profile?.full_name || 'Artist'}</div>
                   <div style={{ color: 'var(--gb-gold)' }}>{Array(review.rating).fill('⭐').join('')}</div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ marginTop: 15, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gb-gold)', marginBottom: 5 }}>
                  <T en="STUDIO" ar="الاستديو" />: {review.studio?.name_en}
                </div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>"{review.comment}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
