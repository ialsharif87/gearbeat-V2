import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface StudiosPageParams {
  q?: string;
}

export default async function AdminStudiosPage({
  searchParams,
}: {
  searchParams?: Promise<StudiosPageParams>;
}) {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();
  const params = (await searchParams) || {};
  const query = params.q?.toLowerCase() || "";

  // Fetch admin info for permissions
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch 1: Actual studios
  const { data: studiosData } = await supabaseAdmin
    .from("studios")
    .select(`
      id, name, city, status, verified, booking_enabled, price_from, created_at, owner_auth_user_id, completion_score,
      profiles!studios_owner_auth_user_id_fkey (full_name, email),
      bookings (id, total_amount),
      studio_images(count)
    `)
    .order("created_at", { ascending: false });

  // Fetch 2: Approved leads who haven't finished setup
  const { data: approvedLeads } = await supabaseAdmin
    .from("provider_leads")
    .select("*")
    .eq("status", "approved")
    .eq("type", "studio");

  // Fetch 3: Final Approved Studio Applications (Partners)
  const { data: finalApprovedApps } = await supabaseAdmin
    .from("studio_applications")
    .select("*")
    .not("final_approved_at", "is", null);

  // Combine them
  const actualStudios = (studiosData || []).map(s => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const ownerName = profile?.full_name || "Unknown";
    const ownerEmail = profile?.email || "—";
    const bookingsCount = s.bookings?.length || 0;
    const totalRevenue = (s.bookings as any[])?.reduce((acc: number, b: any) => acc + (b.total_amount || 0), 0) || 0;
    const photoCount = (s.studio_images as any)?.[0]?.count || 0;
    return { ...s, ownerName, ownerEmail, bookingsCount, totalRevenue, photoCount, type: 'active' };
  });

  const partnerStudios = (finalApprovedApps || []).filter(app => !actualStudios.some(s => s.ownerEmail === app.email)).map(app => ({
    id: app.id,
    name: app.company_name_en || app.full_name,
    city: app.country || '—',
    ownerName: app.full_name,
    ownerEmail: app.email,
    bookingsCount: 0,
    totalRevenue: 0,
    status: 'active',
    verified: true,
    created_at: app.final_approved_at,
    type: 'partner',
    photoCount: 0,
    booking_enabled: false,
    price_from: 0,
    owner_auth_user_id: null
  }));

  const pendingStudios = (approvedLeads || [])
    .filter(l => !actualStudios.some(s => s.ownerEmail === l.email) && !partnerStudios.some(p => p.ownerEmail === l.email))
    .map(l => ({
      id: l.id,
      name: l.business_name || l.full_name,
      city: l.city || '—',
      ownerName: l.full_name,
      ownerEmail: l.email,
      bookingsCount: 0,
      totalRevenue: 0,
      status: 'approved',
      verified: false,
      completion_score: 0,
      created_at: l.created_at,
      type: 'onboarding',
      photoCount: 0,
      booking_enabled: false,
      price_from: 0,
      owner_auth_user_id: null
    }));

  const allStudios = [...actualStudios, ...partnerStudios, ...pendingStudios].filter(s => 
    s.name?.toLowerCase().includes(query) || 
    s.ownerName?.toLowerCase().includes(query)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const stats = {
    total: allStudios.length,
    active: actualStudios.filter(s => s.status === 'approved' && s.booking_enabled).length,
    bookings: actualStudios.reduce((acc, s) => acc + s.bookingsCount, 0),
    revenue: actualStudios.reduce((acc, s) => acc + s.totalRevenue, 0)
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
          <T en="Approved Studios" ar="الاستوديوهات المعتمدة" />
        </h1>
        <div style={{ position: 'relative', width: 300 }}>
          <form method="GET">
            <input 
              name="q"
              placeholder="Search by name or owner..." 
              defaultValue={query}
              style={{ width: '100%', background: '#111', border: '1px solid #1e1e1e', padding: '12px 16px', borderRadius: 12, color: '#fff', outline: 'none' }} 
            />
          </form>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard labelEn="Total Studios" labelAr="إجمالي الاستوديوهات" value={stats.total} />
        <StatCard labelEn="Active" labelAr="نشط" value={stats.active} color="#22c55e" />
        <StatCard labelEn="Bookings" labelAr="الحجوزات" value={stats.bookings} />
        <StatCard labelEn="Total Revenue" labelAr="إجمالي الأرباح" value={`${stats.revenue.toLocaleString()} SAR`} color="#cfa86e" />
      </div>

      {/* Studios Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Studio" ar="الاستوديو" /></th>
              <th style={thStyle}><T en="Owner" ar="المالك" /></th>
              <th style={thStyle}><T en="Bookings" ar="الحجوزات" /></th>
              <th style={thStyle}><T en="Revenue" ar="الإيراد" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Photos" ar="الصور" /></th>
              <th style={thStyle}><T en="Completion" ar="اكتمال الملف" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {allStudios.map((studio) => (
              <tr key={studio.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{studio.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{studio.city}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{studio.ownerName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{studio.ownerEmail}</div>
                </td>
                <td style={tdStyle}>{studio.bookingsCount}</td>
                <td style={tdStyle}>{studio.totalRevenue.toLocaleString()} SAR</td>
                <td style={tdStyle}>
                  {studio.type === 'onboarding' ? (
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                      <T en="ONBOARDING" ar="قيد الانضمام" />
                    </span>
                  ) : studio.type === 'partner' ? (
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <T en="PARTNER" ar="شريك" />
                    </span>
                  ) : (
                    <StatusBadge status={studio.status} verified={studio.verified} />
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600 }}>{studio.photoCount}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ width: 100, height: 4, background: '#222', borderRadius: 2 }}>
                    <div style={{ width: `${studio.completion_score || 0}%`, height: '100%', background: '#cfa86e', borderRadius: 2 }} />
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {studio.type === 'active' ? (
                      <>
                        <Link href={`/studios/${studio.id}`} target="_blank" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #333', fontSize: '0.75rem', textDecoration: 'none', color: '#fff' }}>
                          <T en="View" ar="عرض" />
                        </Link>
                        {isSuperAdmin && (
                          studio.status === 'approved' ? (
                            <form action={updateStudioStatusAction}>
                              <input type="hidden" name="id" value={studio.id} />
                              <input type="hidden" name="status" value="suspended" />
                              <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <T en="Suspend" ar="إيقاف" />
                              </button>
                            </form>
                          ) : (
                            <form action={updateStudioStatusAction}>
                              <input type="hidden" name="id" value={studio.id} />
                              <input type="hidden" name="status" value="approved" />
                              <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #22c55e', background: 'transparent', color: '#22c55e', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <T en="Activate" ar="تنشيط" />
                              </button>
                            </form>
                          )
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#666' }}><T en="Waiting for setup" ar="في انتظار الإعداد" /></span>
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

function StatCard({ labelEn, labelAr, value, color }: { labelEn: string, labelAr: string, value: string | number, color?: string }) {
  return (
    <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
      <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en={labelEn} ar={labelAr} /></div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: color || '#fff' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status, verified }: { status: string, verified: boolean }) {
  let color = '#888';
  let bg = 'rgba(255,255,255,0.05)';
  let textEn = status;
  let textAr = status;

  if (status === 'approved' && verified) { color = '#22c55e'; bg = 'rgba(34, 197, 94, 0.15)'; textEn = "Approved"; textAr = "معتمد"; }
  else if (status === 'pending') { color = '#eab308'; bg = 'rgba(234, 179, 8, 0.15)'; textEn = "Pending"; textAr = "معلق"; }
  else if (status === 'suspended') { color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.15)'; textEn = "Suspended"; textAr = "موقوف"; }

  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, background: bg, color: color }}>
      <T en={textEn.toUpperCase()} ar={textAr} />
    </span>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };

async function updateStudioStatusAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("studios").update({ 
    status: status, 
    booking_enabled: status === 'approved',
    verified: status === 'approved'
  }).eq("id", id);
  revalidatePath("/admin/studios");
}
