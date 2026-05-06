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
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <span className="gb-dash-badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
            <T en="Reputation" ar="السمعة" />
          </span>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 0', color: 'white' }}>
            <T en="Studio Reviews" ar="مراجعات الاستديو" />
          </h1>

          <p className="gb-muted-text">
            <T en="See what artists are saying about your studios." ar="شاهد ما يقوله الفنانون عن استوديوهاتك." />
          </p>
        </div>
      </section>

      <div className="reviews-list" style={{ marginTop: 40, display: 'grid', gap: 25 }}>
        {!reviews || reviews.length === 0 ? (
          <div className="gb-empty-state">
            <h3><T en="No reviews yet" ar="لا توجد مراجعات بعد" /></h3>
            <p><T en="Encourage your customers to leave a review after their booking." ar="شجع عملائك على ترك مراجعة بعد اكتمال حجزهم." /></p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="gb-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{review.profile?.full_name || 'Artist'}</div>
                   <div style={{ color: 'var(--gb-gold)', marginTop: '4px' }}>{Array(review.rating).fill('⭐').join('')}</div>
                </div>
                <div style={{ color: 'var(--gb-text-muted)', fontSize: '0.85rem' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ marginTop: 15, padding: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--gb-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gb-gold)', marginBottom: 8, fontWeight: 800, textTransform: 'uppercase' }}>
                  <T en="STUDIO" ar="الاستديو" />: {review.studio?.name_en}
                </div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', color: 'white' }}>&quot;{review.comment}&quot;</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
