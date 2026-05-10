import T from "@/components/t";
import Link from "next/link";
import StudioTierBadge from "@/components/studio-tier-badge";

import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminCertifiedStudiosPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // Fetch certified studios with related studio and tier data
  const { data: certifiedData, error } = await supabaseAdmin
    .from("certified_studios")
    .select(`
      id,
      status,
      created_at,
      studio:studios (
        name_en,
        name_ar,
        slug
      ),
      tier:studio_tiers (
        level,
        name_en,
        name_ar
      )
    `)
    .order("created_at", { ascending: false });

  const mapLevelToTier = (level: number): any => {
    switch (level) {
      case 1: return 'verified';
      case 2: return 'trusted';
      case 3: return 'premium';
      case 4: return 'elite';
      case 5: return 'flagship';
      default: return 'verified';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#2dd4bf';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      case 'expired': return '#666';
      default: return '#fff';
    }
  };

  return (
    <div className="admin-certified-page">
      <header className="admin-header">
        <div className="flex-between">
          <div>
            <h1><T en="Certified Studios" ar="الاستوديوهات الموثقة" /></h1>
            <p className="text-muted"><T en="Manage studio certification tiers and trust status." ar="إدارة فئات توثيق الاستوديو وحالة الثقة." /></p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-primary" disabled>
              <T en="Add New Certification" ar="إضافة توثيق جديد" />
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <div className="card-premium stats-row">
          <div className="stat-item">
            <span className="label"><T en="Total Certified" ar="إجمالي الموثقين" /></span>
            <strong className="value">{(certifiedData || []).filter(c => c.status === 'approved').length}</strong>
          </div>
          <div className="stat-item">
            <span className="label"><T en="Pending Review" ar="في انتظار المراجعة" /></span>
            <strong className="value text-gold">{(certifiedData || []).filter(c => c.status === 'pending').length}</strong>
          </div>
          <div className="stat-item">
            <span className="label"><T en="Issues/Expired" ar="مشاكل / منتهي" /></span>
            <strong className="value" style={{ color: '#ef4444' }}>{(certifiedData || []).filter(c => c.status === 'suspended' || c.status === 'expired').length}</strong>
          </div>
        </div>

        <div className="card-premium table-container" style={{ marginTop: 30 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th><T en="Studio Name" ar="اسم الاستوديو" /></th>
                <th><T en="Tier" ar="الفئة" /></th>
                <th><T en="Status" ar="الحالة" /></th>
                <th><T en="Last Verified" ar="آخر توثيق" /></th>
                <th style={{ textAlign: 'right' }}><T en="Actions" ar="الإجراءات" /></th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
                    <T en="Error loading certification data." ar="خطأ في تحميل بيانات التوثيق." />
                  </td>
                </tr>
              ) : certifiedData && certifiedData.length > 0 ? (
                certifiedData.map((cert: any) => (
                  <tr key={cert.id}>
                    <td>
                      <div className="studio-info">
                        <strong>{cert.studio?.name_en || cert.studio?.name_ar || '—'}</strong>
                        <span className="slug-text">/{cert.studio?.slug || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <StudioTierBadge tier={mapLevelToTier(cert.tier?.level || 1)} showIcon={false} />
                    </td>
                    <td>
                      <span className="status-pill" style={{ borderColor: getStatusColor(cert.status), color: getStatusColor(cert.status) }}>
                        <T en={cert.status.toUpperCase()} ar={cert.status === 'approved' ? 'مقبول' : cert.status === 'pending' ? 'معلق' : cert.status === 'suspended' ? 'موقوف' : 'منتهي'} />
                      </span>
                    </td>
                    <td>{new Date(cert.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group">
                        <Link href={`/gearbeat-certified/${cert.studio?.slug}`} target="_blank" className="btn-icon" title="View Certificate">👁️</Link>
                        <button className="btn-icon" title="Review" disabled>📝</button>
                        <button className="btn-icon" title="Approve" disabled>✅</button>
                        <button className="btn-icon" title="Suspend" disabled>🚫</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                    <T en="No certified studios found." ar="لم يتم العثور على استوديوهات موثقة." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="disclaimer-box" style={{ marginTop: 40 }}>
          <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
            <T 
              en="Note: This is a UI foundation page. Live status management, database integration, and certification mutations will be enabled in a future patch."
              ar="ملاحظة: هذه صفحة تأسيسية للواجهة. سيتم تفعيل إدارة الحالة المباشرة، والتكامل مع قاعدة البيانات، وعمليات التوثيق في تحديث قادم."
            />
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-certified-page { padding: 40px; }
        .admin-header { margin-bottom: 40px; }
        .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
        
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; padding: 30px; }
        .stat-item .label { display: block; font-size: 0.75rem; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat-item .value { font-size: 2rem; font-weight: 900; }

        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 16px; border-bottom: 2px solid #1a1a1a; color: #555; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .admin-table td { padding: 20px 16px; border-bottom: 1px solid #111; vertical-align: middle; }
        
        .studio-info strong { display: block; font-size: 1rem; color: #fff; }
        .slug-text { font-size: 0.75rem; color: #444; }

        .status-pill {
          padding: 4px 12px;
          border: 1px solid;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .action-group { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-icon {
          width: 36px; height: 36px; border: 1px solid #222; background: #000; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none;
          transition: all 0.2s; font-size: 1rem;
        }
        .btn-icon:hover { border-color: var(--gb-gold); background: rgba(201, 162, 77, 0.1); transform: translateY(-2px); }

        .disclaimer-box {
          padding: 20px; border: 1px dashed #222; border-radius: 12px; text-align: center;
        }

        [dir="rtl"] .admin-table th { text-align: right; }
        [dir="rtl"] .action-group { justify-content: flex-start; }
      `}} />
    </div>
  );
}
