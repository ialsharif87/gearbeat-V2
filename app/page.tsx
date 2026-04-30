import Image from "next/image";
import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero card">
        <div className="home-hero-content">
          <div style={{ marginBottom: 30 }}>
            <div className="gb-logo gb-logo-lg">
              <div className="gb-logo-word-group">
                <span className="gb-logo-word">Gear<span>Beat</span></span>
                <span className="gb-logo-tagline">STUDIOS. SOUNDS. SESSIONS.</span>
              </div>
            </div>
          </div>

          <span className="badge">
            <T
              en="Premium Studio Booking Marketplace"
              ar="منصة فاخرة لحجز الاستوديوهات"
            />
          </span>

          <h1>
            <T
              en="Book the right studio for your next sound."
              ar="احجز الاستوديو المناسب لصوتك القادم."
            />
          </h1>

          <p>
            <T
              en="GearBeat connects artists, producers, podcasters, and creators with trusted music and audio studios across Saudi Arabia and the GCC."
              ar="GearBeat تربط الفنانين، المنتجين، صناع البودكاست، والمبدعين باستوديوهات موسيقية وصوتية موثوقة في السعودية والخليج."
            />
          </p>

          <div className="actions">
            <Link href="/studios" className="btn">
              <T en="Find your Studio" ar="ابحث عن استوديوك" />
            </Link>
            <Link href="/gear/products" className="btn btn-secondary">
              <T en="Shop Gear" ar="تسوق المعدات" />
            </Link>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="sound-orb">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* JOIN THE ECOSYSTEM SECTION */}
      <div className="section-padding" style={{ textAlign: 'center' }}>
        <div className="section-head">
          <span className="badge badge-gold"><T en="Partner Ecosystem" ar="منظومة الشركاء" /></span>
          <h2><T en="Choose your path" ar="اختر مسارك في GearBeat" /></h2>
          <p><T en="Whether you are creating, hosting, or selling - we have a place for you." ar="سواء كنت مبدعاً، مستضيفاً، أو بائعاً - مكانك محجوز معنا." /></p>
        </div>

        <div className="grid grid-3" style={{ marginTop: 50, gap: 30 }}>
          <Link href="/signup" className="card home-join-card">
            <div className="join-icon">🎵</div>
            <h3><T en="I am a Creator" ar="أنا مبدع" /></h3>
            <p><T en="Book studios and buy gear." ar="احجز الاستديوهات واشترِ المعدات." /></p>
          </Link>

          <Link href="/owner/onboarding" className="card home-join-card" style={{ border: '1px solid var(--gb-gold)' }}>
            <div className="join-icon">🎧</div>
            <h3><T en="Studio Owner" ar="صاحب استوديو" /></h3>
            <p><T en="List and manage your space." ar="اعرض وأدر مساحتك الخاصة." /></p>
          </Link>

          <Link href="/vendor/onboarding" className="card home-join-card">
            <div className="join-icon">📦</div>
            <h3><T en="Gear Vendor" ar="تاجر معدات" /></h3>
            <p><T en="Sell to a pro audience." ar="بع معداتك لجمهور محترف." /></p>
          </Link>
        </div>
      </div>

      <div style={{ height: 60 }} />

      <div className="card home-trust-card">
        <div>
          <span className="badge">
            <T en="Trust & Safety" ar="الثقة والأمان" />
          </span>

          <h2>
            <T
              en="Built for real sessions and clear accountability."
              ar="مبنية لجلسات حقيقية ومسؤولية واضحة."
            />
          </h2>

          <p>
            <T
              en="GearBeat is designed with customer profiles, studio approval flows, and internal audit logs to support a trusted marketplace."
              ar="GearBeat صُممت بملفات عملاء، موافقات استوديو، وسجل تغييرات داخلي لدعم ماركت بليس موثوق."
            />
          </p>
        </div>

        <div className="trust-points">
          <div><strong>01</strong><span><T en="Verified Studios" ar="استديوهات موثقة" /></span></div>
          <div><strong>02</strong><span><T en="Secure Payments" ar="دفع آمن" /></span></div>
          <div><strong>03</strong><span><T en="Real Reviews" ar="تقييمات حقيقية" /></span></div>
        </div>
      </div>
    </section>
  );
}
