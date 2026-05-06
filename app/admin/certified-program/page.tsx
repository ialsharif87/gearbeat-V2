import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import Link from "next/link";

export default async function AdminCertifiedProgramPage() {
  const supabase = await createClient();

  const { data: pendingStudios, error } = await supabase
    .from("certified_studios")
    .select(`
      id,
      status,
      created_at,
      studios(
        name,
        slug
      ),
      studio_tiers(
        name_en,
        level
      )
    `)
    .eq("status", "pending");

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1><T en="Certified Program Management" ar="إدارة برنامج التوثيق" /></h1>
      </header>

      <div className="admin-content">
        <div className="card">
          <h2><T en="Pending Certifications" ar="طلبات التوثيق المعلقة" /></h2>
          
          <div className="table-wrapper" style={{ marginTop: 20 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th><T en="Studio" ar="الاستوديو" /></th>
                  <th><T en="Proposed Tier" ar="المستوى المقترح" /></th>
                  <th><T en="Date Requested" ar="تاريخ الطلب" /></th>
                  <th><T en="Actions" ar="الإجراءات" /></th>
                </tr>
              </thead>
              <tbody>
                {pendingStudios && pendingStudios.length > 0 ? (
                  pendingStudios.map((req: any) => (
                    <tr key={req.id}>
                      <td>{req.studios?.name}</td>
                      <td>
                        <span className={`tier-tag-mini tier-${req.studio_tiers?.level}`}>
                          {req.studio_tiers?.name_en}
                        </span>
                      </td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn-success-small"><T en="Approve" ar="موافقة" /></button>
                          <button className="btn-danger-small"><T en="Reject" ar="رفض" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>
                      <T en="No pending certifications" ar="لا توجد طلبات توثيق معلقة" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-page { padding: 30px; }
        .admin-header { margin-bottom: 30px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 12px; border-bottom: 2px solid #222; color: #888; }
        .admin-table td { padding: 16px 12px; border-bottom: 1px solid #1a1a1a; }
        
        .btn-success-small {
          background: #28a745; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;
        }
        .btn-danger-small {
          background: #dc3545; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;
        }
      ` }} />
    </div>
  );
}
