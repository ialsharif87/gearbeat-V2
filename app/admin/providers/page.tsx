import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminLayoutAccess();
  const { tab = "studios" } = await searchParams;

  const supabaseAdmin = createAdminClient();

  // Fetch datasets in parallel
  const [studiosRes, sellersRes] = await Promise.all([
    supabaseAdmin
      .from("studios")
      .select("id, name, slug, status, city, owner_auth_user_id, booking_enabled, verified, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("vendor_profiles")
      .select("id, business_name_en, slug, status, contact_email, city, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const studios = studiosRes.data || [];
  const sellers = sellersRes.data || [];

  const stats = {
    totalStudios: studios.length,
    totalSellers: sellers.length,
    pendingReview: 
      studios.filter(s => s.status === "pending").length + 
      sellers.filter(v => v.status === "pending").length
  };

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>
        <h1>
          <T en="Provider Management" ar="إدارة المزودين" />
        </h1>
        <p>
          <T
            en="Monitor and manage all approved studio owners and marketplace vendors."
            ar="مراقبة وإدارة جميع أصحاب الاستوديوهات المعتمدين وبائعي المتجر."
          />
        </p>
      </div>

      {/* Summary Row */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="card stat-card">
          <div className="stat-content">
            <label><T en="Total Studios" ar="إجمالي الاستوديوهات" /></label>
            <div className="stat-value">{stats.totalStudios}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <label><T en="Total Sellers" ar="إجمالي البائعين" /></label>
            <div className="stat-value">{stats.totalSellers}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <label><T en="Pending Review" ar="في انتظار المراجعة" /></label>
            <div className="stat-value" style={{ color: stats.pendingReview > 0 ? "var(--gb-gold)" : "inherit" }}>
              {stats.pendingReview}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 12 }}>
        <Link 
          href="/admin/providers?tab=studios" 
          className={`btn btn-small ${tab === "studios" ? "btn-primary" : "btn-secondary"}`}
          style={{ minWidth: 120 }}
        >
          Studios ({studios.length})
        </Link>
        <Link 
          href="/admin/providers?tab=sellers" 
          className={`btn btn-small ${tab === "sellers" ? "btn-primary" : "btn-secondary"}`}
          style={{ minWidth: 120 }}
        >
          Sellers ({sellers.length})
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            {tab === "studios" ? (
              <>
                <thead>
                  <tr>
                    <th>Studio Name</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Booking</th>
                    <th>Verified</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studios.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}>No studios found.</td></tr>
                  ) : (
                    studios.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link href={`/portal/studio/studios`} style={{ color: "var(--gb-gold)" }}>{s.name}</Link>
                        </td>
                        <td>{s.city}</td>
                        <td>
                          <span className={`badge badge-${s.status === "approved" ? "success" : s.status === "pending" ? "warning" : "danger"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.booking_enabled ? "badge-success" : "badge-secondary"}`}>
                            {s.booking_enabled ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.verified ? "badge-success" : "badge-secondary"}`}>
                            {s.verified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>{formatDate(s.created_at)}</td>
                        <td>
                          <Link href={`/admin/studios`} className="btn btn-small">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40 }}>No sellers found.</td></tr>
                  ) : (
                    sellers.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>{v.business_name_en}</td>
                        <td>{v.contact_email || "—"}</td>
                        <td>{v.city || "—"}</td>
                        <td>
                          <span className={`badge badge-${v.status === "approved" ? "success" : v.status === "pending" ? "warning" : "danger"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td>{formatDate(v.created_at)}</td>
                        <td>
                          <Link href={`/admin/vendors`} className="btn btn-small">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </section>
  );
}
