import Link from "next/link";
import T from "@/components/t";

export default function LaunchPage() {
  return (
    <main className="launch-page">
      <section className="launch-hero">
        <div className="container launch-inner">
          <span className="badge badge-gold">
            <T en="GearBeat MVP Demo" ar="عرض GearBeat الأولي" />
          </span>
          <h1>
            <T en="A clearer way to discover studios." ar="طريقة أوضح لاكتشاف الاستوديوهات." />
          </h1>
          <p>
            <T
              en="GearBeat is preparing a premium Saudi and GCC marketplace for studios and sound services. The current MVP focuses on studio discovery and booking requests."
              ar="تجهز GearBeat سوقًا مميزًا للاستوديوهات والخدمات الصوتية في السعودية والخليج. تركز النسخة الأولية الحالية على اكتشاف الاستوديوهات وطلبات الحجز."
            />
          </p>
          <div className="launch-actions">
            <Link href="/studios" className="btn btn-primary">
              <T en="Find a Studio" ar="ابحث عن استوديو" />
            </Link>
            <Link href="/join/studio" className="btn btn-outline">
              <T en="List Your Studio" ar="أضف استوديوك" />
            </Link>
          </div>
        </div>
      </section>
      <section className="launch-status">
        <div className="container launch-grid">
          <article className="card-premium">
            <span className="badge badge-gold"><T en="Available in the MVP" ar="متاح في النسخة الأولية" /></span>
            <h2><T en="Studio discovery & booking requests" ar="اكتشاف الاستوديوهات وطلبات الحجز" /></h2>
            <p>
              <T
                en="Browse studio profiles, compare services and starting prices, then send a request for the studio to review."
                ar="تصفح ملفات الاستوديوهات وقارن الخدمات والأسعار المبدئية ثم أرسل طلبًا ليقوم الاستوديو بمراجعته."
              />
            </p>
          </article>

          <article className="card-premium">
            <span className="badge"><T en="Catalog preview" ar="معاينة الكتالوج" /></span>
            <h2><T en="Audio gear reference catalog" ar="كتالوج مرجعي لمعدات الصوت" /></h2>
            <p>
              <T
                en="Products can be browsed for reference and enquiries. Checkout, shipping, returns, and warranty handling are not enabled."
                ar="يمكن تصفح المنتجات للمرجعية والاستفسار. الدفع والشحن والإرجاع ومعالجة الضمان غير مفعلة."
              />
            </p>
          </article>
        </div>
      </section>
      <section className="launch-note">
        <div className="container card-premium">
          <h2><T en="What this demo does not claim" ar="ما لا تدعيه هذه النسخة" /></h2>
          <p>
            <T
              en="The MVP does not represent live card payments, escrow, guaranteed availability, shipping fulfilment, warranty handling, or AI-powered booking decisions."
              ar="النسخة الأولية لا تمثل مدفوعات بطاقات حية أو ضمانًا ماليًا أو توفرًا مضمونًا أو تنفيذ شحن أو معالجة ضمان أو قرارات حجز مدعومة بالذكاء الاصطناعي."
            />
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .launch-page { min-height: 100vh; background: var(--gb-bg); }
        .launch-hero { padding: clamp(80px, 11vw, 150px) 0 90px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(212,175,55,.14), transparent 38%), #070a0e; border-bottom: 1px solid var(--gb-border); }
        .launch-inner { max-width: 820px; }
        .launch-hero h1 { margin: 22px 0 18px; font-size: clamp(2.4rem, 6vw, 4.8rem); }
        .launch-hero p, .launch-status p, .launch-note p { color: var(--gb-text-muted); line-height: 1.8; }
        .launch-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px; }
        .launch-status, .launch-note { padding: 70px 0; }
        .launch-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .launch-grid h2, .launch-note h2 { margin: 16px 0 12px; }
        .launch-note { padding-top: 0; }
        @media (max-width: 760px) { .launch-grid { grid-template-columns: 1fr; } .launch-actions { flex-direction: column; } .launch-actions .btn { width: 100%; } }
      `}} />
    </main>
  );
}
