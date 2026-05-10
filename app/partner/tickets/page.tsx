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

        <section className="section-container" style={{ marginTop: 60, paddingBottom: 100 }}>
          <div className="section-header">
            <h2><T en="Extranet Readiness" ar="جاهزية الإكسترانت" /></h2>
          </div>
          <div className="card-premium" style={{ maxWidth: 400 }}>
             {[
               { label: 'Event Profile', status: '✅ READY' },
               { label: 'Ticket Model', status: '✅ READY' },
               { label: 'Capacity Model', status: '⏳ PENDING' },
               { label: 'QR Check-in', status: '⏳ PENDING' },
               { label: 'Refund Rules', status: '⏳ PENDING' },
               { label: 'Payout Setup', status: '⏳ PENDING' },
             ].map(item => (
               <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111', fontSize: '0.85rem' }}>
                 <span style={{ color: '#888' }}>{item.label}</span>
                 <span style={{ fontWeight: 700, color: item.status.includes('READY') ? '#10b981' : '#f59e0b' }}>{item.status}</span>
               </div>
             ))}
          </div>
          <div style={{ marginTop: 32, padding: 20, background: 'rgba(0,0,0,0.3)', border: '1px dashed #222', borderRadius: 12, textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
              <T 
                en="Note: No live ticketing logic, payment logic, database writes, or SQL changes are active in this foundation patch." 
                ar="ملاحظة: لا يوجد منطق تذاكر حي أو منطق دفع أو كتابة في قاعدة البيانات أو تغييرات SQL في هذا المسار التأسيسي." 
              />
            </p>
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
