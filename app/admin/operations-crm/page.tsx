import T from "@/components/t";
import Link from "next/link";

export default function AdminOperationsCrmPage() {
  const sampleLeads = [
    { id: 1, name: "Sound Horizon Studio", type: "Studio", stage: "Vetting", priority: "High", assigned: "Sarah" },
    { id: 2, name: "Blue Note Gear", type: "Vendor", stage: "Contracting", priority: "Medium", assigned: "Omar" },
    { id: 3, name: "Aria Heights", type: "Studio", stage: "New", priority: "Low", assigned: "Unassigned" },
    { id: 4, name: "Melody Merchants", type: "Vendor", stage: "Activated", priority: "High", assigned: "Sarah" },
  ];

  return (
    <div className="crm-dashboard">
      <header className="admin-header">
        <div className="flex-between">
          <div>
            <h1><T en="Operations CRM" ar="إدارة العمليات والعلاقات" /></h1>
            <p className="text-muted"><T en="Consolidated view for lead management and relationship tracking." ar="عرض موحد لإدارة العملاء المحتملين وتتبع العلاقات." /></p>
          </div>
          <div className="foundation-badge">
            <T en="UI FOUNDATION ONLY" ar="واجهة تأسيسية فقط" />
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* STATS OVERVIEW */}
        <div className="stats-grid">
          <div className="card-premium stat-box">
            <span className="label"><T en="Active Leads" ar="العملاء المحتملين" /></span>
            <strong className="value">124</strong>
          </div>
          <div className="card-premium stat-box">
            <span className="label"><T en="Audits in Progress" ar="عمليات التدقيق" /></span>
            <strong className="value text-gold">12</strong>
          </div>
          <div className="card-premium stat-box">
            <span className="label"><T en="Contracts Pending" ar="عقود معلقة" /></span>
            <strong className="value">8</strong>
          </div>
          <div className="card-premium stat-box">
            <span className="label"><T en="Recent Approvals" ar="موافقات حديثة" /></span>
            <strong className="value success">5</strong>
          </div>
        </div>

        {/* PIPELINE VIEW */}
        <h2 className="section-title"><T en="Pipeline Stages" ar="مراحل التدفق" /></h2>
        <div className="pipeline-grid">
          {['Inbound', 'Vetting', 'Legal', 'Activated'].map((stage, idx) => (
            <div key={stage} className="pipeline-card">
              <div className="stage-header">
                <span>{stage}</span>
                <span className="count">{idx * 3 + 2}</span>
              </div>
              <div className="stage-body">
                <div className="placeholder-card" />
                <div className="placeholder-card" />
              </div>
            </div>
          ))}
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <div className="card-premium table-container" style={{ marginTop: 40 }}>
          <div className="table-header flex-between">
            <h3><T en="Recent Relationship Activity" ar="النشاط الأخير في العلاقات" /></h3>
            <button className="btn btn-outline" disabled><T en="Export CSV" ar="تصدير CSV" /></button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th><T en="Entity Name" ar="اسم الجهة" /></th>
                <th><T en="Type" ar="النوع" /></th>
                <th><T en="Stage" ar="المرحلة" /></th>
                <th><T en="Priority" ar="الأولوية" /></th>
                <th><T en="Assigned" ar="المسؤول" /></th>
                <th style={{ textAlign: 'right' }}><T en="Actions" ar="الإجراءات" /></th>
              </tr>
            </thead>
            <tbody>
              {sampleLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.type}</td>
                  <td>
                    <span className={`pill stage-${lead.stage.toLowerCase()}`}>{lead.stage}</span>
                  </td>
                  <td>
                    <span className={`priority-${lead.priority.toLowerCase()}`}>{lead.priority}</span>
                  </td>
                  <td>{lead.assigned}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" title="View Details">👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="disclaimer-box" style={{ marginTop: 40 }}>
          <p className="text-muted">
            <T 
              en="Note: This is a UI foundation. Real-time data integration for lead pipelines and relationship assignments will be enabled in future patches."
              ar="ملاحظة: هذه واجهة تأسيسية. سيتم تفعيل ربط البيانات المباشر لتدفقات العملاء وتعيينات العلاقات في التحديثات القادمة."
            />
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .crm-dashboard { padding: 40px; color: #fff; }
        .admin-header { margin-bottom: 40px; }
        .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
        
        .foundation-badge {
          background: rgba(207, 168, 110, 0.1);
          border: 1px solid var(--gb-gold);
          color: var(--gb-gold);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-box { padding: 24px; text-align: center; }
        .stat-box .label { display: block; font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat-box .value { font-size: 1.8rem; font-weight: 900; }
        .stat-box .success { color: #2dd4bf; }

        .section-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 20px; color: #cfa86e; }

        .pipeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .pipeline-card { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
        .stage-header { padding: 12px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid #1a1a1a; display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #888; }
        .stage-body { padding: 12px; display: grid; gap: 8px; }
        .placeholder-card { height: 60px; background: rgba(255,255,255,0.01); border: 1px dashed #222; border-radius: 8px; }

        .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .admin-table th { text-align: left; padding: 16px; border-bottom: 2px solid #1a1a1a; color: #555; font-size: 0.8rem; text-transform: uppercase; }
        .admin-table td { padding: 16px; border-bottom: 1px solid #111; font-size: 0.9rem; color: #aaa; }
        
        .pill { padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; }
        .stage-vetting { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stage-contracting { background: rgba(207, 168, 110, 0.1); color: #cfa86e; }
        .stage-activated { background: rgba(45, 212, 191, 0.1); color: #2dd4bf; }
        .stage-new { background: rgba(255,255,255,0.05); color: #888; }

        .priority-high { color: #ef4444; font-weight: 800; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #555; }

        .btn-icon { background: transparent; border: 1px solid #222; color: #fff; padding: 6px; border-radius: 4px; cursor: pointer; }
        .disclaimer-box { padding: 24px; border: 1px dashed #222; border-radius: 12px; text-align: center; }

        [dir="rtl"] .admin-table th { text-align: right; }
      `}} />
    </div>
  );
}
