"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
          <h1><T en="Studio Insights" ar="رؤى الاستوديو" /></h1>
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
        <div className="gb-card gb-dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Revenue" ar="الإيراد" /></span>
            <span>💰</span>
          </div>
          <div className="gb-dash-stat">{revenue} <small>SAR</small></div>
          <p className="gb-muted-text"><T en="SAR" ar="ريال" /></p>
        </div>

        <div className="gb-card gb-dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Bookings" ar="الحجوزات" /></span>
            <span>📅</span>
          </div>
          <div className="gb-dash-stat">{totalBookings}</div>
          <p className="gb-muted-text"><T en="confirmed + completed" ar="مؤكد + مكتمل" /></p>
        </div>

        <div className="gb-card gb-dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Avg Rating" ar="متوسط التقييم" /></span>
            <span>⭐</span>
          </div>
          <div className="gb-dash-stat">{data?.avgRating.toFixed(1)}</div>
          <p className="gb-muted-text"><T en="out of 5" ar="من 5" /></p>
        </div>

        <div className="gb-card gb-dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="gb-dash-label"><T en="Commission Rate" ar="نسبة العمولة" /></span>
            <span>🚀</span>
          </div>
          <div className="gb-dash-stat">{data?.boostStatus.total_commission_percent}%</div>
          <p className={data?.boostStatus.is_boosted ? "neon-text" : "gb-muted-text"}>
            {data?.boostStatus.is_boosted ? <T en="Boosted" ar="معزز" /> : <T en="Standard" ar="أساسي" />}
          </p>
        </div>
      </section>

      {/* Chart */}
      <section className="gb-card" style={{ marginBottom: '32px', padding: '32px' }}>
        <div className="gb-card-header" style={{ marginBottom: '24px' }}>
          <h3><T en="Growth & Revenue" ar="النمو والإيرادات" /></h3>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#cfa86e" 
                strokeWidth={3} 
                dot={{ fill: '#cfa86e', r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="bookings" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 3 }} 
              />
            </LineChart>
          </ResponsiveContainer>
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
