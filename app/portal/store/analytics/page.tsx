"use client"

import React, { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import T from "@/components/t"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState("CM")
  const [customDates, setCustomDates] = useState({ from: "", to: "" })
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [range, customDates])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let start: Date, end: Date = new Date()
    const now = new Date()

    switch (range) {
      case "7D":
        start = new Date(now.setDate(now.getDate() - 7))
        break
      case "30D":
        start = new Date(now.setDate(now.getDate() - 30))
        break
      case "CM":
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "YTD":
        start = new Date(now.getFullYear(), 0, 1)
        break
      case "LY":
        start = new Date(now.getFullYear() - 1, 0, 1)
        end = new Date(now.getFullYear() - 1, 11, 31)
        break
      case "Custom":
        start = customDates.from ? new Date(customDates.from) : new Date()
        end = customDates.to ? new Date(customDates.to) : new Date()
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const { data: orderData } = await supabase
      .from("marketplace_orders")
      .select(`
        *,
        items:marketplace_order_items(
          quantity,
          product:marketplace_products(name_en, name_ar)
        )
      `)
      .eq("vendor_auth_user_id", user.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false })

    const { data: productData } = await supabase
      .from("marketplace_products")
      .select("*")
      .eq("vendor_auth_user_id", user.id)

    setOrders(orderData || [])
    setProducts(productData || [])
    setLoading(false)
  }

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled')
    const revenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const orderCount = validOrders.length
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0
    
    // Top Product
    const productCounts: any = {}
    validOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.product?.name_en || "Product"
        productCounts[name] = (productCounts[name] || 0) + item.quantity
      })
    })
    const topProduct = Object.entries(productCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "—"

    // Summary Strip
    const delivered = validOrders.filter(o => o.status === 'delivered').length
    const completionRate = orderCount > 0 ? (delivered / orderCount) * 100 : 0
    const totalItemsSold = validOrders.reduce((sum, o) => sum + (o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0), 0)

    return { revenue, orderCount, avgOrderValue, topProduct, completionRate, totalItemsSold }
  }, [orders])

  const chartData = useMemo(() => {
    const daily: any = {}
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })
      daily[date] = (daily[date] || 0) + Number(o.total_amount)
    })

    const labels = Object.keys(daily)
    const data = Object.values(daily)

    return {
      labels,
      datasets: [{
        label: "Revenue (SAR)",
        data,
        borderColor: "#cfa86e",
        backgroundColor: "rgba(207, 168, 110, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#cfa86e"
      }]
    }
  }, [orders])

  const exportCSV = () => {
    const headers = ["Order #", "Date", "Customer", "Amount", "Status"]
    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.total_amount,
      o.status
    ])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `vendor_analytics_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main 
      style={{ 
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)', 
        minHeight: '100vh', 
        padding: '32px',
        color: '#fff'
      }}
    >
      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>
            <T en="Sales Analytics" ar="تحليلات المبيعات" />
          </h1>
          <p style={{ color: '#cfa86e', fontSize: '0.9rem', marginTop: '4px' }}>
            {range === 'CM' ? "Current Month" : range} Analysis
          </p>
        </div>
        <button 
          onClick={exportCSV}
          style={{ 
            background: 'linear-gradient(135deg, #cfa86e, #b8923a)', 
            color: '#000', 
            border: 'none', 
            borderRadius: '10px', 
            padding: '10px 20px', 
            fontWeight: 700, 
            cursor: 'pointer' 
          }}
        >
          📥 <T en="Export CSV" ar="تصدير CSV" />
        </button>
      </section>

      {/* Range Selectors */}
      <div style={{ display: 'flex', gap: '8px', background: '#111', border: '1px solid #222', borderRadius: '99px', padding: '6px', width: 'fit-content', marginBottom: '32px' }}>
        {["7D", "30D", "CM", "YTD", "LY", "Custom"].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: 'none',
              background: range === r ? '#cfa86e' : 'transparent',
              color: range === r ? '#000' : '#888',
              fontWeight: range === r ? 700 : 400,
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {range === "Custom" && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: '#111', padding: '16px', borderRadius: '16px', border: '1px solid #222', width: 'fit-content' }}>
          <input type="date" value={customDates.from} onChange={e => setCustomDates({...customDates, from: e.target.value})} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '8px' }} />
          <input type="date" value={customDates.to} onChange={e => setCustomDates({...customDates, to: e.target.value})} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '8px' }} />
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px', borderTop: '3px solid #cfa86e', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '8px' }}><T en="Revenue" ar="الإيراد" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.revenue.toLocaleString()} <small style={{ fontSize: '0.9rem', color: '#666' }}>SAR</small></div>
          <span style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '4rem', opacity: 0.05 }}>💰</span>
        </div>
        <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px', borderTop: '3px solid #3b82f6', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '8px' }}><T en="Orders" ar="الطلبات" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.orderCount}</div>
          <span style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '4rem', opacity: 0.05 }}>🧾</span>
        </div>
        <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px', borderTop: '3px solid #22c55e', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '8px' }}><T en="Top Product" ar="أفضل منتج" /></div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.topProduct}</div>
          <span style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '4rem', opacity: 0.05 }}>🏆</span>
        </div>
        <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px', borderTop: '3px solid #a855f7', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '8px' }}><T en="Avg Order Value" ar="متوسط قيمة الطلب" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{Math.round(stats.avgOrderValue)} <small style={{ fontSize: '0.9rem', color: '#666' }}>SAR</small></div>
          <span style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '4rem', opacity: 0.05 }}>📊</span>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '32px', marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}><T en="Revenue Trend" ar="اتجاه الإيرادات" /></h3>
        <div style={{ height: '350px' }}>
          <Line 
            data={chartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
              }
            }} 
          />
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ background: '#111', borderRadius: '16px', border: '1px solid #1e1e1e', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}><T en="Completion Rate" ar="معدل الإكمال" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{Math.round(stats.completionRate)}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}><T en="Avg Order Value" ar="متوسط قيمة الطلب" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{Math.round(stats.avgOrderValue)} <small style={{ fontSize: '0.9rem' }}>SAR</small></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}><T en="Total Products Sold" ar="إجمالي المنتجات المباعة" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{stats.totalItemsSold}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}><T en="Recent Orders" ar="آخر الطلبات" /></h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #222', textAlign: 'start' }}>
                <th style={{ padding: '12px' }}>Order #</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px' }}>#{o.order_number}</td>
                  <td style={{ padding: '16px' }}>{o.customer_name}</td>
                  <td style={{ padding: '16px', fontWeight: 700 }}>{o.total_amount} SAR</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '99px', 
                      fontSize: '0.75rem', 
                      background: o.status === 'delivered' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                      color: o.status === 'delivered' ? '#22c55e' : '#3b82f6'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#666' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
