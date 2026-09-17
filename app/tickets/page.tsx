import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Events Preview | GearBeat",
  description: "Preview GearBeat's planned events and ticketing experience.",
};

export default function TicketsLandingPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px" }}>
      <section className="card-premium" style={{ textAlign: "center", padding: "clamp(32px, 7vw, 72px)" }}>
        <span className="badge badge-gold"><T en="Coming Soon" ar="قريباً" /></span>
        <h1 style={{ margin: "22px 0 16px", fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
          <T en="Events & ticketing are not live yet." ar="الفعاليات والتذاكر غير مفعلة بعد." />
        </h1>
        <p style={{ color: "var(--gb-text-muted)", lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          <T en="GearBeat plans to add event discovery and ticketing in a later release. The current MVP does not sell tickets, verify organizers, or provide QR entry systems." ar="تخطط GearBeat لإضافة اكتشاف الفعاليات والتذاكر في إصدار لاحق. النسخة الأولية الحالية لا تبيع التذاكر ولا توثق المنظمين ولا توفر أنظمة دخول QR." />
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/studios" className="btn btn-primary"><T en="Find a Studio" ar="ابحث عن استوديو" /></Link>
          <Link href="/support" className="btn btn-outline"><T en="Contact Support" ar="تواصل مع الدعم" /></Link>
        </div>
      </section>
    </main>
  );
}
