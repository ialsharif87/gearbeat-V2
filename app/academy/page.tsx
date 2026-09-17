import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "GearBeat Academy Preview",
  description: "Preview a future GearBeat learning experience for music and audio creators.",
};

const plannedTopics = [
  { en: "Music Production", ar: "الإنتاج الموسيقي" },
  { en: "Voice & Vocals", ar: "الصوت والغناء" },
  { en: "Audio Engineering", ar: "الهندسة الصوتية" },
  { en: "Podcast & Broadcast", ar: "البودكاست والبث" },
];

export default function AcademyLandingPage() {
  return (
    <main className="academy-preview">
      <section className="academy-hero">
        <div className="container academy-inner">
          <span className="badge badge-gold"><T en="Coming later" ar="قريباً في إصدار لاحق" /></span>
          <h1><T en="GearBeat Academy is still in development." ar="أكاديمية GearBeat ما زالت قيد التطوير." /></h1>
          <p>
            <T
              en="The current MVP does not offer live lessons, instructor verification, course bookings, or accredited qualifications."
              ar="النسخة الأولية الحالية لا تقدم دروساً مباشرة أو توثيقاً للمدربين أو حجوزات دورات أو مؤهلات معتمدة."
            />
          </p>
          <div className="academy-actions">
            <Link href="/studios" className="btn btn-primary">
              <T en="Find a Studio" ar="ابحث عن استوديو" />
            </Link>
            <Link href="/support" className="btn btn-outline">
              <T en="Contact GearBeat" ar="تواصل مع GearBeat" />
            </Link>
          </div>
        </div>
      </section>

      <section className="academy-section">
        <div className="container">
          <div className="academy-head">
            <span className="badge"><T en="Planned topics" ar="مجالات مخطط لها" /></span>
            <h2><T en="Learning categories under consideration." ar="مجالات تعليمية قيد التخطيط." /></h2>
            <p>
              <T
                en="These categories describe the direction of the future Academy and are not currently bookable products."
                ar="توضح هذه المجالات اتجاه الأكاديمية المستقبلية وليست منتجات متاحة للحجز حالياً."
              />
            </p>
          </div>
          <div className="academy-grid">
            {plannedTopics.map((topic) => (
              <article className="card-premium academy-card" key={topic.en}>
                <h3><T en={topic.en} ar={topic.ar} /></h3>
                <p><T en="Planned for a future release." ar="مخطط لإصدار مستقبلي." /></p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: `
        .academy-preview { min-height: 100vh; background: var(--gb-bg); }
        .academy-hero { padding: clamp(80px, 11vw, 150px) 0 90px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(212,175,55,.12), transparent 38%), #070a0e; border-bottom: 1px solid var(--gb-border); }
        .academy-inner { max-width: 820px; }
        .academy-hero h1 { margin: 20px 0 18px; font-size: clamp(2.4rem, 6vw, 4.5rem); line-height: 1.05; }
        .academy-hero p, .academy-head p, .academy-card p { color: var(--gb-text-muted); line-height: 1.8; }
        .academy-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
        .academy-section { padding: clamp(56px, 8vw, 90px) 0; }
        .academy-head { max-width: 760px; margin-bottom: 30px; }
        .academy-head h2 { margin: 14px 0 10px; font-size: clamp(1.8rem, 4vw, 3rem); }
        .academy-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .academy-card { padding: 24px; }
        .academy-card h3 { margin-bottom: 10px; }
        @media (max-width: 900px) { .academy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) { .academy-grid { grid-template-columns: 1fr; } .academy-actions { flex-direction: column; } .academy-actions .btn { width: 100%; } }
      `}} />
    </main>
  );
}
