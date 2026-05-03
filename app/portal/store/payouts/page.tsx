import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import {
  requireVendorOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

type CommissionSetting = {
  scopeType: string;
  scopeId: string;
  commissionRate: number;
  isActive: boolean;
};

function normalizeCommission(row: DbRow): CommissionSetting {
  return {
    scopeType: readText(row, ["scope_type"]),
    scopeId: readText(row, ["scope_id"]),
    commissionRate: readNumber(row, ["commission_rate"], 15),
    isActive: Boolean(row.is_active),
  };
}

function getCommissionRate(
  settings: CommissionSetting[],
  options: {
    vendorId?: string;
    productId?: string;
  }
) {
  const activeSettings = settings.filter((setting) => setting.isActive);

  if (options.productId) {
    const productRule = activeSettings.find(
      (setting) =>
        setting.scopeType === "product" && setting.scopeId === options.productId
    );

    if (productRule) return productRule.commissionRate;
  }

  if (options.vendorId) {
    const vendorRule = activeSettings.find(
      (setting) =>
        setting.scopeType === "vendor" && setting.scopeId === options.vendorId
    );

    if (vendorRule) return vendorRule.commissionRate;
  }

  const marketplaceRule = activeSettings.find(
    (setting) =>
      setting.scopeType === "service_type" &&
      setting.scopeId === "marketplace_product"
  );

  if (marketplaceRule) return marketplaceRule.commissionRate;

  const globalRule = activeSettings.find(
    (setting) => setting.scopeType === "global"
  );

  return globalRule?.commissionRate || 15;
}

async function fetchCommissionSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<CommissionSetting[]> {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*");

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeCommission);
}

async function fetchVendorOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vendorId: string
): Promise<DbRow[]> {
  const { data, error } = await supabase
    .from("marketplace_orders")
    .select("*")
    .eq("vendor_auth_user_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

function formatMoney(amount: number) {
  return `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SAR`;
}

export default async function VendorFinancePage() {
  const supabase = await createClient();
  const { user } = await requireVendorOrRedirect(supabase);

  const [settings, orders] = await Promise.all([
    fetchCommissionSettings(supabase),
    fetchVendorOrders(supabase, user.id),
  ]);

  const rows = orders.map((order) => {
    const grossAmount = readNumber(order, ["total_amount", "amount"], 0);
    const productId = readText(order, ["product_id"]);
    const commissionRate = getCommissionRate(settings, { vendorId: user.id, productId });
    const commissionAmount = grossAmount * (commissionRate / 100);
    const netPayable = grossAmount - commissionAmount;

    const id = readText(order, ["id"]);
    const orderNumber = readText(order, ["order_number"]);

    return {
      id,
      orderLabel: orderNumber || id.slice(0, 8),
      grossAmount,
      commissionAmount,
      netPayable,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at
    };
  });

  const totalRevenue = rows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.grossAmount, 0);
  const totalCommission = rows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalNet = rows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.netPayable, 0);
  const totalOrders = rows.length;
  const paidOrdersCount = rows.filter(r => r.paymentStatus === 'paid').length;
  const pendingOrdersCount = rows.filter(r => ['pending', 'unpaid'].includes(r.paymentStatus as string)).length;

  return (
    <main 
      className="gb-dashboard-page" 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px',
        color: '#fff'
      }}
    >
      <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="gb-dash-badge" style={{ background: 'rgba(207, 168, 110, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
            <T en="Finance" ar="المالية" />
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 0', color: 'white' }}>
            <T en="Payout" ar="المستحقات" />
          </h1>
          <p style={{ color: "#888", fontSize: '0.9rem', marginTop: '8px' }}>
            <T en="Track your marketplace sales, GearBeat commission, and net payable balance." ar="تتبع مبيعات متجرك، عمولة GearBeat، وصافي الرصيد المستحق." />
          </p>
        </div>

        <Link 
          href="/portal/store" 
          style={{ 
            color: '#888', 
            textDecoration: 'none', 
            fontSize: '0.9rem',
            border: '1px solid #222',
            padding: '10px 20px',
            borderRadius: '10px'
          }}
        >
          ← <T en="Back" ar="رجوع" />
        </Link>
      </section>

      <section className="gb-dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Revenue" ar="الإيراد" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{formatMoney(totalRevenue)}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Commission" ar="العمولة" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{formatMoney(totalCommission)}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Net Payable" ar="الصافي المستحق" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cfa86e' }}>{formatMoney(totalNet)}</div>
        </div>
      </section>

      <section className="gb-dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Total Orders" ar="إجمالي الطلبات" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{totalOrders}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Paid Orders" ar="طلبات مدفوعة" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{paidOrdersCount}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Pending Orders" ar="طلبات معلقة" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{pendingOrdersCount}</div>
        </div>
      </section>

      <section className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}><T en="Finance breakdown" ar="تفاصيل المالية" /></h2>
          <button style={{ background: '#222', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <T en="Export CSV" ar="تصدير CSV" />
          </button>
        </div>

        <div className="gb-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #1a1a1a', textAlign: 'start' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Order ID" ar="رقم الطلب" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Gross Revenue" ar="الإيراد الإجمالي" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="GearBeat Commission" ar="عمولة GearBeat" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Net Payable" ar="الصافي المستحق" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Payment status" ar="حالة الدفع" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Date" ar="التاريخ" /></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
                    <T en="No records yet" ar="لا توجد سجلات بعد" />
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '16px' }}><strong>{row.orderLabel}</strong></td>
                    <td style={{ padding: '16px' }}>{formatMoney(row.grossAmount)}</td>
                    <td style={{ padding: '16px' }}>{formatMoney(row.commissionAmount)}</td>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#cfa86e' }}>{formatMoney(row.netPayable)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '99px', 
                        fontSize: '0.75rem', 
                        background: row.paymentStatus === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                        color: row.paymentStatus === 'paid' ? '#22c55e' : '#eab308'
                      }}>
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>{new Date(row.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
