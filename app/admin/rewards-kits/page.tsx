import T from "@/components/t";
import Link from "next/link";

export default function AdminRewardsKitsPage() {
  const fulfillmentStatuses = [
    { en: 'Pending', ar: 'قيد الانتظار', class: 'status-pending' },
    { en: 'Approved', ar: 'تمت الموافقة', class: 'status-approved' },
    { en: 'Packed', ar: 'تم التجهيز', class: 'status-packed' },
    { en: 'Shipped', ar: 'تم الشحن', class: 'status-shipped' },
    { en: 'Delivered', ar: 'تم التسليم', class: 'status-delivered' },
    { en: 'Cancelled', ar: 'تم الإلغاء', class: 'status-cancelled' },
  ];

  const sampleOrders = [
    { id: 'GB-K-1001', entity: 'Sound Horizon Studio', type: 'Studio Welcome Kit', status: 'Shipped', date: '2026-05-08' },
    { id: 'GB-K-1002', entity: 'Melody Merchants', type: 'Vendor Welcome Kit', status: 'Packed', date: '2026-05-09' },
    { id: 'GB-K-1003', entity: 'Alex Creator', type: 'Customer Loyalty Kit', status: 'Approved', date: '2026-05-10' },
  ];

  const merchItems = [
    { tier: 'Basic', items: 'Stickers, GB Pins, QR Cards' },
    { tier: 'Premium', items: 'Caps, T-Shirts, GearBeat Notebooks' },
    { tier: 'Partner', items: 'Hoodies, Branded Stands, Metal QR Cards' },
    { tier: 'Elite', items: 'Elite Hoodies, Glass Awards, Premium Bottles, Studio Plaques' },
  ];

  return (
    <div className="rewards-dashboard">
      <header className="admin-header">
        <div className="flex-between">
          <div>
            <h1><T en="Rewards & Welcome Kits" ar="الجوائز وحقائب الترحيب" /></h1>
            <p className="text-muted"><T en="Foundation for partner appreciation, loyalty programs, and physical merch fulfillment." ar="تأسيس لتقدير الشركاء، برامج الولاء، وتنفيذ توزيع المنتجات الملموسة." /></p>
          </div>
          <div className="foundation-badge">
            <T en="UI FOUNDATION ONLY" ar="واجهة تأسيسية فقط" />
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* REWARDS STRATEGY GRID */}
        <div className="strategy-grid">
          <div className="card-premium strategy-card">
            <div className="icon">👤</div>
            <h3><T en="Customer Rewards" ar="جوائز العملاء" /></h3>
            <p className="text-muted"><T en="Points per booking, referral credits, and first-booking welcome kits." ar="نقاط لكل حجز، رصيد إحالة، وحقائب ترحيب للحجز الأول." /></p>
          </div>
          <div className="card-premium strategy-card border-gold">
            <div className="icon">🎙️</div>
            <h3><T en="Studio Partner Rewards" ar="جوائز شركاء الاستوديو" /></h3>
            <p className="text-muted"><T en="Certified plaques, QR display stands, and flagship studio hoodies." ar="دروع موثقة، منصات عرض QR، وسترات الفلاجشيب." /></p>
          </div>
          <div className="card-premium strategy-card">
            <div className="icon">📦</div>
            <h3><T en="Vendor Rewards" ar="جوائز البائعين" /></h3>
            <p className="text-muted"><T en="Product launch kits, verified vendor merch, and event sponsorship kits." ar="حقائب إطلاق المنتجات، منتجات البائع الموثق، وحقائب رعاية الفعاليات." /></p>
          </div>
          <div className="card-premium strategy-card opacity-50">
            <div className="icon">🤝</div>
            <h3><T en="Future Partners" ar="الشركاء المستقبليين" /></h3>
            <p className="text-muted"><T en="Service providers, event partners, and international ticketing rewards." ar="مزودو الخدمات، شركاء الفعاليات، وجوائز التذاكر الدولية." /></p>
          </div>
        </div>

        {/* WELCOME KIT LOGIC */}
        <div className="section-container" style={{ marginTop: 40 }}>
          <h2 className="section-title"><T en="Welcome Kit Trigger Logic" ar="منطق تفعيل حقائب الترحيب" /></h2>
          <div className="card-premium logic-grid">
            <div className="logic-item">
              <span className="bullet">1</span>
              <div>
                <strong><T en="Customer Kit" ar="حقيبة العميل" /></strong>
                <p className="text-muted"><T en="Triggered after first paid and completed booking." ar="تُفعل بعد أول حجز مدفوع ومكتمل." /></p>
              </div>
            </div>
            <div className="logic-item">
              <span className="bullet">2</span>
              <div>
                <strong><T en="Studio Kit" ar="حقيبة الاستوديو" /></strong>
                <p className="text-muted"><T en="Triggered after Approval, Profile Completion, Docs, and Certification." ar="تُفعل بعد الموافقة، إكمال الملف، الوثائق، والتوثيق." /></p>
              </div>
            </div>
            <div className="logic-item">
              <span className="bullet">3</span>
              <div>
                <strong><T en="Vendor Kit" ar="حقيبة البائع" /></strong>
                <p className="text-muted"><T en="Triggered after Agreement signing and first 3 approved products." ar="تُفعل بعد توقيع الاتفاقية وأول 3 منتجات معتمدة." /></p>
              </div>
            </div>
          </div>
        </div>

        {/* MERCH PROGRAM */}
        <div className="section-container" style={{ marginTop: 40 }}>
          <h2 className="section-title"><T en="Merch Program Hierarchy" ar="تسلسل برنامج المنتجات" /></h2>
          <div className="merch-grid">
            {merchItems.map(tier => (
              <div key={tier.tier} className="merch-tier-card card-premium">
                <span className={`tier-label ${tier.tier.toLowerCase()}`}>{tier.tier}</span>
                <p className="items-list">{tier.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FULFILLMENT PREVIEW */}
        <div className="card-premium table-container" style={{ marginTop: 40 }}>
          <div className="table-header">
            <h3><T en="Recent Fulfillment Activity" ar="نشاط التنفيذ الأخير" /></h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th><T en="Entity" ar="الجهة" /></th>
                <th><T en="Type" ar="النوع" /></th>
                <th><T en="Status" ar="الحالة" /></th>
                <th><T en="Date" ar="التاريخ" /></th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map(order => (
                <tr key={order.id}>
                  <td><code className="text-gold">{order.id}</code></td>
                  <td><strong>{order.entity}</strong></td>
                  <td>{order.type}</td>
                  <td>
                    <span className={`pill status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADMIN CONTROL PREVIEW */}
        <div className="section-container" style={{ marginTop: 40 }}>
          <h2 className="section-title"><T en="Fulfillment Control Preview" ar="معاينة التحكم في التنفيذ" /></h2>
          <div className="control-grid">
            <div className="card-premium control-card">
              <div className="flex-between">
                <h4><T en="Kit Configuration" ar="إعدادات الحقائب" /></h4>
                <span className="badge-beta">DEFERRED</span>
              </div>
              <div className="mock-form">
                <div className="mock-input"><T en="Kit Type: Studio Welcome Kit" ar="نوع الحقيبة: حقيبة ترحيب الاستوديو" /></div>
                <div className="mock-input"><T en="Audience: Level 3+ Studios" ar="الجمهور: استوديوهات المستوى 3+" /></div>
                <div className="mock-input"><T en="Trigger: Auto-Approval" ar="المحفز: موافقة تلقائية" /></div>
              </div>
            </div>
            <div className="card-premium control-card">
              <div className="flex-between">
                <h4><T en="Manual Override" ar="تجاوز يدوي" /></h4>
                <span className="badge-beta">DEFERRED</span>
              </div>
              <div className="mock-form">
                <button className="btn btn-outline" disabled><T en="Dispatch Manual Kit" ar="إرسال حقيبة يدوية" /></button>
                <button className="btn btn-outline" style={{ marginTop: 10 }} disabled><T en="Update Stock Levels" ar="تحديث مستويات المخزون" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 53 CLOSEOUT / QA SUMMARY */}
        <div className="card-premium closeout-summary" style={{ marginTop: 40, border: '1px solid rgba(45, 212, 191, 0.2)' }}>
          <div className="flex-between">
            <h3 className="success-text">✅ <T en="Phase 53 Rewards Foundation Complete" ar="اكتمال تأسيس الجوائز المرحلة 53" /></h3>
            <span className="badge success"><T en="QA READINESS" ar="جاهزية الجودة" /></span>
          </div>
          <div className="closeout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24 }}>
            <div className="closeout-column">
              <h4 style={{ fontSize: '0.9rem', marginBottom: 16, color: '#fff' }}><T en="Integrated Features" ar="الميزات المتكاملة" /></h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Admin Rewards Hub</li>
                <li style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Customer Reward Status Model</li>
                <li style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Partner Kit Status Model</li>
                <li style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Merch Hierarchy Defined</li>
                <li style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Fulfillment Lifecycle Prototype</li>
              </ul>
            </div>
            <div className="closeout-column">
              <h4 style={{ fontSize: '0.9rem', marginBottom: 16, color: '#fff' }}><T en="Deferred / Future Roadmap" ar="خارطة الطريق المؤجلة" /></h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: '0.8rem', color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• SQL Tables (Rewards/Inventory)</li>
                <li style={{ fontSize: '0.8rem', color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Real-time Reward Automation</li>
                <li style={{ fontSize: '0.8rem', color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Shipping/Logistic API Sync</li>
                <li style={{ fontSize: '0.8rem', color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>• Server-side Mutations (CRUD)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="disclaimer-box" style={{ marginTop: 40 }}>
          <p className="text-muted">
            <T 
              en="Phase 53 Closing: Rewards and Welcome Kit foundations are established across Admin, Customer, and Partner zones. Next: Partner Portal Integration or Core Fulfillment SQL."
              ar="إغلاق المرحلة 53: تم تأسيس قواعد الجوائز وحقائب الترحيب عبر مناطق المسؤول والعميل والشريك. الخطوة التالية: ربط بوابة الشريك أو قواعد بيانات التنفيذ."
            />
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rewards-dashboard { padding: 40px; color: #fff; }
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

        .strategy-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .strategy-card { padding: 24px; text-align: center; }
        .strategy-card .icon { font-size: 2rem; margin-bottom: 16px; display: block; }
        .strategy-card h3 { font-size: 1rem; margin-bottom: 8px; color: #fff; }
        .strategy-card p { font-size: 0.8rem; line-height: 1.4; }
        .border-gold { border: 1px solid rgba(207, 168, 110, 0.3); }

        .section-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 20px; color: #cfa86e; }

        .logic-grid { padding: 24px; display: grid; gap: 20px; }
        .logic-item { display: flex; gap: 16px; align-items: center; }
        .logic-item .bullet { width: 32px; height: 32px; border-radius: 50%; background: var(--gb-gold); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; flex-shrink: 0; }
        .logic-item strong { display: block; font-size: 0.9rem; color: #fff; }
        .logic-item p { font-size: 0.8rem; margin: 0; }

        .merch-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .merch-tier-card { padding: 20px; text-align: center; }
        .tier-label { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; display: inline-block; }
        .tier-label.basic { background: #333; color: #aaa; }
        .tier-label.premium { background: rgba(207, 168, 110, 0.1); color: var(--gb-gold); }
        .tier-label.partner { background: #cfa86e; color: #000; }
        .tier-label.elite { background: linear-gradient(45deg, #cfa86e, #fff); color: #000; }
        .items-list { font-size: 0.8rem; color: #888; line-height: 1.5; }

        .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .admin-table th { text-align: left; padding: 16px; border-bottom: 2px solid #1a1a1a; color: #555; font-size: 0.8rem; text-transform: uppercase; }
        .admin-table td { padding: 16px; border-bottom: 1px solid #111; font-size: 0.9rem; color: #aaa; }
        
        .pill { padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .status-shipped { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-packed { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-approved { background: rgba(45, 212, 191, 0.1); color: #2dd4bf; }

        .control-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .control-card { padding: 24px; }
        .badge-beta { font-size: 0.6rem; background: #222; color: #555; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .mock-form { margin-top: 20px; }
        .mock-input { background: #0a0a0a; border: 1px solid #222; padding: 12px; border-radius: 4px; margin-bottom: 8px; font-size: 0.8rem; color: #666; }

        .disclaimer-box { padding: 24px; border: 1px dashed #222; border-radius: 12px; text-align: center; }

        [dir="rtl"] .admin-table th { text-align: right; }
      `}} />
    </div>
  );
}
