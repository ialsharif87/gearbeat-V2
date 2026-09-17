import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Certification Preview | GearBeat",
  description: "Preview the planned GearBeat studio review framework for future partner verification.",
};

const reviewAreas = [
  {
    title: { en: "Business information", ar: "معلومات المنشأة" },
    body: {
      en: "A planned review of the studio profile and submitted business information.",
      ar: "مراجعة مخطط لها لملف الاستوديو ومعلومات المنشأة المقدمة.",
    },
  },
  {
    title: { en: "Studio details", ar: "تفاصيل الاستوديو" },
    body: {
      en: "A planned review of listed services, equipment, photos, and operating details.",
      ar: "مراجعة مخطط لها للخدمات والمعدات والصور وتفاصيل التشغيل المدرجة.",
    },
  },
  {
    title: { en: "Booking clarity", ar: "وضوح الحجز" },
    body: {
      en: "A planned check that booking notes, policies, and customer-facing details are clear.",
      ar: "تحقق مخطط له من وضوح ملاحظات الحجز والسياسات والتفاصيل المعروضة للعملاء.",
    },
  },
];

export default function GearBeatCertifiedPage() {
  return (
    <main className="cert-preview">
      <section className="cert-hero">
        <div className="container cert-hero-inner">
          <span className="badge badge-gold">
            <T en="Program preview" ar="معاينة البرنامج" />
          </span>
          <h1>
            <T en="A studio review framework in development." ar="إطار مراجعة للاستوديوهات قيد التطوير." />
          </h1>
          <p>
            <T
              en="GearBeat is designing a partner review program for a later release. The current MVP does not present certification as a guarantee of quality, availability, payment safety, or session outcomes."
              ar="تعمل GearBeat على تصميم برنامج مراجعة للشركاء لإصدار لاحق. النسخة الأولية الحالية لا تقدم التوثيق كضمان للجودة أو التوفر أو أمان الدفع أو نتائج الجلسة."
            />
          </p>
          <div className="cert-actions">
            <Link href="/join/studio" className="btn btn-primary">
              <T en="List Your Studio" ar="أضف استوديوك" />
            </Link>
            <Link href="/studios" className="btn btn-outline">
              <T en="Find a Studio" ar="ابحث عن استوديو" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cert-section">
        <div className="container">
          <div className="cert-section-head">
            <span className="badge">
              <T en="Planned review areas" ar="مجالات المراجعة المخطط لها" />
            </span>
            <h2><T en="Clear criteria, without fake trust signals." ar="معايير واضحة بدون إشارات ثقة مصطنعة." /></h2>
          </div>
          <div className="cert-grid">
            {reviewAreas.map((area) => (
              <article className="card-premium cert-card" key={area.title.en}>
                <h3><T en={area.title.en} ar={area.title.ar} /></h3>
                <p><T en={area.body.en} ar={area.body.ar} /></p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cert-section cert-status-section">
        <div className="container cert-status card-premium">
          <div>
            <span className="badge badge-gold"><T en="Current MVP status" ar="حالة النسخة الأولية" /></span>
            <h2><T en="Review program not yet active." ar="برنامج المراجعة غير مفعل بعد." /></h2>
          </div>
          <div className="cert-status-list">
            <p><T en="No public certification score is used as a booking guarantee." ar="لا يتم استخدام درجة توثيق عامة كضمان للحجز." /></p>
            <p><T en="No physical QR badge is promised in the MVP." ar="لا توجد شارة QR مادية موعودة في النسخة الأولية." /></p>
            <p><T en="No priority ranking is promised because of certification status." ar="لا توجد أولوية ترتيب موعودة بسبب حالة التوثيق." /></p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .cert-preview { min-height: 100vh; background: var(--gb-bg); }
        .cert-hero { padding: clamp(80px, 11vw, 150px) 0 90px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(212,175,55,.14), transparent 38%), #070a0e; border-bottom: 1px solid var(--gb-border); }
        .cert-hero-inner { max-width: 860px; }
        .cert-hero h1 { margin: 20px auto 18px; font-size: clamp(2.4rem, 6vw, 4.6rem); line-height: 1.05; }
        .cert-hero p { margin: 0 auto; max-width: 760px; color: var(--gb-text-muted); line-height: 1.8; }
        .cert-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
        .cert-section { padding: clamp(56px, 8vw, 90px) 0; }
        .cert-section-head { max-width: 760px; margin-bottom: 30px; }
        .cert-section-head h2, .cert-status h2 { margin: 14px 0 0; font-size: clamp(1.8rem, 4vw, 3rem); }
        .cert-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .cert-card { padding: 26px; }
        .cert-card h3 { margin-bottom: 10px; }
        .cert-card p, .cert-status-list p { color: var(--gb-text-muted); line-height: 1.7; }
        .cert-status-section { padding-top: 0; }
        .cert-status { display: grid; grid-template-columns: .9fr 1.1fr; gap: 36px; align-items: start; padding: clamp(24px, 4vw, 40px); border-color: rgba(212,175,55,.25); }
        .cert-status-list { display: grid; gap: 12px; }
        .cert-status-list p { margin: 0; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06); }
        @media (max-width: 760px) {
          .cert-grid, .cert-status { grid-template-columns: 1fr; }
          .cert-actions { flex-direction: column; }
          .cert-actions .btn { width: 100%; }
        }
      `}} />
    </main>
  );
}
