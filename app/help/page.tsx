import Link from "next/link";
import T from "@/components/t";

export default function HelpPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 980, margin: "0 auto", padding: 32 }}>
      <div className="page-header">
        <span className="badge">
          <T en="Help Center" ar="مركز المساعدة" />
        </span>
        <h1>
          <T en="How can we help?" ar="كيف نقدر نساعدك؟" />
        </h1>
        <p>
          <T
            en="This page will include support articles, contact options, and frequently asked questions."
            ar="ستحتوي هذه الصفحة على مقالات الدعم، وطرق التواصل، والأسئلة الشائعة."
          />
        </p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Support is coming soon" ar="الدعم قادم قريبًا" />
        </h2>
        <p>
          <T
            en="For now, please return to the homepage or dashboard."
            ar="حاليًا، يمكنك الرجوع إلى الصفحة الرئيسية أو لوحة التحكم."
          />
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            <T en="Go Home" ar="الصفحة الرئيسية" />
          </Link>
          <Link href="/vendor" className="btn">
            <T en="Vendor Dashboard" ar="لوحة التاجر" />
          </Link>
        </div>
      </div>
    </main>
  );
}
