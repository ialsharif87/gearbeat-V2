import Link from "next/link";
import T from "@/components/t";

export default function MarketplaceCheckoutPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 760, margin: "0 auto" }}>
      <section className="card" style={{ marginTop: 48, padding: "clamp(28px, 6vw, 52px)", textAlign: "center" }}>
        <span className="badge badge-gold">
          <T en="Checkout unavailable" ar="الدفع غير متاح" />
        </span>
        <h1 style={{ marginTop: 16 }}>
          <T en="Marketplace checkout is coming later" ar="إتمام شراء المتجر سيُتاح لاحقًا" />
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 620, margin: "16px auto 0" }}>
          <T
            en="The MVP does not process marketplace purchases. Products are shown for catalog and enquiry purposes only until checkout, shipping, returns, and warranty handling are fully implemented."
            ar="لا تعالج النسخة الأولية مشتريات المتجر. تظهر المنتجات للكتالوج والاستفسار فقط إلى أن يتم تنفيذ الدفع والشحن والإرجاع والضمان بالكامل."
          />
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
          <Link href="/marketplace" className="btn btn-primary">
            <T en="View Gear Catalog" ar="عرض كتالوج المعدات" />
          </Link>
          <Link href="/support" className="btn btn-outline">
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </div>
      </section>
    </main>
  );
}
