import { requireAdminLayoutAccess } from "../../../lib/route-guards";
import T from "../../../components/t";
import { revalidatePath } from "next/cache";

export default async function AdminVendorsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: vendors } = await supabaseAdmin
    .from("vendor_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  async function updateVendorStatus(formData: FormData) {
    "use server";
    const vendorId = formData.get("vendor_id") as string;
    const status = formData.get("status") as string;

    const { createAdminClient } = await import("../../../lib/supabase/admin");
    const admin = createAdminClient();

    await admin
      .from("vendor_profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", vendorId);

    revalidatePath("/admin/vendors");
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Marketplace Administration" ar="إدارة السوق" />
          </span>
          <h1><T en="Vendor Management" ar="إدارة التجار" /></h1>
          <p><T en="Review and approve vendor applications and compliance." ar="مراجعة واعتماد طلبات التجار والامتثال." /></p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><T en="Business" ar="المنشأة" /></th>
              <th><T en="Contact" ar="التواصل" /></th>
              <th><T en="Compliance" ar="الامتثال" /></th>
              <th><T en="Status" ar="الحالة" /></th>
              <th><T en="Actions" ar="الإجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {!vendors || vendors.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                  <T en="No vendors found." ar="لا يوجد تجار." />
                </td>
              </tr>
            ) : (
              vendors.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.business_name_en}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{v.business_name_ar}</div>
                  </td>
                  <td>
                    <div>{v.contact_email}</div>
                    <div style={{ fontSize: '0.85rem' }}>{v.contact_phone}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${v.compliance_status === 'approved' ? 'success' : 'warning'}`}>
                      {v.compliance_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${v.status === 'approved' ? 'success' : v.status === 'pending' ? 'warning' : 'danger'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <form action={updateVendorStatus}>
                        <input type="hidden" name="vendor_id" value={v.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button type="submit" className="btn btn-small btn-success">
                          <T en="Approve" ar="اعتماد" />
                        </button>
                      </form>
                      <form action={updateVendorStatus}>
                        <input type="hidden" name="vendor_id" value={v.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <button type="submit" className="btn btn-small btn-danger">
                          <T en="Reject" ar="رفض" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
