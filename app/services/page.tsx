import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Sound Services Preview | GearBeat",
  description: "Preview GearBeat's planned sound-services marketplace.",
};

export default function ServicesPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px" }}>
      <section className="card-premium" style={{ textAlign: "center", padding: "clamp(32px, 7vw, 72px)" }}>
        <span className="badge badge-gold"><T en="Coming Soon" ar="قريباً" /></span>
        <h1 style={{ margin: "22px 0 16px", fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
          <T en="Sound-services booking is not live yet." ar="حجز الخدمات الصوتية غير مفعّل بعد." />
        </h1>
        <p style={{ color: "var(--gb-text-muted)", lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          <T en="GearBeat plans to add a sound-services directory in a later release. The current MVP does not present providers as certified, verified, or immediately bookable." ar="تخطط GearBeat لإضافة دليل للخدمات الصوتية في إصدار لاحق. النسخة الأولية الحالية لا تعرض مزودي الخدمات كجهات معتمدة أو موثقة أو متاحة للحجز الفوري." />
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/studios" className="btn btn-primary"><T en="Find a Studio" ar="ابحث عن استوديو" /></Link>
          <Link href="/support" className="btn btn-outline"><T en="Contact Support" ar="تواصل مع الدعم" /></Link>
        </div>
      </section>
    </main>
  );
}
