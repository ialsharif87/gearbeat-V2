import T from "@/components/t";
import Link from "next/link";

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
            <span className="eyebrow"><T en="THE GLOBAL MUSIC ECOSYSTEM" ar="النظام الموسيقي العالمي" /></span>
            <h1 className="hero-title">
              <T en="GearBeat Partner Portal" ar="بوابة شركاء GearBeat" />
            </h1>
            <p className="hero-desc">
              <T 
                en="Empowering studio owners, vendors, and service providers with professional extranet tools to manage their music business globally." 
                ar="تمكين أصحاب الاستوديوهات والبائعين ومزودي الخدمات بأدوات إكسترانت احترافية لإدارة أعمالهم الموسيقية عالمياً." 
              />
            </p>
            <div className="foundation-tag">
              <T en="Official Extranet Foundation — Prototype V1" ar="تأسيس الإكسترانت الرسمي — النموذج الأولي V1" />
            </div>
            <div style={{ marginTop: 12, opacity: 0.4, fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1 }}>
              <T en="PHASE 54 ARCHITECTURAL FOUNDATION: COMPLETE" ar="اكتمال التأسيس المعماري للمرحلة 54" />
            </div>
          </div>
        </div>
      </header>

      <main className="container main-layout">
        {/* ARCHITECTURE SECTION */}
        <section className="section-container">
          <div className="section-header">
            <h2><T en="Platform Architecture" ar="بنية المنصة" /></h2>
          </div>
          <div className="architecture-grid">
            <div className="arch-card card-premium">
              <div className="badge-type internal"><T en="INTERNAL" ar="داخلي" /></div>
              <h3><T en="Admin Operations CRM" ar="إدارة العمليات CRM" /></h3>
              <p className="text-muted"><T en="Used by GearBeat admins to manage leads, approvals, and internal relationships." ar="يستخدمه مسؤولو GearBeat لإدارة العملاء والموافقات والعلاقات الداخلية." /></p>
              <Link href="/admin/operations-crm" className="text-gold"><T en="View Internal Hub" ar="عرض المركز الداخلي" /> →</Link>
            </div>
            <div className="arch-card card-premium active-border">
              <div className="badge-type external"><T en="EXTERNAL" ar="خارجي" /></div>
              <h3><T en="Partner Portal (Extranet)" ar="بوابة الشركاء (إكسترانت)" /></h3>
              <p className="text-muted"><T en="Used by partners to manage their own business profiles, data, and bookings." ar="يستخدمه الشركاء لإدارة ملفاتهم الشخصية وبياناتهم وحجوزاتهم الخاصة." /></p>
              <span className="text-gold font-bold"><T en="YOU ARE HERE" ar="أنت هنا" /></span>
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
                <h3 style={{ fontSize: "1.3rem", marginBottom: 8 }}><T en="GearBeat Pro" ar="جيربيت برو" /> <span className="badge badge-warning" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginLeft: 8 }}>PLANNING PHASE</span></h3>
                <p style={{ color: 'var(--muted)', maxWidth: 650, lineHeight: 1.6 }}>
                  <T 
                    en="We are architecting a dedicated React Native companion app for Partners. Manage studio calendar blocks, accept bookings, fulfill marketplace orders, and chat with customers on the go." 
                    ar="نحن نقوم بتصميم تطبيق مرافق مخصص لـ React Native للشركاء. يمكنك إدارة حظر تقويم الاستوديو، وقبول الحجوزات، وتنفيذ طلبات السوق، والدردشة مع العملاء أثناء التنقل." 
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

        {/* PORTAL ALIGNMENT */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Current Portal Alignment" ar="محاذاة البوابة الحالية" /></h2>
            <p className="text-muted"><T en="Existing operational portals and their alignment with the future unified Partner Portal." ar="البوابات التشغيلية الحالية ومحاذاتها مع بوابة الشركاء الموحدة المستقبلية." /></p>
          </div>
          <div className="architecture-grid">
            <div className="arch-card card-premium">
              <h3><T en="Studio Portal" ar="بوابة الاستوديو" /></h3>
              <p className="text-muted"><T en="Active route for studio owner operations, sessions, and availability." ar="المسار النشط لعمليات مالك الاستوديو والجلسات والتوافر." /></p>
              <code className="text-gold">/portal/studio</code>
            </div>
            <div className="arch-card card-premium">
              <h3><T en="Vendor Portal" ar="بوابة البائع" /></h3>
              <p className="text-muted"><T en="Active route for marketplace vendors, products, and order fulfillment." ar="المسار النشط لبائعي المتجر والمنتجات وتنفيذ الطلبات." /></p>
              <code className="text-gold">/portal/store</code>
            </div>
          </div>
        </section>

        {/* FUTURE PARTNER TRACKS */}
        <section className="section-container" style={{ marginTop: 60 }}>
          <div className="section-header">
            <h2><T en="Future Partner Tracks" ar="مسارات الشركاء المستقبلية" /></h2>
            <p className="text-muted"><T en="Specialized extranet layers for non-studio and non-vendor partners." ar="طبقات إكسترانت متخصصة للشركاء من غير أصحاب الاستوديوهات والبائعين." /></p>
          </div>
          <div className="architecture-grid">
            <Link href="/partner/services" className="arch-card card-premium">
              <div className="badge-type external" style={{ background: '#a855f7' }}><T en="SERVICES" ar="خدمات" /></div>
              <h3><T en="Service Provider Portal" ar="بوابة مزود الخدمة" /></h3>
              <p className="text-muted"><T en="Foundation for Producers, Engineers, and specialized music professionals." ar="تأسيس للمنتجين والمهندسين والمحترفين الموسيقيين المتخصصين." /></p>
              <span className="text-gold"><T en="Explore Track" ar="استكشاف المسار" /> →</span>
            </Link>
            <Link href="/partner/tickets" className="arch-card card-premium">
              <div className="badge-type external" style={{ background: '#ec4899' }}><T en="TICKETING" ar="تذاكر" /></div>
              <h3><T en="Ticketing Partner Portal" ar="بوابة شريك التذاكر" /></h3>
              <p className="text-muted"><T en="Foundation for Event Organizers, Venues, and Workshop hosts." ar="تأسيس لمنظمي الفعاليات والمرافق ومستضيفي ورش العمل." /></p>
              <span className="text-gold"><T en="Explore Track" ar="استكشاف المسار" /> →</span>
            </Link>
          </div>
        </section>

        {/* ROUTE MAP */}
        <section className="section-container" style={{ marginTop: 60, paddingBottom: 100 }}>
          <div className="section-header">
            <h2><T en="Future Route Map" ar="خريطة المسارات المستقبلية" /></h2>
          </div>
          <div className="route-map card-premium">
            <div className="route-list">
              {['/partner/dashboard', '/partner/profile', '/partner/documents', '/partner/contracts', '/partner/support', '/partner/notifications'].map(r => (
                <div key={r} className="route-item">
                  <span className="route-path">{r}</span>
                  <span className="route-status"><T en="Foundation Only" ar="تأسيس فقط" /></span>
                </div>
              ))}
            </div>
            <div className="disclaimer-note">
              <p className="text-muted">
                <T 
                  en="Note: Existing /portal/studio and /portal/store routes remain the current operational workflows. The /partner extranet will eventually unify these experiences." 
                  ar="ملاحظة: تظل مسارات /portal/studio و /portal/store هي تدفقات العمل التشغيلية الحالية. ستقوم بوابة /partner بتوحيد هذه التجارب في النهاية."
                />
              </p>
            </div>
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
      `}} />
    </div>
  );
}
