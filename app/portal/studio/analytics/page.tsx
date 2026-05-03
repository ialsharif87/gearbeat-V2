"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

type Booking = {
  id: string;
  booking_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  start_time: string;
  studio_id: string;
  studio?: { name: string };
};

type StudioPerformance = {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
  rank?: number;
};

export default function OwnerAnalyticsPage() {
  const [rangeType, setRangeType] = useState<"7D" | "30D" | "CM" | "YTD" | "LY" | "Custom">("CM");
  const [customRange, setCustomRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    bookings: Booking[];
    studios: any[];
    avgRating: number;
    boostStatus: { total_commission_percent: number; is_boosted: boolean };
    ranking: { rank: number; total: number };
    performance: StudioPerformance[];
  } | null>(null);

  const supabase = createClient();

  // Helper to get date objects for ranges
  const rangeDates = useMemo(() => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    let label = "";

    switch (rangeType) {
      case "7D":
        from.setDate(now.getDate() - 7);
        label = "Last 7 Days";
        break;
      case "30D":
        from.setDate(now.getDate() - 30);
        label = "Last 30 Days";
        break;
      case "CM":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        break;
      case "YTD":
        from = new Date(now.getFullYear(), 0, 1);
        label = `Year to Date ${now.getFullYear()}`;
        break;
      case "LY":
        from = new Date(now.getFullYear() - 1, 0, 1);
        to = new Date(now.getFullYear() - 1, 11, 31);
        label = `Last Year ${now.getFullYear() - 1}`;
        break;
      case "Custom":
        from = customRange.from ? new Date(customRange.from) : from;
        to = customRange.to ? new Date(customRange.to) : to;
        label = "Custom Range";
        break;
    }

    return { from, to, label };
  }, [rangeType, customRange]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch owned studios
      const { data: studios } = await supabase
        .from("studios")
        .select("id, name, owner_auth_user_id")
        .eq("owner_auth_user_id", user.id);

      if (!studios || studios.length === 0) {
        setLoading(false);
        setData(null);
        return;
      }

      const studioIds = studios.map(s => s.id);

      // 2. Fetch bookings in range
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, studio:studios(name)")
        .in("studio_id", studioIds)
        .gte("booking_date", rangeDates.from.toISOString())
        .lte("booking_date", rangeDates.to.toISOString())
        .order("booking_date", { ascending: false });

      // 3. Fetch Average Rating
      const { data: reviews } = await supabase
        .from("studio_reviews")
        .select("rating")
        .in("studio_id", studioIds);
      
      const avgRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // 4. Fetch Boost Status (from the new table)
      const { data: boost } = await supabase
        .from("studio_boost_subscriptions")
        .select("total_commission_percent, status")
        .eq("owner_auth_user_id", user.id)
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .maybeSingle();

      // 5. Ranking (Simplified logic: count studios with more bookings this month)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: totalStudios } = await supabase
        .from("studios")
        .select("*", { count: "exact", head: true });

      // Get booking counts for ALL studios to find rank
      // In a real app this would be a specialized function or cached view
      const { data: allBookings } = await supabase
        .from("bookings")
        .select("studio_id")
        .gte("booking_date", startOfMonth);
      
      const counts: Record<string, number> = {};
      allBookings?.forEach(b => {
        counts[b.studio_id] = (counts[b.studio_id] || 0) + 1;
      });

      const myMaxBookings = Math.max(...studioIds.map(id => counts[id] || 0));
      const rankedHigher = Object.values(counts).filter(c => c > myMaxBookings).length;

      // 6. Performance per studio
      const performance: StudioPerformance[] = studios.map(s => {
        const studioBookings = bookings?.filter(b => b.studio_id === s.id) || [];
        return {
          id: s.id,
          name: s.name,
          bookings: studioBookings.length,
          revenue: studioBookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0),
          rating: 0, // Would need per-studio review fetch
        };
      });

      setData({
        bookings: (bookings || []) as Booking[],
        studios,
        avgRating,
        boostStatus: {
          total_commission_percent: boost?.total_commission_percent || 15,
          is_boosted: !!boost
        },
        ranking: {
          rank: rankedHigher + 1,
          total: totalStudios || 0
        },
        performance: performance.sort((a, b) => b.revenue - a.revenue)
      });
      setLoading(false);
    }

    fetchData();
  }, [rangeDates, supabase]);

  const exportToExcel = async () => {
    if (!data?.bookings) return;
    const rows = [
      ["Date", "Studio", "Amount (SAR)", "Status", "Payment"],
      ...data.bookings.map(b => [
        b.booking_date,
        b.studio?.name || "Studio",
        b.total_amount,
        b.status,
        b.payment_status
      ])
    ];
    
    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gearbeat-report-${rangeType}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    if (!data?.bookings) return [];
    
    // Group by date
    const groups: Record<string, { date: string, revenue: number, bookings: number }> = {};
    
    // Fill all dates in range if 30 days or less
    const diffDays = Math.ceil((rangeDates.to.getTime() - rangeDates.from.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 31) {
      for (let d = new Date(rangeDates.from); d <= rangeDates.to; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split('T')[0];
        groups[ds] = { date: ds, revenue: 0, bookings: 0 };
      }
    }

    data.bookings.forEach(b => {
      const date = b.booking_date.split('T')[0];
      if (!groups[date]) {
        groups[date] = { date, revenue: 0, bookings: 0 };
      }
      groups[date].bookings += 1;
      if (b.payment_status === 'paid') {
        groups[date].revenue += Number(b.total_amount);
      }
    });

    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, rangeDates]);

  const revenue = data?.bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

  const totalBookings = data?.bookings.length || 0;

  if (loading) {
    return (
      <main className="gb-dashboard-page">
        <div className="gb-empty-state">
          <p><T en="Loading analytics..." ar="جاري تحميل التحليلات..." /></p>
        </div>
      </main>
    );
  }

  return (
    <main className="gb-dashboard-page" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <section className="gb-dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <p className="gb-eyebrow"><T en="Analytics" ar="التحليلات" /></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1><T en="Studio Insights" ar="رؤى الاستوديو" /></h1>
            <button 
              onClick={exportToExcel}
              className="gb-button gb-button-secondary"
              style={{ 
                border: '1px solid #cfa86e', 
                color: '#cfa86e', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📥</span>
              <T en="Export Excel" ar="تصدير Excel" />
            </button>
          </div>
          <p className="gb-muted-text">{rangeDates.label}</p>
        </div>

        <div className="gb-action-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {["7D", "30D", "CM", "YTD", "LY", "Custom"].map((type) => (
            <button
              key={type}
              onClick={() => setRangeType(type as any)}
              className={`gb-button ${rangeType === type ? "" : "gb-button-secondary"}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {rangeType === "Custom" && (
        <section className="gb-card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="date" 
            className="gb-input" 
            value={customRange.from} 
            onChange={e => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
          />
          <span><T en="to" ar="إلى" /></span>
          <input 
            type="date" 
            className="gb-input" 
            value={customRange.to} 
            onChange={e => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
          />
        </section>
      )}

      {/* KPI Cards */}
      <section className="gb-dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="gb-card gb-dash-card" style={{ borderLeft: '4px solid #cfa86e', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', opacity: 0.3 }}>💰</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Revenue" ar="الإيراد" /></span>
          </div>
          <div className="gb-dash-stat" style={{ fontSize: '2.5rem' }}>{revenue}</div>
          <p style={{ color: revenue > 0 ? '#22c55e' : '#888', margin: 0 }}>
            {revenue > 0 ? '↑' : '—'} <T en="SAR" ar="ريال" />
          </p>
        </div>

        <div className="gb-card gb-dash-card" style={{ borderLeft: '4px solid #3b82f6', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', opacity: 0.3 }}>📅</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Bookings" ar="الحجوزات" /></span>
          </div>
          <div className="gb-dash-stat" style={{ fontSize: '2.5rem' }}>{totalBookings}</div>
          <p style={{ color: totalBookings > 0 ? '#22c55e' : '#888', margin: 0 }}>
            {totalBookings > 0 ? '↑' : '—'} <T en="confirmed + completed" ar="مؤكد + مكتمل" />
          </p>
        </div>

        <div className="gb-card gb-dash-card" style={{ borderLeft: '4px solid #22c55e', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', opacity: 0.3 }}>⭐</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Avg Rating" ar="متوسط التقييم" /></span>
          </div>
          <div className="gb-dash-stat" style={{ fontSize: '2.5rem' }}>{data?.avgRating.toFixed(1)}</div>
          <p style={{ color: data?.avgRating && data.avgRating > 0 ? '#22c55e' : '#888', margin: 0 }}>
            {data?.avgRating && data.avgRating > 0 ? '↑' : '—'} <T en="out of 5" ar="من 5" />
          </p>
        </div>

        <div className="gb-card gb-dash-card" style={{ borderLeft: '4px solid #a855f7', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '2rem', opacity: 0.3 }}>🚀</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Commission Rate" ar="نسبة العمولة" /></span>
          </div>
          <div className="gb-dash-stat" style={{ fontSize: '2.5rem' }}>{data?.boostStatus.total_commission_percent}%</div>
          <p className={data?.boostStatus.is_boosted ? "neon-text" : "gb-muted-text"} style={{ margin: 0 }}>
            {data?.boostStatus.is_boosted ? <T en="Boosted" ar="معزز" /> : <T en="Standard" ar="أساسي" />}
          </p>
        </div>
      </section>

      {/* Summary Strip */}
      <section style={{ 
        background: '#0d0d0d', 
        borderTop: '1px solid #1a1a1a', 
        borderBottom: '1px solid #1a1a1a', 
        padding: '16px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div>
          <span className="gb-muted-text" style={{ fontSize: '0.8rem' }}><T en="Completion Rate" ar="معدل الإكمال" /></span>
          <div style={{ color: 'var(--gb-gold)', fontWeight: 700, fontSize: '1.2rem' }}>
            {totalBookings > 0 ? Math.round((data?.bookings.filter(b => b.status === 'confirmed').length || 0) / totalBookings * 100) : 0}%
          </div>
        </div>
        <div>
          <span className="gb-muted-text" style={{ fontSize: '0.8rem' }}><T en="Avg Booking Value" ar="متوسط قيمة الحجز" /></span>
          <div style={{ color: 'var(--gb-gold)', fontWeight: 700, fontSize: '1.2rem' }}>
            {totalBookings > 0 ? Math.round(revenue / totalBookings) : 0} SAR
          </div>
        </div>
        <div>
          <span className="gb-muted-text" style={{ fontSize: '0.8rem' }}><T en="Net Revenue" ar="الإيراد الصافي" /></span>
          <div style={{ color: 'var(--gb-gold)', fontWeight: 700, fontSize: '1.2rem' }}>
            {Math.round(revenue - (revenue * (data?.boostStatus.total_commission_percent || 15) / 100))} SAR
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="gb-card" style={{ marginBottom: '32px', padding: '32px' }}>
        <div className="gb-card-header" style={{ marginBottom: '24px' }}>
          <h3><T en="Growth & Revenue" ar="النمو والإيرادات" /></h3>
        </div>
        <div style={{ width: '100%', height: 300, position: 'relative' }}>
          {chartData.length === 0 && (
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              borderRadius: '8px'
            }}>
              <p className="gb-muted-text"><T en="No bookings in this period" ar="لا توجد حجوزات في هذه الفترة" /></p>
            </div>
          )}
          <Line
            data={{
              labels: chartData.map(d => d.date),
              datasets: [
                {
                  label: "Revenue (SAR)",
                  data: chartData.map(d => d.revenue),
                  borderColor: "#cfa86e",
                  backgroundColor: "rgba(207,168,110,0.1)",
                  tension: 0.4,
                },
                {
                  label: "Bookings",
                  data: chartData.map(d => d.bookings),
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59,130,246,0.1)",
                  tension: 0.4,
                  yAxisID: "y1",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: { 
                  labels: { color: "#888" }
                },
              },
              scales: {
                x: { 
                  ticks: { color: "#888" },
                  grid: { color: "#1a1a1a" }
                },
                y: { 
                  ticks: { 
                    color: "#cfa86e",
                    callback: (value) => `${value} SAR`
                  },
                  grid: { color: "#1a1a1a" },
                  position: "left"
                },
                y1: {
                  ticks: { 
                    color: "#3b82f6",
                    callback: (value) => `${value}`
                  },
                  grid: { drawOnChartArea: false },
                  position: "right"
                },
              },
            }}
          />
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Bookings Table */}
        <section className="gb-card">
          <div className="gb-card-header">
            <h3><T en="Recent Activity" ar="النشاط الأخير" /></h3>
          </div>
          <div className="gb-table-wrap">
            <table className="gb-dash-table">
              <thead>
                <tr>
                  <th><T en="Date" ar="التاريخ" /></th>
                  <th><T en="Studio" ar="الاستوديو" /></th>
                  <th><T en="Amount" ar="المبلغ" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {data?.bookings.slice(0, 10).map((b) => (
                  <tr key={b.id}>
                    <td>{b.booking_date}</td>
                    <td>{b.studio?.name}</td>
                    <td><strong>{b.total_amount} SAR</strong></td>
                    <td>
                      <span className={`gb-dash-badge ${b.status === 'confirmed' ? 'gb-dash-badge-confirmed' : 'gb-dash-badge-pending'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.bookings || data.bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }} className="gb-muted-text">
                      <T en="No data for this period" ar="لا توجد بيانات لهذه الفترة" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ranking */}
        <section className="gb-dashboard-stack" style={{ gap: '24px' }}>
          <section className="gb-card">
            <div className="gb-card-header">
              <h3><T en="Studio Ranking" ar="تصنيف الاستوديو" /></h3>
            </div>
            
            {data?.studios.length === 1 ? (
              <div style={{ padding: '20px 0' }}>
                <p className="gb-muted-text" style={{ marginBottom: '16px' }}>
                  <T en="Your studio rank among all GearBeat studios" ar="تصنيف استوديوك بين جميع استوديوهات GearBeat" />
                </p>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gb-gold)' }}>
                  #{data.ranking.rank} <small style={{ fontSize: '1rem', color: '#888' }}>/ {data.ranking.total}</small>
                </div>
                <div className="gb-section-divider" style={{ margin: '20px 0' }} />
                <div style={{ height: '8px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.max(5, 100 - (data.ranking.rank / data.ranking.total) * 100)}%`, 
                      height: '100%', 
                      background: 'var(--gb-gold)' 
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className="gb-table-wrap">
                <table className="gb-dash-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th><T en="Studio" ar="الاستوديو" /></th>
                      <th><T en="Revenue" ar="الإيراد" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.performance.map((p, i) => (
                      <tr key={p.id}>
                        <td>#{i+1} {p.name}</td>
                        <td style={{ color: 'var(--gb-gold)' }}>{p.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="gb-card" style={{ background: 'linear-gradient(to bottom right, #1a1a1a, #111)' }}>
            <h3><T en="Quick Insight" ar="رؤية سريعة" /></h3>
            <p className="gb-muted-text" style={{ fontSize: '0.9rem', marginTop: '12px' }}>
              <T 
                en="Focus on increasing your studio availability during peak weekends to capture more revenue." 
                ar="ركز على زيادة توافر الاستوديو خلال عطلات نهاية الأسبوع لاقتناص المزيد من الإيرادات." 
              />
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
