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

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, studio:studios(name)")
        .in("studio_id", studioIds)
        .gte("booking_date", rangeDates.from.toISOString())
        .lte("booking_date", rangeDates.to.toISOString())
        .order("booking_date", { ascending: false });

      const { data: reviews } = await supabase
        .from("studio_reviews")
        .select("rating")
        .in("studio_id", studioIds);
      
      const avgRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      const { data: boost } = await supabase
        .from("studio_boost_subscriptions")
        .select("total_commission_percent, status")
        .eq("owner_auth_user_id", user.id)
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .maybeSingle();

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: totalStudios } = await supabase
        .from("studios")
        .select("*", { count: "exact", head: true });

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

      const performance: StudioPerformance[] = studios.map(s => {
        const studioBookings = bookings?.filter(b => b.studio_id === s.id) || [];
        return {
          id: s.id,
          name: s.name,
          bookings: studioBookings.length,
          revenue: studioBookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0),
          rating: 0,
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
    
    const groups: Record<string, { date: string, revenue: number, bookings: number }> = {};
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
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Studio Insights" ar="رؤى الاستوديو" />
          </h1>
          <p className="gb-dash-badge" style={{ marginTop: '12px' }}>
            {rangeDates.label}
          </p>
        </div>

        <button 
          onClick={exportToExcel}
          className="gb-button gb-button-primary"
        >
          <span style={{ fontSize: '1.2rem' }}>📥</span>
          <T en="Export Excel" ar="تصدير Excel" />
        </button>
      </section>

      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '6px', 
          borderRadius: '99px', 
          border: '1px solid var(--gb-border)',
          width: 'fit-content',
          marginBottom: '40px',
          overflowX: 'auto'
        }}
      >
        {["7D", "30D", "CM", "YTD", "LY", "Custom"].map((type) => (
          <button
            key={type}
            onClick={() => setRangeType(type as any)}
            className={`gb-button ${rangeType === type ? 'gb-button-primary' : 'gb-button-outline'}`}
            style={{ 
              padding: '6px 20px', 
              fontSize: '0.8rem',
              borderRadius: '99px',
              border: 'none'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {rangeType === "Custom" && (
        <section className="gb-card" style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', padding: '24px' }}>
          <input 
            type="date" 
            className="gb-input" 
            value={customRange.from} 
            onChange={e => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
            style={{ maxWidth: '200px' }}
          />
          <span className="gb-muted-text"><T en="to" ar="إلى" /></span>
          <input 
            type="date" 
            className="gb-input" 
            value={customRange.to} 
            onChange={e => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
            style={{ maxWidth: '200px' }}
          />
        </section>
      )}

      {/* KPI Cards */}
      <section className="gb-dash-grid-4" style={{ marginBottom: '32px' }}>
        <div className="gb-card" style={{ borderTop: '4px solid var(--gb-gold)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <span className="gb-detail-label">
              <T en="Revenue" ar="الإيراد" />
            </span>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{revenue}</div>
          <p style={{ color: 'var(--gb-gold)', fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
            <T en="SAR" ar="ريال" />
          </p>
        </div>

        <div className="gb-card" style={{ borderTop: '4px solid var(--gb-teal)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <span className="gb-detail-label">
              <T en="Bookings" ar="الحجوزات" />
            </span>
            <span style={{ fontSize: '1.5rem' }}>📅</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{totalBookings}</div>
          <p style={{ color: 'var(--gb-teal)', fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
            <T en="Confirmed + Completed" ar="مؤكد + مكتمل" />
          </p>
        </div>

        <div className="gb-card" style={{ borderTop: '4px solid #22c55e', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <span className="gb-detail-label">
              <T en="Avg Rating" ar="متوسط التقييم" />
            </span>
            <span style={{ fontSize: '1.5rem' }}>⭐</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{data?.avgRating.toFixed(1)}</div>
          <p style={{ color: '#22c55e', fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
            <T en="out of 5 stars" ar="من 5 نجوم" />
          </p>
        </div>

        <div className="gb-card" style={{ borderTop: '4px solid #a855f7', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <span className="gb-detail-label">
              <T en="Commission Rate" ar="نسبة العمولة" />
            </span>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{data?.boostStatus.total_commission_percent}%</div>
          <p style={{ color: data?.boostStatus.is_boosted ? 'var(--gb-gold)' : 'var(--gb-text-muted)', fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
            {data?.boostStatus.is_boosted ? <T en="Boost Active" ar="التعزيز نشط" /> : <T en="Standard Rate" ar="النسبة الأساسية" />}
          </p>
        </div>
      </section>

      {/* Summary Strip */}
      <section 
        className="gb-card"
        style={{ 
          padding: '24px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px', 
          marginBottom: '32px',
          background: 'rgba(212, 175, 55, 0.03)',
          border: '1px solid var(--gb-gold)'
        }}
      >
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--gb-border)' }}>
          <div className="gb-detail-label" style={{ marginBottom: '8px' }}>
            <T en="Completion Rate" ar="معدل الإكمال" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
            {totalBookings > 0 ? Math.round((data?.bookings.filter(b => b.status === 'confirmed').length || 0) / totalBookings * 100) : 0}%
          </div>
        </div>
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--gb-border)' }}>
          <div className="gb-detail-label" style={{ marginBottom: '8px' }}>
            <T en="Avg Booking Value" ar="متوسط قيمة الحجز" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
            {totalBookings > 0 ? Math.round(revenue / totalBookings) : 0} <span style={{ fontSize: '0.9rem', color: 'var(--gb-gold)' }}>SAR</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="gb-detail-label" style={{ marginBottom: '8px' }}>
            <T en="Estimated Net" ar="الصافي التقديري" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--gb-teal)' }}>
            {Math.round(revenue - (revenue * (data?.boostStatus.total_commission_percent || 15) / 100))} <span style={{ fontSize: '0.9rem' }}>SAR</span>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="gb-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div className="gb-card-header" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            <T en="Growth & Revenue" ar="النمو والإيرادات" />
          </h2>
        </div>
        <div style={{ width: '100%', height: 350, position: 'relative' }}>
          {chartData.length === 0 || chartData.every(d => d.revenue === 0 && d.bookings === 0) ? (
            <div className="gb-empty-state" style={{ height: '100%' }}>
              <p className="gb-muted-text">
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
                    borderColor: "#D4AF37",
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderWidth: 3,
                    pointBackgroundColor: "#D4AF37",
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                  },
                  {
                    label: "Bookings",
                    data: chartData.map(d => d.bookings),
                    borderColor: "#0FA08A",
                    backgroundColor: "rgba(15, 160, 138, 0.1)",
                    borderWidth: 2,
                    pointBackgroundColor: "#0FA08A",
                    pointRadius: 4,
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
                    position: 'top',
                    labels: { color: "#fff", font: { weight: 'bold' } }
                  },
                  tooltip: {
                    backgroundColor: '#111',
                    titleColor: 'var(--gb-gold)',
                    bodyColor: '#fff',
                    borderColor: 'var(--gb-border)',
                    borderWidth: 1,
                    padding: 12
                  }
                },
                scales: {
                  x: { 
                    ticks: { color: "#888" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                  },
                  y: { 
                    min: 0,
                    ticks: { 
                      color: "#D4AF37",
                      callback: (value) => `${value} SAR`
                    },
                    grid: { color: "rgba(255,255,255,0.05)" },
                    position: "left"
                  },
                  y1: {
                    min: 0,
                    ticks: { 
                      color: "#0FA08A",
                      callback: (value) => Math.round(Number(value))
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

      <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Bookings Table */}
        <section className="gb-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="gb-card-header" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
              <T en="Recent Activity" ar="النشاط الأخير" />
            </h2>
          </div>
          <div className="gb-table-wrap">
            <table className="gb-table">
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
                    <td className="gb-muted-text">{b.booking_date.split('T')[0]}</td>
                    <td style={{ fontWeight: 700, color: 'white' }}>{b.studio?.name}</td>
                    <td style={{ fontWeight: 800, color: 'var(--gb-gold)' }}>{b.total_amount} SAR</td>
                    <td>
                      <span className="gb-dash-badge" style={{ 
                        background: b.status === 'confirmed' ? 'rgba(15, 160, 138, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        color: b.status === 'confirmed' ? 'var(--gb-teal)' : 'var(--gb-gold)'
                      }}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.bookings || data.bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                      <p className="gb-muted-text"><T en="No data for this period" ar="لا توجد بيانات لهذه الفترة" /></p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ranking & Insights */}
        <div className="gb-dashboard-stack">
          <section className="gb-card" style={{ padding: '32px' }}>
            <div className="gb-card-header" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                <T en="Market Position" ar="المركز في السوق" />
              </h2>
            </div>
            
            {data?.studios.length === 1 ? (
              <div style={{ textAlign: 'center' }}>
                <p className="gb-muted-text" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
                  <T en="Your studio rank among all GearBeat studios" ar="تصنيف استوديوك بين جميع استوديوهات GearBeat" />
                </p>
                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--gb-gold)', lineHeight: 1 }}>
                  #{data.ranking.rank}
                </div>
                <div className="gb-muted-text" style={{ fontSize: '1.1rem', marginTop: '8px', marginBottom: '32px' }}>
                  <T en="out of" ar="من أصل" /> {data.ranking.total}
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--gb-border)' }}>
                  <div 
                    style={{ 
                      width: `${Math.max(5, 100 - (data.ranking.rank / data.ranking.total) * 100)}%`, 
                      height: '100%', 
                      background: 'var(--gb-gold)',
                      boxShadow: '0 0 15px var(--gb-gold-glow)'
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className="gb-table-wrap">
                <table className="gb-table">
                  <thead>
                    <tr>
                      <th><T en="Studio" ar="الاستوديو" /></th>
                      <th style={{ textAlign: 'right' }}><T en="Revenue" ar="الإيراد" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.performance.map((p, i) => (
                      <tr key={p.id}>
                        <td style={{ color: 'white', fontWeight: 700 }}>#{i+1} {p.name}</td>
                        <td style={{ textAlign: 'right', color: 'var(--gb-gold)', fontWeight: 800 }}>{p.revenue} SAR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section 
            className="gb-card"
            style={{ 
              background: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid var(--gb-gold)',
              padding: '24px'
            }}
          >
            <h3 style={{ color: 'var(--gb-gold)', margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 900 }}>
              <T en="Quick Insight" ar="رؤية سريعة" />
            </h3>
            <p style={{ color: 'white', lineHeight: 1.6, margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              <T 
                en="Focus on increasing your studio availability during peak weekends to capture more revenue." 
                ar="ركز على زيادة توافر الاستوديو خلال عطلات نهاية الأسبوع لاقتناص المزيد من الإيرادات." 
              />
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
