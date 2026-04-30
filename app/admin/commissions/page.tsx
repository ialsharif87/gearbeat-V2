import Link from "next/link";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { revalidatePath } from "next/cache";
import T from "../../../components/t";

export default async function AdminCommissionsPage() {
  const { admin } = await requireAdminRole(["super_admin", "operations", "finance"]);
  const supabaseAdmin = createAdminClient();

  // Get default commission
  const { data: globalSettings } = await supabaseAdmin
    .from("commission_settings")
    .select("default_percentage")
    .limit(1)
    .maybeSingle();

  const defaultCommission = globalSettings?.default_percentage || 15;

  // Get custom studio commissions
  const { data: customCommissions } = await supabaseAdmin
    .from("studio_commissions")
    .select(`
      id,
      studio_id,
      commission_percentage,
      created_at,
      studios (name, owner_auth_user_id)
    `)
    .order("created_at", { ascending: false });

  // Get all studios for the dropdown to assign custom commission
  const { data: allStudios } = await supabaseAdmin
    .from("studios")
    .select("id, name")
    .eq("status", "approved")
    .order("name", { ascending: true });

  async function updateGlobalCommission(formData: FormData) {
    "use server";
    const supabaseAdmin = createAdminClient();
    const percentage = Number(formData.get("percentage"));

    if (isNaN(percentage) || percentage < 10 || percentage > 30) {
      throw new Error("Invalid percentage value (must be 10-30)");
    }

    // Upsert: update first row or insert if none exists
    const { data: existing } = await supabaseAdmin
      .from("commission_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("commission_settings")
        .update({ default_percentage: percentage })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("commission_settings")
        .insert({ default_percentage: percentage });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin/commissions");
  }

  async function assignCustomCommission(formData: FormData) {
    "use server";
    const supabaseAdmin = createAdminClient();
    const studioId = formData.get("studio_id")?.toString();
    const percentage = Number(formData.get("percentage"));

    if (!studioId || isNaN(percentage) || percentage < 10 || percentage > 30) {
      throw new Error("Invalid parameters");
    }

    // Upsert by studio_id
    const { data: existing } = await supabaseAdmin
      .from("studio_commissions")
      .select("id")
      .eq("studio_id", studioId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("studio_commissions")
        .update({ commission_percentage: percentage })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("studio_commissions")
        .insert({ studio_id: studioId, commission_percentage: percentage });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin/commissions");
  }

  async function removeCustomCommission(formData: FormData) {
    "use server";
    const supabaseAdmin = createAdminClient();
    const id = formData.get("id")?.toString();
    if (!id) throw new Error("Missing ID");

    const { error } = await supabaseAdmin
      .from("studio_commissions")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/commissions");
  }

  return (
    <section className="page">
      <div className="container">
        <div className="section-head">
          <Link href="/admin" className="badge">
            ← <T en="Back to Admin" ar="العودة للإدارة" />
          </Link>

          <h1>
            <T en="Commission Management" ar="إدارة العمولات" />
          </h1>

          <p>
            <T
              en="Set the global marketplace commission rate (10% - 30%) and manage custom rates for specific studios."
              ar="تحديد نسبة العمولة العامة للمنصة (10٪ - 30٪) وإدارة النسب المخصصة لاستوديوهات معينة."
            />
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <span className="badge">
              <T en="Global Setting" ar="الإعداد العام" />
            </span>
            <h2>
              <T en="Default Commission" ar="العمولة الافتراضية" />
            </h2>
            
            <form action={updateGlobalCommission} style={{ marginTop: 20 }}>
              <label>
                <T en="Percentage (10-30%)" ar="النسبة (10-30٪)" />
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  name="percentage"
                  className="input"
                  min="10"
                  max="30"
                  defaultValue={defaultCommission}
                  style={{ width: 100 }}
                  required
                />
                <button type="submit" className="btn btn-small">
                  <T en="Save" ar="حفظ" />
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ gridColumn: "span 2" }}>
            <span className="badge">
              <T en="Custom Rate" ar="نسبة مخصصة" />
            </span>
            <h2>
              <T en="Assign Studio Commission" ar="تعيين عمولة الاستوديو" />
            </h2>

            <form action={assignCustomCommission} style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: 14, alignItems: "end" }}>
                <div>
                  <label>
                    <T en="Select Studio" ar="اختر الاستوديو" />
                  </label>
                  <select name="studio_id" className="input" required>
                    <option value="">-- Choose Studio --</option>
                    {allStudios?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>
                    <T en="Percentage" ar="النسبة" />
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    className="input"
                    min="10"
                    max="30"
                    placeholder="15"
                    required
                  />
                </div>
                <div>
                  <button type="submit" className="btn" style={{ minHeight: 52 }}>
                    <T en="Assign Rate" ar="تعيين النسبة" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div style={{ height: 40 }} />

        <h2>
          <T en="Custom Studio Rates" ar="النسب المخصصة للاستوديوهات" />
        </h2>

        {customCommissions && customCommissions.length > 0 ? (
          <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gb-border)", color: "var(--gb-muted)" }}>
                  <th style={{ padding: 12 }}>Studio</th>
                  <th style={{ padding: 12 }}>Rate</th>
                  <th style={{ padding: 12 }}>Assigned On</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customCommissions.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--gb-border)" }}>
                    <td style={{ padding: 12 }}>{c.studios?.name}</td>
                    <td style={{ padding: 12, fontWeight: "bold", color: "var(--gb-gold)" }}>{c.commission_percentage}%</td>
                    <td style={{ padding: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      <form action={removeCustomCommission}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="badge" style={{ border: 0, background: "rgba(226, 109, 90, 0.1)", color: "var(--gb-danger)", cursor: "pointer" }}>
                          Remove
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
              <T en="No custom commissions have been assigned. All studios are using the default rate." ar="لا توجد عمولات مخصصة. جميع الاستوديوهات تستخدم النسبة الافتراضية." />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
