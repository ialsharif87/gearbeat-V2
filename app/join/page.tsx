import T from "../../components/t";
import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="section-padding" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="section-head" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <span className="badge badge-gold">
          <T en="Join the Ecosystem" ar="انضم لمنظومتنا" />
        </span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: 20 }}>
          <T en="How do you want to use" ar="كيف ترغب في استخدام" /> <span className="neon-text">GearBeat</span>?
        </h1>
        <p style={{ fontSize: '1.2rem' }}>
          <T 
            en="Choose your path and start your journey in the most premium music marketplace in the GCC." 
            ar="اختر مسارك وابدأ رحلتك في أرقى سوق للموسيقى في الخليج العربي." 
          />
        </p>
      </div>

      <div className="grid grid-3" style={{ maxWidth: 1200, margin: '60px auto 0', gap: 30 }}>
        {/* CUSTOMER */}
        <Link href="/signup?role=customer" className="card join-card" style={{ textAlign: 'center', padding: 50, textDecoration: 'none' }}>
           <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎵</div>
           <h3><T en="I am a Creator" ar="أنا مبدع / فنان" /></h3>
           <p><T en="Book studios and buy professional audio gear." ar="احجز الاستديوهات واشترِ أحدث المعدات الصوتية." /></p>
           <div className="btn btn-secondary w-full" style={{ marginTop: 30 }}>
              <T en="Get Started" ar="ابدأ الآن" />
           </div>
        </Link>

        {/* OWNER */}
        <Link href="/owner/onboarding" className="card join-card" style={{ textAlign: 'center', padding: 50, textDecoration: 'none', border: '1px solid var(--gb-gold)', background: 'rgba(199,164,93,0.03)' }}>
           <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎧</div>
           <h3><T en="I own a Studio" ar="أملك استديو" /></h3>
           <p><T en="List your studio and manage your bookings effortlessly." ar="اعرض الاستديو الخاص بك وأدر حجوزاتك بكل سهولة." /></p>
           <div className="btn btn-primary w-full" style={{ marginTop: 30 }}>
              <T en="Become a Partner" ar="كن شريكاً" />
           </div>
        </Link>

        {/* VENDOR */}
        <Link href="/vendor/onboarding" className="card join-card" style={{ textAlign: 'center', padding: 50, textDecoration: 'none' }}>
           <div style={{ fontSize: '4rem', marginBottom: 20 }}>📦</div>
           <h3><T en="I am a Vendor" ar="أنا مورد / تاجر" /></h3>
           <p><T en="Sell your music equipment to a curated audience." ar="بع معداتك الموسيقية لجمهور مختار ومهتم." /></p>
           <div className="btn btn-secondary w-full" style={{ marginTop: 30 }}>
              <T en="Become a Vendor" ar="كن تاجراً" />
           </div>
        </Link>
      </div>
    </div>
  );
}
