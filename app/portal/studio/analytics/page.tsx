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
    <main 
      className="gb-dashboard-page" 
      style={{ 
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)', 
        minHeight: '100vh',
        padding: '32px',
        color: '#fff'
      }}
    >
      <section 
        className="gb-dashboard-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px' 
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Studio Insights" ar="رؤى الاستوديو" />
          </h1>
          <p style={{ color: '#cfa86e', fontSize: '0.9rem', marginTop: '4px', fontWeight: 500 }}>
            {rangeDates.label}
          </p>
        </div>

        <button 
          onClick={exportToExcel}
          style={{ 
            background: 'linear-gradient(135deg, #cfa86e, #b8923a)', 
            color: '#000', 
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(207, 168, 110, 0.2)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📥</span>
          <T en="Export Excel" ar="تصدير Excel" />
        </button>
      </section>

      <div 
        className="gb-range-nav" 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          background: '#111', 
          padding: '6px', 
          borderRadius: '99px', 
          border: '1px solid #222',
          width: 'fit-content',
          marginBottom: '40px',
          overflowX: 'auto'
        }}
      >
        {["7D", "30D", "CM", "YTD", "LY", "Custom"].map((type) => (
          <button
            key={type}
            onClick={() => setRangeType(type as any)}
            style={{ 
              padding: '8px 24px', 
              fontSize: '0.85rem',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: rangeType === type ? '#cfa86e' : 'transparent',
              color: rangeType === type ? '#000' : '#888',
              fontWeight: rangeType === type ? 700 : 400
            }}
          >
            {type}
          </button>
        ))}
      </div>

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
        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #cfa86e'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Revenue" ar="الإيراد" />
            </span>
            <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>💰</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{revenue}</div>
          <p style={{ color: revenue > 0 ? '#22c55e' : '#666', fontSize: '0.75rem', margin: 0 }}>
            {revenue > 0 ? '↑' : '—'} <T en="SAR" ar="ريال" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>💰</span>
        </div>

        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #3b82f6'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Bookings" ar="الحجوزات" />
            </span>
            <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>📅</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{totalBookings}</div>
          <p style={{ color: totalBookings > 0 ? '#22c55e' : '#666', fontSize: '0.75rem', margin: 0 }}>
            {totalBookings > 0 ? '↑' : '—'} <T en="confirmed + completed" ar="مؤكد + مكتمل" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>📅</span>
        </div>

        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #22c55e'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Avg Rating" ar="متوسط التقييم" />
            </span>
            <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>⭐</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{data?.avgRating.toFixed(1)}</div>
          <p style={{ color: data?.avgRating && data.avgRating > 0 ? '#22c55e' : '#666', fontSize: '0.75rem', margin: 0 }}>
            {data?.avgRating && data.avgRating > 0 ? '↑' : '—'} <T en="out of 5" ar="من 5" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>⭐</span>
        </div>

        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #a855f7'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Commission Rate" ar="نسبة العمولة" />
            </span>
            <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>🚀</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{data?.boostStatus.total_commission_percent}%</div>
          <p style={{ color: data?.boostStatus.is_boosted ? '#cfa86e' : '#666', fontSize: '0.75rem', margin: 0 }}>
            {data?.boostStatus.is_boosted ? <T en="Boosted" ar="معزز" /> : <T en="Standard" ar="أساسي" />}
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>🚀</span>
        </div>
      </section>

      {/* Summary Strip */}
      <section 
        style={{ 
          background: '#111', 
          borderRadius: '16px',
          border: '1px solid #1e1e1e', 
          padding: '20px 28px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '0', 
          marginBottom: '32px'
        }}
      >
        <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Completion Rate" ar="معدل الإكمال" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {totalBookings > 0 ? Math.round((data?.bookings.filter(b => b.status === 'confirmed').length || 0) / totalBookings * 100) : 0}%
          </div>
        </div>
        <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Avg Booking Value" ar="متوسط قيمة الحجز" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {totalBookings > 0 ? Math.round(revenue / totalBookings) : 0} SAR
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Net Revenue" ar="الإيراد الصافي" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {Math.round(revenue - (revenue * (data?.boostStatus.total_commission_percent || 15) / 100))} SAR
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section 
        className="gb-card" 
        style={{ 
          background: '#111', 
          borderRadius: '20px', 
          border: '1px solid #1e1e1e', 
          padding: '24px', 
          marginBottom: '32px' 
        }}
      >
        <div style={{ fontSize: '1rem', color: '#888', marginBottom: '16px', fontWeight: 500 }}>
          <T en="Growth & Revenue" ar="النمو والإيرادات" />
        </div>
        <div style={{ width: '100%', height: 300, position: 'relative' }}>
          {chartData.length === 0 || chartData.every(d => d.revenue === 0 && d.bookings === 0) ? (
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <p style={{ color: '#444', fontSize: '1rem' }}>
                <T en="No bookings in this period" ar="لا توجد حجوزات في هذه الفترة" />
              </p>
            </div>
          ) : (
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
                    min: 0,
                    ticks: { 
                      color: "#cfa86e",
                      callback: (value) => `${value} SAR`
                    },
                    grid: { color: "#1a1a1a" },
                    position: "left"
                  },
                  y1: {
                    min: 0,
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
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Bookings Table */}
        <section 
          className="gb-card" 
          style={{ 
            background: '#111', 
            borderRadius: '20px', 
            border: '1px solid #1e1e1e', 
            padding: '24px' 
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            <T en="Recent Activity" ar="النشاط الأخير" />
          </div>
          <div className="gb-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d', color: '#666', fontSize: '0.8rem', textAlign: 'start' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Date" ar="التاريخ" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Studio" ar="الاستوديو" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Amount" ar="المبلغ" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {data?.bookings.slice(0, 10).map((b) => (
                  <tr 
                    key={b.id} 
                    style={{ borderBottom: '1px solid #1a1a1a', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>{b.booking_date}</td>
                    <td style={{ padding: '16px' }}>{b.studio?.name}</td>
                    <td style={{ padding: '16px' }}><strong>{b.total_amount} SAR</strong></td>
                    <td style={{ padding: '16px' }}>
                      <span 
                        className={`gb-dash-badge ${b.status === 'confirmed' ? 'gb-dash-badge-confirmed' : 'gb-dash-badge-pending'}`}
                        style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem' }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.bookings || data.bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                      <T en="No data for this period" ar="لا توجد بيانات لهذه الفترة" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ranking & Insights */}
        <section className="gb-dashboard-stack" style={{ display: 'grid', gap: '24px' }}>
          <section 
            className="gb-card" 
            style={{ 
              background: '#111', 
              borderRadius: '20px', 
              border: '1px solid #1e1e1e', 
              padding: '24px' 
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
              <T en="Studio Ranking" ar="تصنيف الاستوديو" />
            </div>
            
            {data?.studios.length === 1 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <T en="Your studio rank among all GearBeat studios" ar="تصنيف استوديوك بين جميع استوديوهات GearBeat" />
                </p>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#cfa86e' }}>
                  #{data.ranking.rank}
                </div>
                <div style={{ fontSize: '1.2rem', color: '#888', marginBottom: '24px' }}>
                  <T en="out of" ar="من أصل" /> {data.ranking.total}
                </div>
                <div 
                  style={{ 
                    height: '6px', 
                    background: '#1a1a1a', 
                    borderRadius: '99px', 
                    overflow: 'hidden' 
                  }}
                >
                  <div 
                    style={{ 
                      width: `${Math.max(5, 100 - (data.ranking.rank / data.ranking.total) * 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #cfa86e, #f0c070)' 
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className="gb-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: '#666', borderBottom: '1px solid #222', textAlign: 'start' }}>
                      <th style={{ padding: '12px 8px' }}><T en="Studio" ar="الاستوديو" /></th>
                      <th style={{ padding: '12px 8px' }}><T en="Revenue" ar="الإيراد" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.performance.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '12px 8px' }}>#{i+1} {p.name}</td>
                        <td style={{ padding: '12px 8px', color: '#cfa86e', fontWeight: 700 }}>{p.revenue} SAR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section 
            style={{ 
              background: 'linear-gradient(135deg, rgba(207,168,110,0.08), rgba(207,168,110,0.02))',
              border: '1px solid rgba(207,168,110,0.2)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <h3 style={{ color: '#cfa86e', margin: '0 0 12px 0', fontSize: '1.1rem' }}>
              <T en="Quick Insight" ar="رؤية سريعة" />
            </h3>
            <p style={{ color: '#888', lineScale: 1.7, margin: 0, fontSize: '0.9rem' }}>
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
