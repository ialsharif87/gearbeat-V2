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
      .select("completion_score")
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
  const studioScore = studiosResult.data?.[0]?.completion_score || 0;

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
    <div className="dashboard-container">
      {/* SECTION 1: Welcome Bar */}
      <div className="welcome-bar">
        <div className="welcome-text">
          <h1>
            <T 
              en={`Welcome, ${ownerName}`} 
              ar={`مرحباً، ${ownerName}`} 
            />
          </h1>
          <p className="date-display">
            {new Date().toLocaleDateString("en-GB", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="welcome-badge">
          <span className="badge-gold">
            <T en="Studio Portal" ar="بوابة الاستوديو" />
          </span>
        </div>
      </div>

      {/* SECTION 2: Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{totalBookingsMonth}</div>
            <div className="stat-label">
              <T en="Bookings this month" ar="حجوزات هذا الشهر" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{pendingBookings}</div>
            <div className="stat-label">
              <T en="Pending bookings" ar="حجوزات معلقة" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{totalRevenue.toLocaleString()} <span className="currency">SAR</span></div>
            <div className="stat-label">
              <T en="Revenue this month" ar="أرباح هذا الشهر" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{avgRating}</div>
            <div className="stat-label">
              <T en="Rating average" ar="متوسط التقييم" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Two Columns */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: Recent Bookings */}
        <div className="grid-left">
          <div className="content-card">
            <div className="card-header">
              <h2><T en="Recent Bookings" ar="أحدث الحجوزات" /></h2>
              <Link href="/portal/studio/bookings" className="view-all">
                <T en="View all bookings" ar="عرض كل الحجوزات" />
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th><T en="Customer" ar="العميل" /></th>
                    <th><T en="Studio" ar="الاستوديو" /></th>
                    <th><T en="Date" ar="التاريخ" /></th>
                    <th><T en="Time" ar="الوقت" /></th>
                    <th><T en="Amount" ar="المبلغ" /></th>
                    <th><T en="Status" ar="الحالة" /></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking: any) => (
                      <tr key={booking.id}>
                        <td>{booking.profiles?.full_name || "Guest"}</td>
                        <td>{booking.studios?.name}</td>
                        <td>{formatDate(booking.start_time)}</td>
                        <td>{formatTime(booking.start_time)}</td>
                        <td>{booking.total_amount} SAR</td>
                        <td>
                          <span className={`status-pill ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <T en="No recent bookings found" ar="لا توجد حجوزات حديثة" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions */}
        <div className="grid-right">
          <div className="content-card actions-card">
            <h2><T en="Quick Actions" ar="إجراءات سريعة" /></h2>
            <div className="actions-list">
              <Link href="/portal/studio/studios" className="action-btn">
                <span>🎙️</span> <T en="My Studios" ar="استوديوهاتي" />
              </Link>
              <Link href="/portal/studio/availability" className="action-btn">
                <span>📅</span> <T en="Availability" ar="التوافر" />
              </Link>
              <Link href="/portal/studio/payouts" className="action-btn">
                <span>💰</span> <T en="Payouts" ar="التحويلات المالية" />
              </Link>
              <Link href="/portal/studio/boost" className="action-btn">
                <span>🚀</span> <T en="Boost" ar="التسريع" />
              </Link>
              <Link href="/portal/studio/reviews" className="action-btn">
                <span>⭐</span> <T en="Reviews" ar="التقييمات" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Bottom Strip */}
      <div className="bottom-strip">
        <div className="progress-card">
          <div className="progress-info">
            <div className="progress-text">
              <h3><T en="Complete your profile" ar="أكمل ملفك الشخصي" /></h3>
              {studioScore < 100 ? (
                <p>
                  <T 
                    en={`Your studio profile is ${studioScore}% complete`} 
                    ar={`ملف الاستوديو الخاص بك مكتمل بنسبة ${studioScore}%`} 
                  />
                </p>
              ) : (
                <p><T en="Your profile is 100% complete. Great job!" ar="ملفك الشخصي مكتمل 100%. عمل رائع!" /></p>
              )}
            </div>
            {studioScore < 100 && (
              <Link href="/portal/studio/studios" className="btn-gold-small">
                <T en="Complete now" ar="أكمل الآن" />
              </Link>
            )}
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${studioScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container {
          padding: 20px 0;
          color: var(--gb-text, #fff);
          background: var(--gb-bg, #0a0a0a);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .welcome-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          margin: 0 0 4px;
        }

        .date-display {
          color: var(--gb-muted, #888);
          font-size: 0.9rem;
        }

        .badge-gold {
          background: rgba(207, 168, 110, 0.1);
          border: 1px solid var(--gb-gold, #cfa86e);
          color: var(--gb-gold, #cfa86e);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--gb-gold, #cfa86e);
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--gb-gold, #cfa86e);
          margin-bottom: 4px;
        }

        .stat-number .currency {
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--gb-muted, #888);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 7fr 3fr;
          gap: 32px;
        }

        .content-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h2 {
          font-size: 1.2rem;
          margin: 0;
        }

        .view-all {
          color: var(--gb-gold, #cfa86e);
          font-size: 0.9rem;
          text-decoration: none;
        }

        .view-all:hover {
          text-decoration: underline;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .dashboard-table th {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #222;
          color: var(--gb-muted, #888);
          font-weight: 600;
        }

        [dir="rtl"] .dashboard-table th {
          text-align: right;
        }

        .dashboard-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #1a1a1a;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pill.pending { background: rgba(255, 193, 7, 0.15); color: #ffc107; }
        .status-pill.confirmed { background: rgba(40, 167, 69, 0.15); color: #28a745; }
        .status-pill.cancelled { background: rgba(220, 53, 69, 0.15); color: #dc3545; }

        .actions-card h2 {
          font-size: 1.2rem;
          margin: 0 0 24px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 600;
        }

        .action-btn:hover {
          background: rgba(207, 168, 110, 0.1);
          border-color: var(--gb-gold, #cfa86e);
          color: var(--gb-gold, #cfa86e);
        }

        .bottom-strip {
          margin-top: 10px;
        }

        .progress-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .progress-text h3 {
          font-size: 1.1rem;
          margin: 0 0 4px;
        }

        .progress-text p {
          color: var(--gb-muted, #888);
          font-size: 0.9rem;
          margin: 0;
        }

        .btn-gold-small {
          background: var(--gb-gold, #cfa86e);
          color: #000;
          padding: 8px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .progress-bar-container {
          width: 100%;
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: #222;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gb-gold, #cfa86e);
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
          .welcome-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      ` }} />
    </div>
  );
}
