import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number | string;
  results_json?: {
    reach?: number;
  };
  created_at?: string;
}

export default async function AdminPREnginePage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("pr_campaigns")
    .select("*")
    .order('created_at', { ascending: false });

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1><T en="PR &amp; Marketing Launch Engine" ar="محرك إطلاق العلاقات العامة والتسويق" /></h1>
      </header>

      <div className="admin-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}>
          <div className="card stat-card">
            <div className="stat-label"><T en="Active Campaigns" ar="الحملات النشطة" /></div>
            <div className="stat-value">{campaigns?.filter(c => c.status === 'active').length || 0}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label"><T en="Total Budget" ar="إجمالي الميزانية" /></div>
            <div className="stat-value">{campaigns?.reduce((acc, c) => acc + (Number(c.budget) || 0), 0).toLocaleString()} SAR</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label"><T en="Creator Partners" ar="الشركاء المبدعين" /></div>
            <div className="stat-value">24</div> {/* Placeholder for now */}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2><T en="Marketing Campaigns" ar="الحملات التسويقية" /></h2>
            <button className="btn-gold-small"><T en="+ New Campaign" ar="+ حملة جديدة" /></button>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><T en="Campaign Name" ar="اسم الحملة" /></th>
                  <th><T en="Type" ar="النوع" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                  <th><T en="Budget" ar="الميزانية" /></th>
                  <th><T en="Reach" ar="الوصول" /></th>
                  <th><T en="Actions" ar="الإجراءات" /></th>
                </tr>
              </thead>
              <tbody>
                {campaigns && campaigns.length > 0 ? (
                  campaigns.map((camp: Campaign) => (
                    <tr key={camp.id}>
                      <td><strong>{camp.name}</strong></td>
                      <td>{camp.type}</td>
                      <td>
                        <span className={`status-pill ${camp.status}`}>
                          {camp.status}
                        </span>
                      </td>
                      <td>{Number(camp.budget).toLocaleString()} SAR</td>
                      <td>{(camp.results_json?.reach || 0).toLocaleString()}</td>
                      <td>
                        <button className="btn-gold-small"><T en="Analytics" ar="التحليلات" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                      <T en="No campaigns found" ar="لا توجد حملات" />
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
        
        .stat-card { padding: 24px; text-align: center; }
        .stat-label { color: #888; font-size: 0.9rem; margin-bottom: 8px; }
        .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--gb-gold, #d4af37); }

        .status-pill { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.active { background: rgba(40, 167, 69, 0.1); color: #28a745; }
        .status-pill.draft { background: rgba(255, 255, 255, 0.05); color: #aaa; }

        .btn-gold-small {
          background: var(--gb-gold, #d4af37); color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;
        }
      ` }} />
    </div>
  );
}
