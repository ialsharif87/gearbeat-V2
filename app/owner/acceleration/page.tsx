import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

export default async function OwnerAccelerationPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  // Get all studios owned by this user
  const { data: studios } = await supabaseAdmin
    .from("studios")
    .select("id, name")
    .eq("owner_auth_user_id", user.id);

  const studiosList = studios || [];
  const studioIds = studiosList.map((s) => s.id);

  // Get active and recent accelerations
  const { data: accelerations } = await supabaseAdmin
    .from("studio_accelerations")
    .select(`
      id,
      studio_id,
      package_name,
      status,
      start_date,
      end_date,
      price,
      studios (name)
    `)
    .in("studio_id", studioIds.length ? studioIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  // Get some basic mock/recent performance daily (in a real app this would aggregate)
  const { data: performance } = await supabaseAdmin
    .from("studio_performance_daily")
    .select("impressions, profile_views, clicks, booking_requests, revenue")
    .in("studio_id", studioIds.length ? studioIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("date", { ascending: false });

  let totalImpressions = 0;
  let totalViews = 0;
  let totalClicks = 0;

  if (performance) {
    performance.forEach((p) => {
      totalImpressions += p.impressions || 0;
      totalViews += p.profile_views || 0;
      totalClicks += p.clicks || 0;
    });
  }

  return (
    <section className="page">
      <div className="container">
        <div className="section-head">
          <Link href="/owner" className="badge">
            ← <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>

          <h1>
            <T en="Growth & Acceleration" ar="النمو والتسريع" />
          </h1>

          <p>
            <T
              en="Boost your studio visibility in the GearBeat marketplace to reach more creators."
              ar="ارفع مستوى ظهور استوديوك في ماركت بليس جيربيت للوصول لمبدعين أكثر."
            />
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <span className="badge">
              <T en="Last 30 Days" ar="آخر 30 يوم" />
            </span>
            <h2>{totalImpressions}</h2>
            <p>
              <T en="Marketplace Impressions" ar="ظهور في المنصة" />
            </p>
          </div>

          <div className="card">
            <span className="badge">
              <T en="Last 30 Days" ar="آخر 30 يوم" />
            </span>
            <h2>{totalViews}</h2>
            <p>
              <T en="Profile Views" ar="زيارات للملف" />
            </p>
          </div>

          <div className="card">
            <span className="badge">
              <T en="Last 30 Days" ar="آخر 30 يوم" />
            </span>
            <h2>{totalClicks}</h2>
            <p>
              <T en="Total Clicks" ar="النقرات الكلية" />
            </p>
          </div>
        </div>

        <div style={{ height: 40 }} />

        <h2>
          <T en="Available Acceleration Packages" ar="باقات التسريع المتاحة" />
        </h2>

        <div className="grid">
          <div className="card">
            <h3>Starter Boost</h3>
            <p style={{ color: "var(--gb-muted)" }}>7 Days</p>
            <ul style={{ margin: "14px 0", paddingLeft: 20, color: "var(--gb-cream)" }}>
              <li>Marketplace priority</li>
              <li>Featured badge</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              Request Boost
            </button>
          </div>

          <div className="card" style={{ borderColor: "var(--gb-gold)" }}>
            <h3>Growth Boost</h3>
            <p style={{ color: "var(--gb-muted)" }}>14 Days</p>
            <ul style={{ margin: "14px 0", paddingLeft: 20, color: "var(--gb-cream)" }}>
              <li>Higher priority</li>
              <li>Featured badge</li>
              <li>Homepage featured area</li>
            </ul>
            <button className="btn" style={{ width: "100%" }}>
              Request Boost
            </button>
          </div>

          <div className="card">
            <h3>Premium Boost</h3>
            <p style={{ color: "var(--gb-muted)" }}>30 Days</p>
            <ul style={{ margin: "14px 0", paddingLeft: 20, color: "var(--gb-cream)" }}>
              <li>Highest priority</li>
              <li>First-page placement</li>
              <li>Featured badge</li>
              <li>Performance report</li>
            </ul>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              Request Boost
            </button>
          </div>
        </div>

        <div style={{ height: 40 }} />

        <h2>
          <T en="Acceleration History" ar="سجل التسريع" />
        </h2>

        {accelerations && accelerations.length > 0 ? (
          <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gb-border)", color: "var(--gb-muted)" }}>
                  <th style={{ padding: 12 }}>Studio</th>
                  <th style={{ padding: 12 }}>Package</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Start Date</th>
                  <th style={{ padding: 12 }}>End Date</th>
                  <th style={{ padding: 12 }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {accelerations.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--gb-border)" }}>
                    <td style={{ padding: 12 }}>{a.studios?.name}</td>
                    <td style={{ padding: 12 }}>{a.package_name}</td>
                    <td style={{ padding: 12 }}>
                      <span className="badge">{a.status}</span>
                    </td>
                    <td style={{ padding: 12 }}>{a.start_date ? new Date(a.start_date).toLocaleDateString() : "-"}</td>
                    <td style={{ padding: 12 }}>{a.end_date ? new Date(a.end_date).toLocaleDateString() : "-"}</td>
                    <td style={{ padding: 12 }}>{a.price} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 20 }}>
            <p>
              <T en="You have no active or previous acceleration packages." ar="ليس لديك أي باقات تسريع سابقة أو حالية." />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
