import { Metadata } from "next";
import T from "@/components/t";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Network & Studio Onboarding",
  description: "Join the elite network of GearBeat partners. Monetize your music studio, sell professional audio gear, and reach a global audience of creators.",
};

export default function PartnerPortalFoundationPage() {
  const partnerTypes = [
    { type: 'Studio Owner', ar: 'مالك استوديو', icon: '🎙️', desc: 'Manage sessions, availability, and certified trust status.' },
    { type: 'Vendor', ar: 'بائع', icon: '📦', desc: 'Manage marketplace products, inventory, and storefront performance.' },
    { type: 'Service Provider', ar: 'مزود خدمة', icon: '🛠️', desc: 'Offer engineering, mixing, and specialized music services.' },
    { type: 'Event Partner', ar: 'شريك فعاليات', icon: '🎫', desc: 'Manage ticketing, entrance, and event-based bookings.' },
  ];

  const capabilities = [
    { label: 'Profile', icon: '👤', status: 'Core' },
    { label: 'Documents', icon: '📄', status: 'Core' },
    { label: 'Contracts', icon: '✒️', status: 'Legal' },
    { label: 'Bookings/Orders', icon: '📊', status: 'Ops' },
    { label: 'Trust Badges', icon: '🛡️', status: 'Certified' },
    { label: 'Rewards/Kits', icon: '🎁', status: 'Loyalty' },
    { label: 'Payouts', icon: '💰', status: 'Finance' },
    { label: 'Support', icon: '🎧', status: 'Help' },
  ];

  return (
    <div className="partner-portal-foundation">
      <header className="portal-hero">
        <div className="container">
          <div className="hero-content">
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              <div className="badge-gold"><T en="PRE-PILOT: INVESTOR & PARTNER READINESS" ar="ما قبل المرحلة التجريبية: جاهزية المستثمرين والشركاء" /></div>
              <div className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
                MANUAL_ONBOARDING
              </div>
            </div>
            <h1 className="hero-title text-balance">
              <T en="Elevate Your Music Business." ar="ارتقِ بعملك الموسيقي." />
            </h1>
            <p className="hero-desc text-balance mb-40">
              <T
                en="Join the elite network of music studios, equipment vendors, and service providers. Currently reviewing applications for our first cohort of certified partners."
                ar="انضم إلى شبكة النخبة من استوديوهات الموسيقى، تجار المعدات، ومزودي الخدمات. نقوم حالياً بمراجعة طلبات أول مجموعة من الشركاء المعتمدين."
              />
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Link href="/join/studio" className="btn btn-primary btn-lg shadow-gold">
                 <T en="Become a Partner" ar="انضم كشريك" />
              </Link>
              <Link href="/join/seller" className="btn btn-outline btn-lg">
                 <T en="Become a Partner" ar="انضم كشريك" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container main-layout">
        {/* VALUE PROPOSITION */}
        <section className="section-container">
          <div className="section-header text-center">
            <span className="badge-gold"><T en="The Advantage" ar="المميزات" /></span>
            <h2 className="mt-16"><T en="Why Partner with GearBeat?" ar="لماذا تنضم كشريك لـ GearBeat؟" /></h2>
          </div>
          <div className="architecture-grid">
            <div className="arch-card card-premium">
              <div className="badge-type external"><T en="GLOBAL TRUST" ar="ثقة عالمية" /></div>
              <h3><T en="Verified Authority" ar="سلطة موثقة" /></h3>
              <p className="text-muted"><T en="Leverage the GearBeat Certified badge to signal premium quality and build instant trust with international creators." ar="استفد من شارة 'موثق من جيربيت' للإشارة إلى الجودة العالية وبناء ثقة فورية مع المبدعين العالميين." /></p>
              <Link href="/gearbeat-certified" className="text-gold"><T en="Learn About Certification" ar="تعرف على التوثيق" /> →</Link>
            </div>
            <div className="arch-card card-premium">
              <div className="badge-type external"><T en="OPERATIONS" ar="العمليات" /></div>
              <h3><T en="Professional Tools" ar="أدوات احترافية" /></h3>
              <p className="text-muted"><T en="Access unified extranet tools for bookings, inventory, and analytics. Simplified business management for creative professionals." ar="احصل على أدوات إكسترانت موحدة للحجوزات، المخزون، والتحليلات. إدارة أعمال مبسطة للمحترفين المبدعين." /></p>
              <span className="text-gold font-bold"><T en="READY FOR LAUNCH" ar="جاهز للإطلاق" /></span>
              <div style={{ marginTop: 8, fontSize: '0.65rem', color: 'var(--gb-gold)', fontWeight: 800 }}>REQUIRES_ADMIN_VERIFICATION</div>
            </div>
          </div>
        </section>

        {/* PARTNER TYPES */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Partner Ecosystem" ar="نظام الشركاء البيئي" /></h2>
          </div>
          <div className="partner-types-grid">
            {partnerTypes.map(p => (
              <div key={p.type} className="partner-type-card card-premium">
                <div className="icon-wrap">{p.icon}</div>
                <div className="type-info">
                  <h4><T en={p.type} ar={p.ar} /></h4>
                  <p className="text-muted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATUS MODEL */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Account Status Model" ar="نموذج حالة الحساب" /></h2>
          </div>
          <div className="status-timeline">
            {['pending', 'approved', 'suspended', 'rejected'].map((s, i) => (
              <div key={s} className="status-step">
                <div className={`status-dot ${s}`}></div>
                <span className="status-label">{s}</span>
                {i < 3 && <div className="status-connector"></div>}
              </div>
            ))}
          </div>
        </section>

        {/* CAPABILITIES PREVIEW */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Partner Capabilities" ar="قدرات الشريك" /></h2>
            <p className="text-muted"><T en="A preview of the unified extranet tools coming to the Partner Portal." ar="معاينة لأدوات الإكسترانت الموحدة القادمة لبوابة الشركاء." /></p>
          </div>
          <div className="capabilities-grid">
            {capabilities.map(c => (
              <div key={c.label} className="cap-card card-premium">
                <span className="cap-icon">{c.icon}</span>
                <span className="cap-label">{c.label}</span>
                <span className="cap-badge">{c.status}</span>
                {c.status === 'Finance' && <span style={{ fontSize: '0.6rem', color: '#ffb020', fontWeight: 800 }}>DEFERRED_PAYMENTS</span>}
                {c.status === 'Ops' && <span style={{ fontSize: '0.6rem', color: 'var(--gb-gold)', fontWeight: 800 }}>MANUAL_REVIEW</span>}
              </div>
            ))}
          </div>
        </section>

        {/* MOBILE EXTRANET READINESS */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Mobile Extranet App" ar="تطبيق الإكسترانت للمحمول" /></h2>
            <p className="text-muted"><T en="Foundation for the upcoming native GearBeat Pro application." ar="أساس لتطبيق جيربيت برو الأصلي القادم." /></p>
          </div>
          <div className="card-premium" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(212,175,55,0.03))', border: '1px dashed rgba(212,175,55,0.3)' }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: "3rem" }}>📱</div>
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: 8 }}><T en="GearBeat Partner App" ar="تطبيق شركاء جيربيت" /> <span className="badge badge-gold" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginLeft: 8 }}>COMING SOON</span></h3>
                <p style={{ color: 'var(--muted)', maxWidth: 650, lineHeight: 1.6 }}>
                  <T
                    en="We are architecting a dedicated mobile companion app for Partners. Manage studio calendars, accept bookings, and communicate with customers from anywhere."
                    ar="نحن نقوم بتصميم تطبيق جوال مخصص للشركاء. يمكنك إدارة تقويم الاستوديو، وقبول الحجوزات، والتواصل مع العملاء من أي مكان."
                  />
                </p>
              </div>
            </div>

            <div className="grid grid-2 gap-24" style={{ marginTop: 24 }}>
              <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span>🔔</span> <T en="Push Notifications" ar="إشعارات الدفع" />
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <T
                    en="Future native push notification infrastructure for instant booking requests, new marketplace orders, and customer messages."
                    ar="البنية التحتية المستقبلية لإشعارات الدفع الأصلية لطلبات الحجز الفورية، وطلبات السوق الجديدة، ورسائل العملاء."
                  />
                </p>
              </div>

              <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span>🔗</span> <T en="External Integrations" ar="تكاملات خارجية" />
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <T
                    en="API webhook foundation allowing Pro vendors to sync inventory with third-party logistics and CRM tools."
                    ar="أساس واجهة برمجة التطبيقات (API webhook) الذي يسمح للبائعين المحترفين بمزامنة المخزون مع أدوات اللوجستيات وإدارة علاقات العملاء الخارجية."
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-container text-center" style={{ marginTop: 100, paddingBottom: 120 }}>
          <div className="badge-gold mb-24 ms-auto me-auto"><T en="Take the Leap" ar="خذ الخطوة" /></div>
          <h2 className="mb-40 text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginInline: 'auto' }}><T en="Join the Pilot Network." ar="انضم إلى الشبكة التجريبية." /></h2>
          <div className="hero-actions" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/join/studio" className="btn btn-primary btn-lg shadow-gold">
               <T en="Become a Partner" ar="انضم كشريك" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
               <T en="Partner Support" ar="دعم الشركاء" />
            </Link>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .partner-portal-foundation { background: #000; color: #fff; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .portal-hero { padding: 120px 0 80px; background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.05), transparent); border-bottom: 1px solid #111; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .eyebrow { color: var(--gb-gold); font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .hero-title { font-size: 3.5rem; font-weight: 900; margin: 16px 0; letter-spacing: -1px; }
        .hero-desc { font-size: 1.25rem; color: #888; max-width: 700px; line-height: 1.6; }
        .foundation-tag { display: inline-block; margin-top: 32px; padding: 8px 16px; background: rgba(212, 175, 55, 0.1); border: 1px solid var(--gb-gold); color: var(--gb-gold); border-radius: 99px; font-size: 0.75rem; font-weight: 700; }

        .section-header { margin-bottom: 32px; }
        .section-header h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 8px; }

        .architecture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .arch-card { padding: 32px; position: relative; }
        .active-border { border: 1px solid var(--gb-gold) !important; }
        .badge-type { position: absolute; top: 24px; right: 24px; font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 4px; }
        .badge-type.internal { background: #222; color: #888; }
        .badge-type.external { background: var(--gb-gold); color: #000; }

        .partner-types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .partner-type-card { padding: 24px; display: flex; gap: 20px; align-items: center; }
        .icon-wrap { font-size: 2rem; background: #111; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .type-info h4 { font-size: 1.1rem; margin-bottom: 4px; color: #fff; }
        .type-info p { font-size: 0.8rem; margin: 0; }

        .status-timeline { display: flex; align-items: center; justify-content: space-between; padding: 40px; background: #0a0a0a; border-radius: 20px; border: 1px solid #111; }
        .status-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
        .status-dot { width: 16px; height: 16px; border-radius: 50%; background: #222; margin-bottom: 12px; z-index: 2; }
        .status-dot.pending { background: #f59e0b; }
        .status-dot.approved { background: #10b981; }
        .status-dot.suspended { background: #6366f1; }
        .status-dot.rejected { background: #ef4444; }
        .status-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #555; }
        .status-connector { position: absolute; top: 7px; left: 50%; width: 100%; height: 2px; background: #111; z-index: 1; }

        .capabilities-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cap-card { padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .cap-icon { font-size: 1.5rem; }
        .cap-label { font-size: 0.85rem; font-weight: 700; color: #fff; }
        .cap-badge { font-size: 0.6rem; color: #555; text-transform: uppercase; font-weight: 900; }

        .route-map { padding: 40px; }
        .route-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .route-item { display: flex; justify-content: space-between; padding: 12px 20px; background: #0a0a0a; border: 1px solid #111; border-radius: 8px; }
        .route-path { font-family: monospace; font-size: 0.85rem; color: var(--gb-gold); }
        .route-status { font-size: 0.7rem; color: #444; font-weight: 700; }
        .disclaimer-note { padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; text-align: center; border: 1px dashed #222; }

        .font-bold { font-weight: 900; }
        [dir="rtl"] .hero-title { letter-spacing: 0; }
        [dir="rtl"] .status-connector { right: 50%; left: auto; }

        @media (max-width: 400px) {
          .hero-title { font-size: 2.2rem !important; }
          .hero-desc { font-size: 1rem !important; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions .btn { width: 100%; text-align: center; }
          .container { padding: 0 16px; }
        }
      `}} />
    </div>
  );
}
