import { requireVendorLayoutAccess } from "../../../lib/route-guards";
import T from "../../../components/t";
import Link from "next/link";

export default async function VendorFinancePage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch summary of sales
  const { data: orderItems } = await supabaseAdmin
    .from("marketplace_order_items")
    .select("total_price, commission_amount, vendor_net_amount, status")
    .eq("vendor_id", user.id);

  const totalSales = orderItems?.reduce((sum, i) => sum + (Number(i.total_price) || 0), 0) || 0;
  const totalCommission = orderItems?.reduce((sum, i) => sum + (Number(i.commission_amount) || 0), 0) || 0;
  const totalNet = orderItems?.reduce((sum, i) => sum + (Number(i.vendor_net_amount) || 0), 0) || 0;

  const pendingSales = orderItems?.filter(i => i.status !== 'delivered')
    .reduce((sum, i) => sum + (Number(i.vendor_net_amount) || 0), 0) || 0;
  
  const availableBalance = orderItems?.filter(i => i.status === 'delivered')
    .reduce((sum, i) => sum + (Number(i.vendor_net_amount) || 0), 0) || 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Financial Management" ar="الإدارة المالية" />
          </span>
          <h1><T en="Earnings & Reports" ar="الأرباح والتقارير" /></h1>
          <p><T en="Track your revenue, commissions, and available balance." ar="تتبع إيراداتك، العمولات، والرصيد المتاح." /></p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label><T en="Total Gross Sales" ar="إجمالي المبيعات" /></label>
            <div className="stat-value">{totalSales.toFixed(2)} SAR</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <label><T en="Net Earnings" ar="صافي الأرباح" /></label>
            <div className="stat-value" style={{ color: 'var(--gb-gold)' }}>{totalNet.toFixed(2)} SAR</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <label><T en="Available for Payout" ar="متاح للسحب" /></label>
            <div className="stat-value" style={{ color: '#00ff88' }}>{availableBalance.toFixed(2)} SAR</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="card-head">
            <h3><T en="Revenue Breakdown" ar="تفاصيل الإيرادات" /></h3>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}><T en="Total Sales" ar="إجمالي المبيعات" /></span>
              <span>{totalSales.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}><T en="Platform Commission" ar="عمولة المنصة" /></span>
              <span style={{ color: '#ff4d4d' }}>- {totalCommission.toFixed(2)} SAR</span>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span><T en="Your Net Share" ar="صافي حصتك" /></span>
              <span style={{ color: 'var(--gb-gold)' }}>{totalNet.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3><T en="Payout Status" ar="حالة السحب" /></h3>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 15 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Pending Fulfillment" ar="بانتظار التنفيذ" /></span>
                <span>{pendingSales.toFixed(2)} SAR</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}><T en="Settled & Ready" ar="تمت التسوية وجاهز" /></span>
                <span style={{ color: '#00ff88' }}>{availableBalance.toFixed(2)} SAR</span>
             </div>
             <button className="btn btn-primary w-full" style={{ marginTop: 10 }} disabled={availableBalance <= 0}>
                <T en="Request Payout" ar="طلب سحب الأرباح" />
             </button>
             <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                <T en="Settlements are processed 7 days after delivery." ar="تتم التسوية بعد 7 أيام من تاريخ التوصيل." />
             </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0 }}>
        <div className="card-head" style={{ padding: '25px 25px 10px' }}>
          <h3><T en="Detailed Sales Report" ar="تقرير المبيعات التفصيلي" /></h3>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th><T en="Order ID" ar="رقم الطلب" /></th>
                <th><T en="Product" ar="المنتج" /></th>
                <th><T en="Date" ar="التاريخ" /></th>
                <th><T en="Gross" ar="الإجمالي" /></th>
                <th><T en="Fee" ar="العمولة" /></th>
                <th><T en="Net" ar="الصافي" /></th>
                <th><T en="Status" ar="الحالة" /></th>
              </tr>
            </thead>
            <tbody>
              {orderItems?.slice(0, 10).map((item: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontSize: '0.8rem' }}>#{item.id.slice(0, 8)}</td>
                  <td><T en="Marketplace Item" ar="منتج من السوق" /></td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date().toLocaleDateString()}</td>
                  <td>{item.total_price}</td>
                  <td style={{ color: '#ff4d4d' }}>{item.commission_amount}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gb-gold)' }}>{item.vendor_net_amount}</td>
                  <td>
                    <span className={`badge badge-small badge-${item.status === 'delivered' ? 'success' : 'warning'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!orderItems || orderItems.length === 0) && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                    <T en="No sales data found." ar="لا توجد بيانات مبيعات." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
