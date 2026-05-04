import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();
  const params = await (searchParams || {});
  const query = params.q?.toLowerCase() || "";

  // Fetch admin info for permissions
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch Sellers with aggregated data
  // Since we can't do complex GROUP BY in a single Supabase query easily without RPC, 
  // we fetch profiles and then related counts, or use a view if available.
  // For simplicity in this "One File" task, we fetch and merge or use .select('*, count')
  
  const { data: sellersData } = await supabaseAdmin
    .from("profiles")
    .select(`
      id, full_name, email, phone, account_status, created_at,
      marketplace_products!marketplace_products_vendor_auth_user_id_fkey (id),
      marketplace_orders!marketplace_orders_vendor_auth_user_id_fkey (id, total_amount)
    `)
    .eq("role", "vendor")
    .order("created_at", { ascending: false });

  const sellers = (sellersData || []).map(p => {
    const productsCount = p.marketplace_products?.length || 0;
    const ordersCount = p.marketplace_orders?.length || 0;
    const totalRevenue = p.marketplace_orders?.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0) || 0;
    return { ...p, productsCount, ordersCount, totalRevenue };
  }).filter(s => 
    s.full_name?.toLowerCase().includes(query) || 
    s.email?.toLowerCase().includes(query)
  );

  const stats = {
    total: sellers.length,
    active: sellers.filter(s => s.account_status === 'active').length,
    revenue: sellers.reduce((acc, s) => acc + s.totalRevenue, 0)
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
          <T en="Approved Sellers" ar="التجار المعتمدون" />
        </h1>
        <div style={{ position: 'relative', width: 300 }}>
          <form method="GET">
            <input 
              name="q"
              placeholder="Search by name or email..." 
              defaultValue={query}
              style={{ width: '100%', background: '#111', border: '1px solid #1e1e1e', padding: '12px 16px', borderRadius: 12, color: '#fff', outline: 'none' }} 
            />
          </form>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="gb-dash-card" style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
          <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en="Total Sellers" ar="إجمالي التجار" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#cfa86e' }}>{stats.total}</div>
        </div>
        <div className="gb-dash-card" style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
          <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en="Active Sellers" ar="تجار نشطون" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#22c55e' }}>{stats.active}</div>
        </div>
        <div className="gb-dash-card" style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
          <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en="Total Revenue" ar="إجمالي المبيعات" /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#cfa86e' }}>{stats.revenue.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>SAR</span></div>
        </div>
      </div>

      {/* Sellers Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Seller" ar="التاجر" /></th>
              <th style={thStyle}><T en="Products" ar="المنتجات" /></th>
              <th style={thStyle}><T en="Orders" ar="الطلبات" /></th>
              <th style={thStyle}><T en="Revenue" ar="الإيراد" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Joined" ar="تاريخ الانضمام" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{seller.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{seller.email}</div>
                </td>
                <td style={tdStyle}>{seller.productsCount}</td>
                <td style={tdStyle}>{seller.ordersCount}</td>
                <td style={tdStyle}>{seller.totalRevenue.toLocaleString()} SAR</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 6, 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    background: seller.account_status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: seller.account_status === 'active' ? '#22c55e' : '#ef4444'
                  }}>
                    {seller.account_status?.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(seller.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/portal/store`} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #333', fontSize: '0.75rem', textDecoration: 'none', color: '#fff' }}>
                      <T en="Portal" ar="البوابة" />
                    </Link>
                    {isSuperAdmin && (
                      seller.account_status === 'active' ? (
                        <form action={updateStatusAction}>
                          <input type="hidden" name="id" value={seller.id} />
                          <input type="hidden" name="status" value="suspended" />
                          <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <T en="Suspend" ar="إيقاف" />
                          </button>
                        </form>
                      ) : (
                        <form action={updateStatusAction}>
                          <input type="hidden" name="id" value={seller.id} />
                          <input type="hidden" name="status" value="active" />
                          <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #22c55e', background: 'transparent', color: '#22c55e', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <T en="Activate" ar="تنشيط" />
                          </button>
                        </form>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// Styles
const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };

// Server Actions
async function updateStatusAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("profiles").update({ account_status: status }).eq("id", id);
  revalidatePath("/admin/sellers");
}

import Link from "next/link";
