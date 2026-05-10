import T from "@/components/t";
import Link from "next/link";

export default function AdminOperationsCrmPage() {
  const sampleLeads = [
    { id: 1, name: "Sound Horizon Studio", type: "Studio Owner", stage: "Vetting", priority: "High", assigned: "Sarah", source: "Studio App", followUp: "Contacted", portalStatus: "Documents pending" },
    { id: 2, name: "Blue Note Gear", type: "Vendor", stage: "Legal", priority: "Medium", assigned: "Omar", source: "Seller App", followUp: "Waiting", portalStatus: "Contract pending" },
    { id: 3, name: "Aria Heights", type: "Studio Owner", stage: "Inbound", priority: "Low", assigned: "Unassigned", source: "Manual", followUp: "Not Contacted", portalStatus: "Not invited" },
    { id: 4, name: "Melody Merchants", type: "Vendor", stage: "Activated", priority: "High", assigned: "Sarah", source: "Seller App", followUp: "Closed", portalStatus: "Active partner" },
    { id: 5, name: "Desert Sound", type: "Studio Owner", stage: "Vetting", priority: "High", assigned: "Sarah", source: "Certified Studio", followUp: "Follow-up Due", portalStatus: "Profile pending" },
    { id: 6, name: "Event Horizon", type: "Event Partner", stage: "Inbound", priority: "Medium", assigned: "Omar", source: "Manual", followUp: "Contacted", portalStatus: "Invited" },
    { id: 7, name: "Pro Audio Services", type: "Service Provider", stage: "Vetting", priority: "Medium", assigned: "Sarah", source: "Manual", followUp: "Contacted", portalStatus: "Ready for approval" },
  ];

  const pipelineStages = [
    { key: 'Inbound', en: 'Inbound', ar: 'وارد' },
    { key: 'Vetting', en: 'Vetting', ar: 'تدقيق' },
    { key: 'Legal', en: 'Legal', ar: 'قانوني' },
    { key: 'Activated', en: 'Activated', ar: 'مفعل' },
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
            <span className="label"><T en="Partner Readiness" ar="جاهزية الشركاء" /></span>
            <strong className="value">8</strong>
          </div>
          <div className="card-premium stat-box">
            <span className="label"><T en="Active Partners" ar="شركاء نشطون" /></span>
            <strong className="value success">5</strong>
          </div>
        </div>

        {/* ARCHITECTURE CLARITY SECTION */}
        <div className="architecture-box card-premium">
          <div className="arch-item">
            <div className="arch-icon">⚙️</div>
            <div className="arch-text">
              <h4><T en="Internal CRM Pipeline" ar="خط العمليات الداخلي" /></h4>
              <p><T en="The administrative relationship pipeline for internal GearBeat operations and relationship management." ar="خط علاقات إداري لعمليات GearBeat الداخلية وإدارة العلاقات." /></p>
            </div>
          </div>
          <div className="arch-divider" />
          <div className="arch-item">
            <div className="arch-icon">🌐</div>
            <div className="arch-text">
              <h4><T en="Partner Portal / Extranet" ar="بوابة الشركاء / إكسترانت" /></h4>
              <p><T en="FUTURE: External-facing dashboard for partners to manage their own profiles, gear, and bookings." ar="مستقبلاً: لوحة تحكم خارجية للشركاء لإدارة ملفاتهم الشخصية ومعداتهم وحجوزاتهم." /></p>
            </div>
          </div>
        </div>

        {/* PIPELINE VIEW */}
        <h2 className="section-title"><T en="Pipeline Stages" ar="مراحل التدفق" /></h2>
        <div className="pipeline-grid">
          {pipelineStages.map((stage) => {
            const stageLeads = sampleLeads.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} className="pipeline-card">
                <div className="stage-header">
                  <T en={stage.en} ar={stage.ar} />
                  <span className="count">{stageLeads.length}</span>
                </div>
                <div className="stage-body">
                  {stageLeads.length > 0 ? stageLeads.map(lead => (
                    <div key={lead.id} className="lead-mini-card">
                      <div className="flex-between">
                        <span className="lead-name">{lead.name}</span>
                        <span className={`priority-dot ${lead.priority.toLowerCase()}`} />
                      </div>
                      <div className="lead-meta">
                        <span className="source-label">{lead.source}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="placeholder-card" />
                  )}
                </div>
              </div>
            );
          })}
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
                <th><T en="Portal Readiness" ar="جاهزية البوابة" /></th>
                <th><T en="Priority" ar="الأولوية" /></th>
                <th style={{ textAlign: 'right' }}><T en="Actions" ar="الإجراءات" /></th>
              </tr>
            </thead>
            <tbody>
              {sampleLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="entity-info">
                      <strong>{lead.name}</strong>
                      <span className="type-subtext">{lead.source}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-pill">{lead.type}</span>
                  </td>
                  <td>
                    <span className={`pill stage-${lead.stage.toLowerCase()}`}>{lead.stage}</span>
                  </td>
                  <td>
                    <span className={`pill portal-${lead.portalStatus.toLowerCase().replace(/ /g, '-')}`}>{lead.portalStatus}</span>
                  </td>
                  <td>
                    <span className={`priority-label ${lead.priority.toLowerCase()}`}>{lead.priority}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button className="btn-icon" title="View Details">👁️</button>
                      <button className="btn-icon" title="Edit" disabled>📝</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXPORT FOUNDATION */}
        <div className="card-premium export-box" style={{ marginTop: 40 }}>
          <div className="flex-between">
            <div>
              <h3><T en="Data Export Foundation" ar="تأسيس تصدير البيانات" /></h3>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}><T en="Field mapping for external CRM & Reporting workflows." ar="رسم الخرائط لتدفقات العمل الخارجية للتقارير." /></p>
            </div>
            <div className="btn-group">
              <button className="btn btn-outline" disabled><T en="Export CSV — Coming Soon" ar="تصدير CSV - قريباً" /></button>
              <button className="btn btn-outline" style={{ marginLeft: 10 }} disabled><T en="Google Sheets Sync — Future" ar="مزامنة Google Sheets - مستقبلاً" /></button>
            </div>
          </div>
          <div className="export-preview">
            <span className="label"><T en="Mapped Fields:" ar="الحقول المرسومة:" /></span>
            <div className="field-tags">
              {['relationship_name', 'partner_type', 'source', 'pipeline_stage', 'priority', 'follow_up_status', 'portal_readiness', 'assigned_to', 'last_contacted', 'next_follow_up', 'notes'].map(f => (
                <span key={f} className="field-tag">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* OPERATIONS NOTES & FOLLOW-UP */}
        <div className="card-premium notes-container" style={{ marginTop: 40 }}>
          <div className="table-header">
            <h3><T en="Internal Operations Notes" ar="ملاحظات العمليات الداخلية" /></h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th><T en="Entity" ar="الجهة" /></th>
                <th><T en="Latest Note" ar="آخر ملاحظة" /></th>
                <th><T en="Next Follow-up" ar="المتابعة القادمة" /></th>
                <th><T en="Owner" ar="المسؤول" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sound Horizon</strong></td>
                <td><span className="text-muted italic">&quot;Awaiting electrical safety certificates for Studio A.&quot;</span></td>
                <td><span className="text-gold">May 15, 2026</span></td>
                <td>Sarah</td>
              </tr>
              <tr>
                <td><strong>Blue Note Gear</strong></td>
                <td><span className="text-muted italic">&quot;Draft contract sent to legal team for final review.&quot;</span></td>
                <td>May 20, 2026</td>
                <td>Omar</td>
              </tr>
            </tbody>
          </table>
          <div className="internal-reminder">
            <span className="icon">📝</span>
            <p><T en="Internal-only: Notes are only visible to GearBeat admins. Partners do not see these audits." ar="للإدارة فقط: الملاحظات مرئية فقط لمسؤولي GearBeat. الشركاء لا يرون هذه التدقيقات." /></p>
          </div>
        </div>

        {/* PHASE 52 CLOSEOUT / QA SUMMARY */}
        <div className="card-premium closeout-summary" style={{ marginTop: 40, border: '1px solid rgba(45, 212, 191, 0.2)' }}>
          <div className="flex-between">
            <h3 className="success-text">✅ <T en="Phase 52 CRM Foundation Complete" ar="اكتمال تأسيس CRM المرحلة 52" /></h3>
            <span className="badge success"><T en="QA READINESS" ar="جاهزية الجودة" /></span>
          </div>
          <div className="closeout-grid">
            <div className="closeout-column">
              <h4><T en="Integrated Features" ar="الميزات المتكاملة" /></h4>
              <ul>
                <li>Dashboard Overview & Stats</li>
                <li>Pipeline Stage Visualization</li>
                <li>Multi-type Partner Mapping</li>
                <li>Portal Readiness Tracking</li>
                <li>Export Field Model</li>
                <li>Notes/Follow-up Model</li>
              </ul>
            </div>
            <div className="closeout-column">
              <h4><T en="Deferred / Future Roadmap" ar="خارطة الطريق المؤجلة" /></h4>
              <ul className="text-muted">
                <li>Live Data Integration (SQL/RPC)</li>
                <li>Real CSV/Sheets Export</li>
                <li>Status Mutations (UI Actions)</li>
                <li>CRM Audit Event Persistence</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="disclaimer-box" style={{ marginTop: 40 }}>
          <p className="text-muted">
            <T 
              en="Phase 52 Closing: This dashboard serves as the operational prototype for GearBeat relationship management. Next Phase: CRM Data Integration or Partner Portal Activation."
              ar="إغلاق المرحلة 52: تخدم لوحة التحكم هذه كنموذج أولي لعمليات إدارة العلاقات في GearBeat. المرحلة القادمة: ربط بيانات CRM أو تفعيل بوابة الشركاء."
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
        .architecture-box { display: flex; gap: 40px; padding: 24px; background: rgba(255,255,255,0.02); margin-bottom: 40px; align-items: center; }
        .arch-item { display: flex; gap: 16px; flex: 1; }
        .arch-icon { font-size: 1.5rem; opacity: 0.5; }
        .arch-text h4 { font-size: 0.9rem; color: #fff; margin-bottom: 4px; }
        .arch-text p { font-size: 0.75rem; color: #666; margin: 0; line-height: 1.4; }
        .arch-divider { width: 1px; height: 40px; background: #222; }

        .pipeline-card { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; min-height: 250px; }
        .stage-header { padding: 12px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid #1a1a1a; display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .stage-body { padding: 12px; display: grid; gap: 10px; align-content: start; }
        .placeholder-card { height: 60px; background: rgba(255,255,255,0.01); border: 1px dashed #222; border-radius: 8px; }

        .lead-mini-card { background: #0a0a0a; border: 1px solid #222; padding: 12px; border-radius: 8px; }
        .lead-name { font-size: 0.85rem; font-weight: 600; color: #fff; }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; }
        .priority-dot.high { background: #ef4444; box-shadow: 0 0 5px #ef4444; }
        .priority-dot.medium { background: #f59e0b; }
        .priority-dot.low { background: #444; }
        .lead-meta { margin-top: 8px; display: flex; gap: 6px; }
        .source-label { font-size: 0.6rem; color: #555; text-transform: uppercase; border: 1px solid #222; padding: 1px 4px; border-radius: 2px; }

        .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .admin-table th { text-align: left; padding: 16px; border-bottom: 2px solid #1a1a1a; color: #555; font-size: 0.8rem; text-transform: uppercase; }
        .admin-table td { padding: 16px; border-bottom: 1px solid #111; font-size: 0.9rem; color: #aaa; }
        
        .entity-info strong { display: block; color: #fff; }
        .type-subtext { font-size: 0.75rem; color: #555; }

        .pill { padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .type-pill { font-size: 0.7rem; color: #aaa; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }

        .stage-vetting { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stage-legal { background: rgba(207, 168, 11, 0.1); color: #cfa86e; }
        .stage-activated { background: rgba(45, 212, 191, 0.1); color: #2dd4bf; }
        .stage-inbound { background: rgba(255,255,255,0.05); color: #888; }

        .portal-not-invited { border: 1px solid #444; color: #555; }
        .portal-invited { border: 1px solid #3b82f6; color: #3b82f6; }
        .portal-profile-pending { border: 1px solid #f59e0b; color: #f59e0b; }
        .portal-documents-pending { border: 1px solid #ef4444; color: #ef4444; }
        .portal-contract-pending { border: 1px solid #cfa86e; color: #cfa86e; }
        .portal-ready-for-approval { border: 1px solid #2dd4bf; color: #2dd4bf; }
        .portal-active-partner { background: rgba(45, 212, 191, 0.1); color: #2dd4bf; border: 1px solid transparent; }

        .priority-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; }
        .priority-label.high { color: #ef4444; }
        .priority-label.medium { color: #f59e0b; }
        .priority-label.low { color: #444; }

        .export-preview { margin-top: 20px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .export-preview .label { font-size: 0.7rem; color: #555; text-transform: uppercase; margin-bottom: 12px; display: block; }
        .field-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .field-tag { font-size: 0.7rem; color: #888; background: #111; padding: 4px 8px; border: 1px solid #222; border-radius: 4px; font-family: monospace; }

        .internal-reminder { display: flex; gap: 12px; padding: 16px; background: rgba(207, 168, 110, 0.05); margin-top: 20px; border-radius: 8px; align-items: center; }
        .internal-reminder p { font-size: 0.75rem; color: #888; margin: 0; }
        .italic { font-style: italic; }
        .text-gold { color: var(--gb-gold); }

        .closeout-summary { padding: 32px; }
        .success-text { color: #2dd4bf; margin: 0; }
        .closeout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; }
        .closeout-column h4 { font-size: 0.9rem; margin-bottom: 16px; color: #fff; }
        .closeout-column ul { list-style: none; padding: 0; margin: 0; }
        .closeout-column li { font-size: 0.8rem; color: #888; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .closeout-column li::before { content: '•'; color: var(--gb-gold); }

        .action-group { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-icon { background: transparent; border: 1px solid #222; color: #aaa; padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
        .btn-icon:hover { border-color: var(--gb-gold); color: #fff; }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .disclaimer-box { padding: 24px; border: 1px dashed #222; border-radius: 12px; text-align: center; }

        [dir="rtl"] .admin-table th { text-align: right; }
        [dir="rtl"] .action-group { justify-content: flex-start; }
      `}} />
    </div>
  );
}
