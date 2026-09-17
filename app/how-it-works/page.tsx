import Link from "next/link";
import T from "@/components/t";

const steps = [
  { n: "01", en: "Find a studio", ar: "ابحث عن استوديو", den: "Compare location, services, equipment, and starting price.", dar: "قارن الموقع والخدمات والمعدات والسعر المبدئي." },
  { n: "02", en: "Review the profile", ar: "راجع ملف الاستوديو", den: "Check photos, policies, and the booking information provided by the studio.", dar: "راجع الصور والسياسات ومعلومات الحجز التي يقدمها الاستوديو." },
  { n: "03", en: "Send a booking request", ar: "أرسل طلب حجز", den: "Choose your preferred date and time. The studio reviews the request before confirmation; no payment is collected when the request is sent.", dar: "اختر التاريخ والوقت المفضلين. يراجع الاستوديو الطلب قبل التأكيد، ولا يتم تحصيل دفعة عند إرسال الطلب." },
];

export default function HowItWorksPage() {
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px" }}>
    <section style={{ textAlign: "center", marginBottom: 44 }}><span className="badge badge-gold"><T en="How it works" ar="كيف يعمل" /></span><h1 style={{ fontSize: "clamp(2.2rem,6vw,4rem)", margin: "18px 0" }}><T en="From studio discovery to booking request." ar="من اكتشاف الاستوديو إلى طلب الحجز." /></h1><p style={{ color: "var(--muted)", maxWidth: 700, margin: "0 auto", lineHeight: 1.8 }}><T en="The MVP focuses on a clear studio-booking request journey. Services, ticketing, and marketplace checkout are planned for later releases." ar="تركز النسخة الأولية على رحلة واضحة لطلب حجز الاستوديو. الخدمات والتذاكر والدفع في المتجر مخطط لها لإصدارات لاحقة." /></p></section>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>{steps.map(s => <article className="card" key={s.n} style={{ padding: 28 }}><strong style={{ color: "var(--gb-gold)" }}>{s.n}</strong><h2 style={{ margin: "16px 0 10px" }}><T en={s.en} ar={s.ar} /></h2><p style={{ color: "var(--muted)", lineHeight: 1.7 }}><T en={s.den} ar={s.dar} /></p></article>)}</section>
    <section style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 36 }}><Link href="/studios" className="btn btn-primary"><T en="Find a Studio" ar="ابحث عن استوديو" /></Link><Link href="/join/studio" className="btn btn-outline"><T en="List Your Studio" ar="أضف استوديوك" /></Link></section>
  </main>;
}
