import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import ContractUploader from "@/components/contract-uploader";

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
    studioAppResult,
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
      .from("studio_applications")
      .select("*")
      .eq("email", user.email)
      .maybeSingle(),

    // ... rest of queries

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

  const studioApp = studioAppResult.data;
  const isFinalApproved = !!studioApp?.final_approved_at;

  // Fix: Check if lead has signed contract to bypass uploader
  const { data: leadData } = await supabase
    .from('provider_leads')
    .select('signed_contract_url')
    .eq('email', user.email)
    .maybeSingle();

  const isContractSigned = !!(leadData?.signed_contract_url || studioApp?.contract_url);

  if (studioApp && !isFinalApproved && !isContractSigned) {
    return (
      <main className="gb-dashboard-page container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>🚀</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 16 }}>
            <T en="Almost there!" ar="أوشكنا على الانتهاء!" />
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#888', lineHeight: 1.6, marginBottom: 48 }}>
            <T 
              en="Your application is approved. Now, please review your customized contract, sign it, and upload it here to activate your full dashboard." 
              ar="لقد تمت الموافقة على طلبك. الآن، يرجى مراجعة عقدك المخصص، توقيعه، ورفعه هنا لتفعيل لوحة التحكم الخاصة بك." 
            />
          </p>

          <div style={{ display: 'grid', gap: 32, textAlign: 'left' }}>
            {/* Step 1: Review Contract */}
            <div style={{ background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gb-gold)', marginBottom: 16 }}>
                1. <T en="Review Your Contract" ar="مراجعة العقد" />
              </h3>
              <div style={{ background: '#000', padding: 20, borderRadius: 12, fontSize: '0.9rem', color: '#ccc', maxHeight: 200, overflowY: 'auto', marginBottom: 20, whiteSpace: 'pre-wrap', border: '1px solid #1a1a1a' }}>
                {studioApp.contract_draft || "Your customized contract is being prepared..."}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                 <p style={{ fontSize: '0.85rem', color: '#888' }}>
                   <T en="Please use your browser's print function (Ctrl+P) to save the contract." ar="يرجى استخدام خاصية الطباعة في المتصفح (Ctrl+P) لحفظ العقد." />
                 </p>
              </div>
            </div>

            {/* Step 2: Upload */}
            <div style={{ background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gb-gold)', marginBottom: 16 }}>
                2. <T en="Upload Signed Contract" ar="رفع العقد الموقع" />
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20 }}>
                <T en="Please upload a scanned PDF or high-quality image of the signed contract." ar="يرجى رفع نسخة PDF ممسوحة ضوئياً أو صورة عالية الجودة للعقد الموقع." />
              </p>
              
              <ContractUploader appId={studioApp.id} currentUrl={studioApp.contract_url} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Original Dashboard Logic continues...
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

  return (
    <main className="studio-dash-root">
      {/* Top Header Section */}
      <header className="dash-welcome-section">
        <div className="welcome-text">
          <span className="eyebrow"><T en="PARTNER DASHBOARD" ar="لوحة تحكم الشريك" /></span>
          <h1>
            <T en="Welcome Back," ar="مرحباً بعودتك،" /> 
            <span className="owner-name"> {ownerName}</span>
          </h1>
          <p className="current-date">
            {new Date().toLocaleDateString("ar-SA", { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </p>
        </div>
        <div className="header-actions">
          <div className="status-badge">
            <span className="dot"></span>
            <T en="Live Status" ar="الحالة: مباشر" />
          </div>
        </div>
      </header>

      {/* Main Grid: Stats */}
      <section className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{totalBookingsMonth}</span>
            <span className="stat-label"><T en="Bookings this month" ar="حجوزات الشهر" /></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{pendingBookings}</span>
            <span className="stat-label"><T en="Pending Requests" ar="طلبات معلقة" /></span>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{totalRevenue.toLocaleString()} <small>SAR</small></span>
            <span className="stat-label"><T en="Net Revenue" ar="صافي الأرباح" /></span>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">{avgRating}</span>
            <span className="stat-label"><T en="Average Rating" ar="تقييم الاستوديو" /></span>
          </div>
        </div>
      </section>

      {/* Bottom Layout: Main Content & Sidebar */}
      <div className="dash-content-layout">
        {/* Left: Recent Activity */}
        <section className="main-content-area">
          <div className="section-header">
            <h2><T en="Recent Activity" ar="النشاط الأخير" /></h2>
            <Link href="/portal/studio/bookings" className="view-all-link">
              <T en="View All" ar="عرض الكل" />
            </Link>
          </div>

          <div className="activity-table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th><T en="Customer" ar="العميل" /></th>
                  <th><T en="Studio" ar="الاستوديو" /></th>
                  <th><T en="Schedule" ar="الموعد" /></th>
                  <th><T en="Total" ar="الإجمالي" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="customer-cell">{booking.profiles?.full_name || "Guest"}</td>
                      <td className="studio-cell">{booking.studios?.name}</td>
                      <td className="date-cell">
                        <div className="date">{formatDate(booking.start_time)}</div>
                        <div className="time">{formatTime(booking.start_time)}</div>
                      </td>
                      <td className="amount-cell">{booking.total_amount} <span>SAR</span></td>
                      <td className="status-cell">
                        <span className={`status-pill ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      <T en="No recent bookings found." ar="لا توجد حجوزات حديثة." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Quick Stats & Actions */}
        <aside className="side-content-area">
          <div className="side-card partner-status">
            <h3><T en="Partner Level" ar="مستوى الشريك" /></h3>
            <div className="tier-display">
              <div className="tier-trophy">🏆</div>
              <h4 className="tier-name">
                <T en={tier?.name_en || 'Verified'} ar={tier?.name_ar || 'عضو موثق'} />
              </h4>
              <span className={`cert-status ${cert?.status}`}>
                {cert?.status === 'approved' ? <T en="CERTIFIED" ar="موثق" /> : <T en="PENDING" ar="تحت المراجعة" />}
              </span>
            </div>
          </div>

          <div className="side-card quick-manage">
            <h3><T en="Management" ar="الإدارة" /></h3>
            <div className="action-links">
              {[
                { href: "/portal/studio/studios", icon: "🎙️", label: "My Studios", ar: "استوديوهاتي" },
                { href: "/portal/studio/availability", icon: "🗓️", label: "Availability", ar: "التوافر" },
                { href: "/portal/studio/payouts", icon: "💳", label: "Earnings", ar: "الأرباح" },
              ].map(item => (
                <Link key={item.href} href={item.href} className="side-link">
                  <span className="icon">{item.icon}</span>
                  <T en={item.label} ar={item.ar} />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .studio-dash-root {
          padding: 40px;
          color: #fff;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dash-welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
        }

        .welcome-text h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin: 8px 0;
          letter-spacing: -1px;
        }

        .owner-name { color: #D4AF37; }
        .eyebrow { font-size: 0.75rem; font-weight: 800; color: #666; letter-spacing: 2px; }
        .current-date { color: #888; font-size: 0.95rem; }

        .status-badge {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-badge .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 32px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          transition: transform 0.2s;
        }

        .stat-card:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.05); }
        .stat-icon { font-size: 2.5rem; opacity: 0.8; }
        .stat-value { display: block; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px; }
        .stat-label { font-size: 0.75rem; font-weight: 700; color: #666; text-transform: uppercase; }
        
        .stat-card.gold .stat-value { color: #D4AF37; }
        .stat-card.teal .stat-value { color: #10a08a; }

        .dash-content-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
        }

        .main-content-area {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 32px;
          padding: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .section-header h2 { font-size: 1.5rem; font-weight: 800; }
        .view-all-link { color: #D4AF37; text-decoration: none; font-size: 0.85rem; font-weight: 700; }

        .activity-table { width: 100%; border-collapse: collapse; }
        .activity-table th { text-align: start; padding: 16px; font-size: 0.75rem; color: #555; text-transform: uppercase; letter-spacing: 1px; }
        .activity-table td { padding: 20px 16px; border-top: 1px solid rgba(255, 255, 255, 0.04); }
        
        .customer-cell { font-weight: 700; color: #fff; }
        .studio-cell { color: #888; font-size: 0.9rem; }
        .date { font-weight: 600; font-size: 0.9rem; }
        .time { font-size: 0.75rem; color: #555; }
        .amount-cell { font-weight: 800; color: #D4AF37; }

        .status-pill {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.05);
        }

        .status-pill.confirmed { background: rgba(16, 160, 138, 0.1); color: #10a08a; }
        .status-pill.pending { background: rgba(212, 175, 55, 0.1); color: #D4AF37; }

        .side-content-area { display: grid; gap: 32px; align-content: start; }
        .side-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 28px;
          padding: 32px;
        }

        .side-card h3 { font-size: 1rem; font-weight: 800; margin-bottom: 24px; color: #666; }

        .tier-display { text-align: center; }
        .tier-trophy { font-size: 3rem; margin-bottom: 16px; }
        .tier-name { font-size: 1.4rem; font-weight: 900; margin-bottom: 12px; }
        .cert-status { font-size: 0.7rem; font-weight: 800; padding: 4px 16px; border-radius: 99px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .cert-status.approved { color: #10a08a; border-color: rgba(16, 160, 138, 0.3); background: rgba(16, 160, 138, 0.05); }

        .action-links { display: grid; gap: 12px; }
        .side-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .side-link:hover { background: rgba(255, 255, 255, 0.06); transform: translateX(-4px); }
        .side-link .icon { font-size: 1.2rem; opacity: 0.7; }

        /* RTL Handling */
        :global(html[dir="rtl"]) .studio-dash-root { text-align: right; direction: rtl; }
        :global(html[dir="rtl"]) .side-link:hover { transform: translateX(4px); }
        :global(html[dir="rtl"]) .activity-table th { text-align: right; }
      `}</style>
    </main>
  );
}
