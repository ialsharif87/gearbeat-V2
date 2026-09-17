import Link from "next/link";
import T from "@/components/t";

export default function MarketplaceCartPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 760, margin: "0 auto" }}>
      <section className="card" style={{ marginTop: 48, padding: "clamp(28px, 6vw, 52px)", textAlign: "center" }}>
        <span className="badge badge-gold">
          <T en="Catalog only" ar="كتالوج فقط" />
        </span>
        <h1 style={{ marginTop: 16 }}>
          <T en="Purchasing is not enabled in the MVP" ar="الشراء غير مفعّل في النسخة الأولية" />
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 620, margin: "16px auto 0" }}>
          <T
            en="GearBeat currently shows selected audio products as a reference catalog. Cart, checkout, shipping, and warranty services will only be enabled after the commercial flow is fully ready."
            ar="تعرض GearBeat حاليًا منتجات صوتية مختارة ككتالوج مرجعي. لن يتم تفعيل السلة والدفع والشحن والضمان إلا بعد اكتمال الجاهزية التجارية بالكامل."
          />
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
          <Link href="/marketplace" className="btn btn-primary">
            <T en="Back to Gear Catalog" ar="العودة إلى كتالوج المعدات" />
          </Link>
          <Link href="/support" className="btn btn-outline">
            <T en="Ask about an item" ar="اسأل عن منتج" />
          </Link>
        </div>
      </section>
    </main>
  );
}
