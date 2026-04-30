import Link from "next/link";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { revalidatePath } from "next/cache";
import T from "../../../components/t";

export default async function AdminAccelerationPage() {
  const { admin } = await requireAdminRole(["super_admin", "operations", "sales"]);
  const supabaseAdmin = createAdminClient();

  // Get all accelerations
  const { data: accelerations } = await supabaseAdmin
    .from("studio_accelerations")
    .select(`
      id,
      studio_id,
      package_name,
      status,
      priority_score,
      start_date,
      end_date,
      price,
      created_at,
      studios (name, owner_auth_user_id)
    `)
    .order("created_at", { ascending: false });

  const pendingRequests = accelerations?.filter((a) => a.status === "pending") || [];
  const activeAccelerations = accelerations?.filter((a) => a.status === "active") || [];
  const otherAccelerations = accelerations?.filter((a) => a.status !== "pending" && a.status !== "active") || [];

  async function approveBoost(formData: FormData) {
    "use server";
    const supabaseAdmin = createAdminClient();
    const id = formData.get("id")?.toString();
    if (!id) throw new Error("Missing ID");

    const { data: request } = await supabaseAdmin.from("studio_accelerations").select("package_name").eq("id", id).single();
    if (!request) throw new Error("Not found");
    
    let days = 7;
    let score = 10;
    if (request.package_name === "Growth Boost") { days = 14; score = 20; }
    if (request.package_name === "Premium Boost") { days = 30; score = 50; }

    const start_date = new Date();
    const end_date = new Date();
    end_date.setDate(start_date.getDate() + days);

    const { error } = await supabaseAdmin
      .from("studio_accelerations")
      .update({
        status: "active",
        priority_score: score,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString()
      })
      .eq("id", id);
      
    if (error) throw new Error(error.message);
    revalidatePath("/admin/acceleration");
  }

  async function rejectBoost(formData: FormData) {
    "use server";
    const supabaseAdmin = createAdminClient();
    const id = formData.get("id")?.toString();
    if (!id) throw new Error("Missing ID");

    const { error } = await supabaseAdmin
      .from("studio_accelerations")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/acceleration");
  }

  return (
    <section className="page">
      <div className="container">
        <div className="section-head">
          <Link href="/admin" className="badge">
            ← <T en="Back to Admin" ar="العودة للإدارة" />
          </Link>

          <h1>
            <T en="Acceleration Management" ar="إدارة التسريع" />
          </h1>

          <p>
            <T
              en="Review acceleration requests from studio owners, activate packages, and manage marketplace priority."
              ar="مراجعة طلبات التسريع من ملاك الاستوديوهات، تفعيل الباقات، وإدارة أولوية الظهور في المنصة."
            />
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <span className="badge">
              <T en="Pending" ar="قيد الانتظار" />
            </span>
            <h2>{pendingRequests.length}</h2>
            <p>
              <T en="Requests awaiting approval" ar="طلبات بانتظار الاعتماد" />
            </p>
          </div>

          <div className="card">
            <span className="badge" style={{ color: "var(--gb-success)", borderColor: "var(--gb-success)" }}>
              <T en="Active" ar="نشط" />
            </span>
            <h2>{activeAccelerations.length}</h2>
            <p>
              <T en="Currently boosted studios" ar="الاستوديوهات المسرعة حاليًا" />
            </p>
          </div>
        </div>

        <div style={{ height: 40 }} />

        <h2>
          <T en="Pending Requests" ar="الطلبات المعلقة" />
        </h2>

        {pendingRequests.length > 0 ? (
          <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gb-border)", color: "var(--gb-muted)" }}>
                  <th style={{ padding: 12 }}>Studio</th>
                  <th style={{ padding: 12 }}>Package</th>
                  <th style={{ padding: 12 }}>Requested On</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req: any) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--gb-border)" }}>
                    <td style={{ padding: 12 }}><strong>{req.studios?.name}</strong></td>
                    <td style={{ padding: 12 }}>{req.package_name}</td>
                    <td style={{ padding: 12 }}>{new Date(req.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      <form action={approveBoost} style={{ display: "inline-block", marginRight: 10 }}>
                        <input type="hidden" name="id" value={req.id} />
                        <button type="submit" className="btn btn-small">
                          Approve
                        </button>
                      </form>
                      <form action={rejectBoost} style={{ display: "inline-block" }}>
                        <input type="hidden" name="id" value={req.id} />
                        <button type="submit" className="btn btn-small btn-secondary" style={{ color: "var(--gb-danger)", borderColor: "var(--gb-danger)" }}>
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 20 }}>
            <p>
              <T en="No pending acceleration requests." ar="لا توجد طلبات تسريع معلقة." />
            </p>
          </div>
        )}

        <div style={{ height: 40 }} />

        <h2>
          <T en="Active & Past Accelerations" ar="التسريعات النشطة والسابقة" />
        </h2>

        {activeAccelerations.length > 0 || otherAccelerations.length > 0 ? (
          <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gb-border)", color: "var(--gb-muted)" }}>
                  <th style={{ padding: 12 }}>Studio</th>
                  <th style={{ padding: 12 }}>Package</th>
                  <th style={{ padding: 12 }}>Priority</th>
                  <th style={{ padding: 12 }}>Duration</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...activeAccelerations, ...otherAccelerations].map((acc: any) => (
                  <tr key={acc.id} style={{ borderBottom: "1px solid var(--gb-border)" }}>
                    <td style={{ padding: 12 }}>{acc.studios?.name}</td>
                    <td style={{ padding: 12 }}>{acc.package_name}</td>
                    <td style={{ padding: 12, color: "var(--gb-gold)" }}>{acc.priority_score}</td>
                    <td style={{ padding: 12, fontSize: "0.9rem" }}>
                      {acc.start_date ? new Date(acc.start_date).toLocaleDateString() : "-"} <br/>
                      <span style={{ color: "var(--gb-muted)" }}>to</span> <br/>
                      {acc.end_date ? new Date(acc.end_date).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: 12 }}>
                      <span className="badge" style={{ 
                        color: acc.status === 'active' ? 'var(--gb-success)' : 'inherit',
                        borderColor: acc.status === 'active' ? 'var(--gb-success)' : 'var(--gb-border)'
                      }}>
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 20 }}>
            <p>
              <T en="No active or past accelerations found." ar="لا يوجد تسريعات نشطة أو سابقة." />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
