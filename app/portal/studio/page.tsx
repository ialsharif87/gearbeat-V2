import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export default async function StudioDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch data
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    profileResult,
    bookingsMonthResult,
    pendingBookingsResult,
    revenueResult,
    ratingResult,
    recentBookingsResult,
    studiosResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", { count: "exact", head: true })
      .eq("studios.owner_auth_user_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", { count: "exact", head: true })
      .eq("studios.owner_auth_user_id", user.id)
      .eq("status", "pending"),

    supabase
      .from("bookings")
      .select("total_amount, studios!inner(owner_auth_user_id)")
      .eq("studios.owner_auth_user_id", user.id)
      .eq("payment_status", "paid")
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("studio_reviews")
      .select("rating, studios!inner(owner_auth_user_id)")
      .eq("studios.owner_auth_user_id", user.id),

    supabase
      .from("bookings")
      .select(`
        id, 
        created_at, 
        total_amount, 
        status, 
        start_time,
        profiles:customer_id(full_name),
        studios(name)
      `)
      .eq("studios.owner_auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("studios")
      .select(`
        completion_score,
        certified_studios(
          status,
          studio_tiers(
            level,
            name_en,
            name_ar
          )
        ),
        merch_fulfillment_orders(
          status,
          kit_id
        )
      `)
      .eq("owner_auth_user_id", user.id)
      .order("completion_score", { ascending: false })
      .limit(1),
  ]);

  const ownerName = profileResult.data?.full_name || user.email?.split("@")[0] || "User";
  const totalBookingsMonth = bookingsMonthResult.count || 0;
  const pendingBookings = pendingBookingsResult.count || 0;
  
  const totalRevenue = (revenueResult.data || []).reduce(
    (acc, b) => acc + (b.total_amount || 0), 
    0
  );

  const ratings = ratingResult.data || [];
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "5.0";

  const recentBookings = recentBookingsResult.data || [];
  const studioData = studiosResult.data?.[0] as any;
  const studioScore = studioData?.completion_score || 0;
  const cert = studioData?.certified_studios?.[0];
  const tier = cert?.studio_tiers;
  const kitOrder = studioData?.merch_fulfillment_orders?.[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="gb-dashboard-page container">
      {/* SECTION 1: Welcome Bar */}
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Overview" ar="نظرة عامة للمالك" />
          </p>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-1px' }}>
            <T 
              en={`Welcome back, ${ownerName}`} 
              ar={`مرحباً بعودتك، ${ownerName}`} 
            />
          </h1>
          <p className="gb-muted-text" style={{ marginTop: '8px', fontSize: '1.1rem' }}>
            {new Date().toLocaleDateString("en-GB", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="welcome-badge">
          <span className="gb-dash-badge" style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'rgba(212, 175, 55, 0.05)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <T en="Premium Portal" ar="البوابة الفاخرة" />
          </span>
        </div>
      </section>

      {/* SECTION 2: Stats Row */}
      <section className="gb-dash-grid-4" style={{ marginBottom: '40px' }}>
        {[
          { icon: "📅", val: totalBookingsMonth, labelEn: "Month Bookings", labelAr: "حجوزات الشهر", color: 'var(--gb-gold)' },
          { icon: "⏳", val: pendingBookings, labelEn: "Action Required", labelAr: "طلبات معلقة", color: 'white' },
          { icon: "💰", val: `${totalRevenue.toLocaleString()} SAR`, labelEn: "Net Revenue", labelAr: "صافي الأرباح", color: 'var(--gb-teal)' },
          { icon: "⭐", val: avgRating, labelEn: "Studio Rating", labelAr: "تقييم الاستوديو", color: 'var(--gb-gold)' }
        ].map((stat, idx) => (
          <div key={idx} className="gb-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px 32px' }}>
            <div style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.2))' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stat.color, letterSpacing: '-0.5px' }}>{stat.val}</div>
              <div className="gb-eyebrow" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                <T en={stat.labelEn} ar={stat.labelAr} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 3: Two Columns */}
      <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1fr 380px', gap: '32px', marginBottom: '40px' }}>
        {/* LEFT COLUMN: Recent Bookings */}
        <section className="gb-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>
              <T en="Recent Activity" ar="النشاط الأخير" />
            </h2>
            <Link href="/portal/studio/bookings" className="gb-button gb-button-outline" style={{ height: '36px', fontSize: '0.8rem', padding: '0 16px' }}>
              <T en="View All" ar="عرض الكل" />
            </Link>
          </div>
          
          <div className="gb-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ textAlign: 'start' }}>
                  <th className="gb-detail-label" style={{ padding: '0 16px 12px' }}><T en="Customer" ar="العميل" /></th>
                  <th className="gb-detail-label" style={{ padding: '0 16px 12px' }}><T en="Studio" ar="الاستوديو" /></th>
                  <th className="gb-detail-label" style={{ padding: '0 16px 12px' }}><T en="Schedule" ar="الجدول" /></th>
                  <th className="gb-detail-label" style={{ padding: '0 16px 12px' }}><T en="Total" ar="الإجمالي" /></th>
                  <th className="gb-detail-label" style={{ padding: '0 16px 12px' }}><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any) => (
                    <tr key={booking.id} style={{ background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', borderRadius: '12px 0 0 12px', border: '1px solid var(--gb-border)', borderRight: 'none', color: 'white', fontWeight: 700 }}>
                        {booking.profiles?.full_name || "Guest"}
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--gb-border)', borderBottom: '1px solid var(--gb-border)', color: 'rgba(255,255,255,0.7)' }}>
                        {booking.studios?.name}
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--gb-border)', borderBottom: '1px solid var(--gb-border)' }}>
                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(booking.start_time)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{formatTime(booking.start_time)}</div>
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--gb-border)', borderBottom: '1px solid var(--gb-border)', color: 'var(--gb-gold)', fontWeight: 900 }}>
                        {booking.total_amount} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>SAR</span>
                      </td>
                      <td style={{ padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid var(--gb-border)', borderLeft: 'none', textAlign: 'right' }}>
                        <span 
                          className="gb-dash-badge"
                          style={{ 
                            padding: '4px 12px', 
                            fontSize: '0.7rem', 
                            background: 
                              booking.status === 'confirmed' ? 'rgba(15, 160, 138, 0.1)' :
                              booking.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                              'rgba(212, 175, 55, 0.1)',
                            color:
                              booking.status === 'confirmed' ? 'var(--gb-teal)' :
                              booking.status === 'cancelled' ? '#ef4444' :
                              'var(--gb-gold)',
                            border: '1px solid currentColor'
                          }}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                      <div className="gb-empty-state">
                        <T en="No recent activity found." ar="لا يوجد نشاط حديث." />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT COLUMN: Partner Status & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="gb-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}><T en="Partner Level" ar="مستوى الشريك" /></h2>
              <Link href="/portal/studio/partner-status" style={{ fontSize: '0.8rem', color: 'var(--gb-gold)', textDecoration: 'none', fontWeight: 700 }}>
                <T en="Details" ar="التفاصيل" />
              </Link>
            </div>
            
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--gb-border)', marginBottom: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>
                <T en={tier?.name_en || 'Verified Member'} ar={tier?.name_ar || 'عضو موثق'} />
              </h3>
              <div className="gb-dash-badge" style={{ 
                display: 'inline-flex',
                background: cert?.status === 'approved' ? 'rgba(15, 160, 138, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                color: cert?.status === 'approved' ? 'var(--gb-teal)' : 'var(--gb-gold)',
                border: '1px solid currentColor',
                padding: '4px 16px',
                fontSize: '0.7rem'
              }}>
                {cert?.status === 'approved' ? <T en="FULLY CERTIFIED" ar="موثق بالكامل" /> : <T en="UNDER REVIEW" ar="تحت المراجعة" />}
              </div>
            </div>

            {kitOrder && (
              <div style={{ background: 'rgba(212, 175, 55, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <div className="gb-detail-label" style={{ marginBottom: '8px' }}>
                  <T en="Welcome Package" ar="الهدية الترحيبية" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '1px' }}>{kitOrder.status.toUpperCase()}</strong>
                  <span style={{ fontSize: '1.4rem' }}>🎁</span>
                </div>
              </div>
            )}
          </section>

          <section className="gb-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: '0 0 24px' }}><T en="Management" ar="الإدارة" /></h2>
            <div className="gb-dashboard-stack" style={{ gap: '12px' }}>
              {[
                { href: "/portal/studio/studios", icon: "🎙️", label: "My Studios", ar: "استوديوهاتي" },
                { href: "/portal/studio/availability", icon: "🗓️", label: "Availability", ar: "التوافر" },
                { href: "/portal/studio/payouts", icon: "💳", label: "Earnings", ar: "الأرباح" },
                { href: "/portal/studio/boost", icon: "🚀", label: "Visibility", ar: "الظهور" },
                { href: "/portal/studio/settings", icon: "⚙️", label: "Settings", ar: "الإعدادات" },
              ].map(btn => (
                <Link 
                  key={btn.href}
                  href={btn.href} 
                  className="gb-button gb-button-outline"
                  style={{ justifyContent: 'flex-start', height: '48px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '12px', opacity: 0.6 }}>{btn.icon}</span> 
                  <T en={btn.label} ar={btn.ar} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* SECTION 4: Profile Completion Strip */}
      <section className="gb-card" style={{ padding: '32px 40px', borderInlineStart: '8px solid var(--gb-gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>
              <T en="Elevate Your Profile" ar="ارفع مستوى ملفك" />
            </h3>
            <p className="gb-muted-text" style={{ fontSize: '1rem' }}>
              {studioScore < 100 ? (
                <T 
                  en={`Your studio ranking profile is ${studioScore}% complete. Reach 100% for maximum visibility.`} 
                  ar={`ملف تصنيف الاستوديو الخاص بك مكتمل بنسبة ${studioScore}%. صل إلى 100% لأقصى قدر من الظهور.`} 
                />
              ) : (
                <T en="Your profile is optimized for maximum booking conversion. Excellent work!" ar="ملفك الشخصي محسن لأعلى معدلات الحجز. عمل ممتاز!" />
              )}
            </p>
          </div>
          {studioScore < 100 && (
            <Link href="/portal/studio/studios" className="gb-button gb-button-primary" style={{ padding: '0 32px' }}>
              <T en="Complete Now" ar="أكمل الآن" />
            </Link>
          )}
        </div>
        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--gb-border)' }}>
          <div 
            style={{ 
              width: `${studioScore}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--gb-teal), var(--gb-gold))',
              boxShadow: '0 0 20px rgba(15, 160, 138, 0.3)',
              borderRadius: '100px',
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          ></div>
        </div>
      </section>
    </main>
  );
}
