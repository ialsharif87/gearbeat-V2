import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Partner Network | GearBeat",
  description: "GearBeat partner onboarding information for the MVP.",
};

export default function PartnerPage() {
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px" }}>
    <section className="card-premium" style={{ padding: "clamp(32px,7vw,72px)", textAlign: "center" }}>
      <span className="badge badge-gold"><T en="MVP Partner Onboarding" ar="انضمام شركاء النسخة الأولية" /></span>
      <h1 style={{ margin: "20px 0 16px", fontSize: "clamp(2.2rem,6vw,4rem)" }}><T en="Studio partners first." ar="الأولوية لشركاء الاستوديوهات." /></h1>
      <p style={{ color: "var(--gb-text-muted)", lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}><T en="GearBeat is currently focused on reviewing studio applications and preparing studio profiles for the MVP. Vendor, service-provider, event, payout, certification, and advanced analytics programs are not live yet." ar="تركز GearBeat حاليًا على مراجعة طلبات الاستوديوهات وتجهيز ملفاتها للنسخة الأولية. برامج البائعين ومزودي الخدمات والفعاليات والمدفوعات والتوثيق والتحليلات المتقدمة غير مفعلة بعد." /></p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}><Link href="/join/studio" className="btn btn-primary"><T en="List Your Studio" ar="أضف استوديوك" /></Link><Link href="/gearbeat-certified" className="btn btn-outline"><T en="Certification Preview" ar="معاينة التوثيق" /></Link></div>
    </section>
  </main>;
}
