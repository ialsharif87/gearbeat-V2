import T from "@/components/t";
import Link from "next/link";

export default function TicketingPartnerFoundationPage() {
  const eventTypes = [
    "Event Organizer", "Venue", "Promoter", "Workshop Host",
    "Listening Session Host", "Brand Activation Partner"
  ];

  const ticketTypes = [
    "General Admission", "VIP", "Early Bird",
    "Group Ticket", "Guest List", "Platinum Package"
  ];

  const capabilities = [
    { label: 'Events', icon: '📅' },
    { label: 'Ticket Types', icon: '🎫' },
    { label: 'Orders', icon: '📊' },
    { label: 'Attendees', icon: '👥' },
    { label: 'QR Check-in', icon: '📱' },
    { label: 'Promo Codes', icon: '🏷️' },
    { label: 'Reports', icon: '📈' },
    { label: 'Payouts', icon: '💰' },
    { label: 'Refunds', icon: '↩️' },
    { label: 'Support', icon: '🎧' },
  ];

  return (
    <div className="partner-portal-foundation">
      <header className="portal-hero" style={{ background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.1), transparent)' }}>
        <div className="container">
          <div className="hero-content">
            <Link href="/partner" className="text-gold" style={{ fontSize: '0.8rem', textDecoration: 'none', display: 'block', marginBottom: 20 }}>
              ← <T en="Back to Partner Hub" ar="العودة لمركز الشركاء" />
            </Link>
            <span className="eyebrow" style={{ color: '#ec4899' }}><T en="TICKETING PARTNER TRACK" ar="مسار شريك التذاكر" /></span>
            <h1 className="hero-title">
              <T en="Ticketing Partner Portal" ar="بوابة شريك التذاكر" />
            </h1>
            <p className="hero-desc">
              <T
                en="Premium extranet foundation for event organizers and venues to manage ticket sales, attendees, and QR check-ins."
                ar="تأسيس إكسترانت متميز لمنظمي الفعاليات والمرافق لإدارة مبيعات التذاكر والحضور وتسجيل الدخول عبر QR."
              />
            </p>
            <div className="foundation-tag" style={{ color: '#ec4899', borderColor: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' }}>
              <T en="Coming Soon — Foundation Only" ar="قريباً — تأسيس فقط" />
            </div>
          </div>
        </div>
      </header>

      <main className="container main-layout">
        <section className="section-container">
          <div className="section-header">
            <h2><T en="Event Partner Ecosystem" ar="نظام فعاليات الشركاء" /></h2>
          </div>
          <div className="service-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {eventTypes.map(s => (
              <span key={s} style={{ padding: '8px 16px', background: '#111', border: '1px solid #222', borderRadius: 99, fontSize: '0.85rem', color: '#888' }}>
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Ticket Type Preview" ar="معاينة أنواع التذاكر" /></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ticketTypes.map(t => (
              <div key={t} className="card-premium" style={{ textAlign: 'center', padding: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Future Capabilities" ar="القدرات المستقبلية" /></h2>
          </div>
          <div className="capabilities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {capabilities.map(c => (
              <div key={c.label} className="cap-card card-premium">
                <span className="cap-icon" style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                <span className="cap-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Event Lifecycle Management" ar="إدارة دورة حياة الفعاليات" /></h2>
          </div>
          <div className="grid grid-3 gap-24">
            {[
              { titleEn: 'Event Setup', titleAr: 'إعداد الفعالية', icon: '📝', statusEn: 'Foundational', statusAr: 'تأسيسي' },
              { titleEn: 'Venue Readiness', titleAr: 'جاهزية المكان', icon: '🏢', statusEn: 'Architectural', statusAr: 'معماري' },
              { titleEn: 'Ticket Planning', titleAr: 'تخطيط التذاكر', icon: '🎫', statusEn: 'Prototyped', statusAr: 'نموذج أولي' }
            ].map(item => (
              <div key={item.titleEn} className="card-premium">
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{item.icon}</div>
                <h3><T en={item.titleEn} ar={item.titleAr} /></h3>
                <span className="badge" style={{ marginTop: 12, borderColor: '#ec4899', color: '#ec4899' }}>
                  <T en={item.statusEn} ar={item.statusAr} />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Operational Controls" ar="الضوابط التشغيلية" /></h2>
          </div>
          <div className="grid grid-3 gap-24">
            {[
              { titleEn: 'Attendee Ops', titleAr: 'عمليات الحضور', icon: '👥', statusEn: 'Future Track', statusAr: 'مسار مستقبلي' },
              { titleEn: 'QR & Check-in', titleAr: 'QR وتسجيل الدخول', icon: '📱', statusEn: 'Future Track', statusAr: 'مسار مستقبلي' },
              { titleEn: 'Sales Tracking', titleAr: 'تتبع المبيعات', icon: '📊', statusEn: 'Future Track', statusAr: 'مسار مستقبلي' }
            ].map(item => (
              <div key={item.titleEn} className="card-premium">
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{item.icon}</div>
                <h3><T en={item.titleEn} ar={item.titleAr} /></h3>
                <span className="badge" style={{ marginTop: 12 }}>
                  <T en={item.statusEn} ar={item.statusAr} />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Partner Mobile Operations" ar="عمليات الشركاء عبر المحمول" /></h2>
            <span className="badge badge-gold" style={{ marginLeft: 16 }}><T en="BETA ACCESS" ar="وصول تجريبي" /></span>
          </div>
          <div className="card-premium" style={{ background: 'linear-gradient(135deg, rgba(207,167,98,0.05), transparent)' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: 12 }}><T en="GearBeat Pro Scanner App" ar="تطبيق ماسح جيربيت برو" /></h3>
                <p style={{ color: 'var(--muted)', maxWidth: 600, lineHeight: 1.6 }}>
                  <T
                    en="We are developing native mobile tools for event partners. The upcoming GearBeat Pro app will allow staff to scan QR tickets instantly, view live capacity, and manage door operations in real-time."
                    ar="نحن نطور أدوات جوال أصلية لشركاء الفعاليات. سيتيح تطبيق جيربيت برو القادم للموظفين مسح تذاكر QR على الفور، وعرض السعة المباشرة، وإدارة عمليات الدخول في الوقت الفعلي."
                  />
                </p>
              </div>
              <div style={{ display: 'grid', gap: 8, minWidth: 200 }}>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>📸</span> <span style={{ fontSize: '0.85rem' }}><T en="Native Camera Scanner" ar="ماسح الكاميرا الأصلي" /></span>
                </div>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>📶</span> <span style={{ fontSize: '0.85rem' }}><T en="Offline Mode Support" ar="دعم وضع عدم الاتصال" /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-container" style={{ marginTop: 60, paddingBottom: 100 }}>
          <div className="section-header">
            <h2><T en="QA & Compliance Roadmap" ar="خارطة طريق الجودة والامتثال" /></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
            <div className="card-premium">
               {[
                 { label: 'Organizer Verification', status: '✅ READY' },
                 { label: 'Safety Standards', status: '✅ READY' },
                 { label: 'Event Licensing', status: '⏳ PENDING' },
                 { label: 'Insurance Validation', status: '⏳ PENDING' },
                 { label: 'Tax Compliance', status: '⏳ PENDING' },
                 { label: 'Payout Security', status: '⏳ PENDING' },
               ].map(item => (
                 <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', fontSize: '0.85rem' }}>
                   <span style={{ color: '#888' }}>{item.label}</span>
                   <span style={{ fontWeight: 700, color: item.status.includes('READY') ? '#10b981' : '#f59e0b' }}>{item.status}</span>
                 </div>
               ))}
            </div>
            <div className="card-premium" style={{ background: 'rgba(236, 72, 153, 0.02)', border: '1px dashed rgba(236, 72, 153, 0.2)' }}>
              <h3><T en="Sales Readiness" ar="جاهزية المبيعات" /></h3>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 12, lineHeight: 1.6 }}>
                <T
                  en="Before ticketing goes live, partners must complete the GearBeat Sales Readiness Audit to ensure secure transaction flows and attendee protection."
                  ar="قبل تفعيل حجز التذاكر، يجب على الشركاء إكمال تدقيق جاهزية المبيعات من GearBeat لضمان تدفق المعاملات الآمنة وحماية الحضور."
                />
              </p>
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>
                  <T
                    en="Note: No real event inventory, ticket sales, QR scanning, or payout logic is active in this foundation patch."
                    ar="ملاحظة: لا يوجد مخزون فعاليات حقيقي أو مبيعات تذاكر أو مسح QR أو منطق مدفوعات في هذا المسار التأسيسي."
                  />
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .partner-portal-foundation { background: #000; color: #fff; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .portal-hero { padding: 80px 0 60px; border-bottom: 1px solid #111; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .eyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .hero-title { font-size: 3rem; font-weight: 900; margin: 16px 0; }
        .hero-desc { font-size: 1.1rem; color: #888; max-width: 600px; line-height: 1.6; }
        .foundation-tag { display: inline-block; margin-top: 24px; padding: 6px 12px; border: 1px solid; border-radius: 99px; font-size: 0.7rem; font-weight: 700; }
        .card-premium { background: #0a0a0a; border: 1px solid #111; border-radius: 16px; padding: 24px; }
        .section-header h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .text-muted { color: #666; font-size: 0.9rem; }
        .text-gold { color: var(--gb-gold); }
        .cap-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; }
      `}} />
    </div>
  );
}
