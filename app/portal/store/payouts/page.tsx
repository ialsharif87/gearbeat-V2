import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import PremiumFinanceDashboard from "@/components/premium-finance-dashboard";
import {
  requireVendorOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

async function fetchBalance(supabase: any, vendorId: string) {
  const { data } = await supabase
    .from("finance_ledger")
    .select("amount")
    .eq("entry_group", "payable")
    .eq("partner_type", "vendor")
    .eq("partner_id", vendorId)
    .in("status", ["pending", "posted"]);

  return (data || []).reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
}

async function fetchTransactions(supabase: any, vendorId: string) {
  // Fetch from ledger to get commission breakdown
  const { data: ledger } = await supabase
    .from("finance_ledger")
    .select("*")
    .eq("partner_type", "vendor")
    .eq("partner_id", vendorId)
    .order("transaction_date", { ascending: false })
    .limit(50);

  // Group by source_id to calculate gross/commission/net
  const grouped = (ledger || []).reduce((acc: any, row: any) => {
    const id = row.source_id;
    if (!acc[id]) {
      acc[id] = { id, label: row.source_label || id.slice(0, 8), gross: 0, commission: 0, net: 0, date: row.transaction_date };
    }
    
    const amount = Number(row.amount);
    if (row.entry_type === "customer_payment") acc[id].gross += amount;
    if (row.entry_type === "platform_commission") acc[id].commission += amount;
    if (row.entry_type === "vendor_payable") acc[id].net += amount;
    
    return acc;
  }, {});

  return Object.values(grouped).map((t: any) => ({
    id: t.id,
    label: t.label,
    gross_amount: t.gross,
    commission_amount: t.commission,
    net_amount: t.net,
    status: "posted",
    created_at: t.date
  }));
}

async function fetchPayoutRequests(supabase: any, vendorId: string) {
  const { data } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("partner_type", "vendor")
    .eq("partner_id", vendorId)
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function VendorFinancePage() {
  const supabase = await createClient();
  const { user } = await requireVendorOrRedirect(supabase);

  const [balance, transactions, requests] = await Promise.all([
    fetchBalance(supabase, user.id),
    fetchTransactions(supabase, user.id),
    fetchPayoutRequests(supabase, user.id),
  ]);

  return (
    <main 
      className="gb-dashboard-page" 
      style={{ 
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)', 
        minHeight: '100vh', 
        padding: '40px',
        color: '#fff'
      }}
    >
      <section style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="gb-dash-badge" style={{ background: 'rgba(207, 168, 110, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '16px' }}>
            <T en="Financial Overview" ar="نظرة مالية عامة" />
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '8px 0 0', color: 'white', letterSpacing: '-1px' }}>
            <T en="Earnings & Payouts" ar="الأرباح والمدفوعات" />
          </h1>
          <p style={{ color: "#888", fontSize: '1.1rem', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6 }}>
            <T en="Monitor your marketplace revenue, commission deductions, and manage your withdrawal requests with precision." ar="راقب إيرادات متجرك، خصومات العمولات، وأدر طلبات السحب الخاصة بك بدقة عالية." />
          </p>
        </div>

        <Link 
          href="/portal/store" 
          style={{ 
            color: '#fff', 
            textDecoration: 'none', 
            fontSize: '0.95rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #222',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          ← <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
        </Link>
      </section>

      <PremiumFinanceDashboard 
        partnerType="vendor"
        availableBalance={balance}
        currency="SAR"
        transactions={transactions}
        payoutRequests={requests}
      />
    </main>
  );
}
