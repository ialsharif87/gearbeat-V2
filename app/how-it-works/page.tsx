import Link from "next/link";
import T from "@/components/t";

export default function HowItWorksPage() {
  return (
    <main className="how-it-works-page" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: 60 }}>
        <span className="badge badge-gold">
          <T en="Guide" ar="دليل الاستخدام" />
        </span>
        <h1 style={{ fontSize: "3rem", marginTop: 16 }}>
          <T en="How GearBeat Works" ar="كيف يعمل GearBeat" />
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.2rem", maxWidth: 700, margin: "20px auto" }}>
          <T 
            en="Book studios, hire services, and buy gear — all in one place." 
            ar="احجز استوديوهات، اطلب خدمات، واشتر معدات — كل شيء في مكان واحد." 
          />
        </p>
      </section>

      {/* For Customers */}
      <section style={{ marginBottom: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gb-gold)", color: "var(--gb-dark)", display: "flex", alignItems: "center", justifyCenter: "center", fontWeight: "bold", fontSize: "1.2rem", justifyContent: "center" }}>1</div>
          <h2 style={{ fontSize: "2rem", margin: 0 }}>
            <T en="For Customers" ar="للعملاء" />
          </h2>
        </div>

        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>01</span>
            <h3><T en="Search & Compare" ar="ابحث وقارن" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Browse verified studios, creative services, and professional gear." ar="تصفح الاستوديوهات والخدمات والمعدات الموثقة." />
            </p>
          </div>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>02</span>
            <h3><T en="Book or Buy" ar="احجز أو اشتر" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Reserve your studio session, hire a service, or order equipment." ar="احجز جلسة، اطلب خدمة، أو اشتر معدات." />
            </p>
          </div>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>03</span>
            <h3><T en="Create" ar="ابدع" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Show up and create. We handle the rest." ar="احضر وابدع. نحن نتولى الباقي." />
            </p>
          </div>
        </div>
      </section>

      {/* For Studios & Sellers */}
      <section style={{ marginBottom: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gb-blue, #209cff)", color: "white", display: "flex", alignItems: "center", justifyCenter: "center", fontWeight: "bold", fontSize: "1.2rem", justifyContent: "center" }}>2</div>
          <h2 style={{ fontSize: "2rem", margin: 0 }}>
            <T en="For Studios & Sellers" ar="للاستوديوهات والتجار" />
          </h2>
        </div>

        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>01</span>
            <h3><T en="Apply to Join" ar="قدّم طلبك" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Fill out our quick interest form and we'll be in touch." ar="اكمل نموذج الاهتمام وسنتواصل معك." />
            </p>
          </div>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>02</span>
            <h3><T en="Set Up Your Profile" ar="أعد ملفك الشخصي" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Complete your profile, upload documents, and go live." ar="أكمل ملفك وارفع المستندات وابدأ." />
            </p>
          </div>
          <div className="card step-card" style={{ padding: 32, position: "relative" }}>
            <span style={{ position: "absolute", top: 20, right: 20, fontSize: "2rem", opacity: 0.1, fontWeight: "bold" }}>03</span>
            <h3><T en="Grow Your Business" ar="طوّر أعمالك" /></h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T en="Receive bookings, manage orders, and track your earnings." ar="استقبل حجوزات وطلبات وتابع أرباحك." />
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="card" style={{ textAlign: "center", padding: "60px 20px", background: "rgba(207, 167, 98, 0.05)", border: "1px solid rgba(207, 167, 98, 0.15)" }}>
        <h2 style={{ fontSize: "2.2rem" }}>
          <T en="Start your journey with GearBeat" ar="ابدأ رحلتك مع GearBeat" />
        </h2>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <Link href="/studios" className="btn btn-primary btn-large">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>
          <Link href="/join/studio" className="btn btn-secondary btn-large">
            <T en="List Your Studio" ar="سجّل استوديوك" />
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .step-card {
          transition: transform 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-5px);
          border-color: var(--gb-gold);
        }
      `}} />
    </main>
  );
}
