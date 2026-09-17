import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Marketplace Catalog Notice",
  description: "Current GearBeat MVP marketplace status and catalog limitations.",
};

export default function MarketplacePolicyPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Link href="/legal" className="text-gold" style={{ display: "inline-block", marginBottom: 32, fontSize: "0.85rem", fontWeight: 600 }}>
        ← <T en="Back to Legal Hub" ar="العودة إلى المركز القانوني" />
      </Link>

      <div className="card-premium" style={{ border: "1px dashed rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.02)" }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>
          <T en="MVP Notice" ar="تنبيه النسخة الأولية" />
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>
          <T en="Marketplace Catalog Status" ar="حالة كتالوج المتجر" />
        </h1>
        <div style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: "0.9rem" }}>
          <p style={{ marginBottom: 16 }}>
            <T
              en="GearBeat currently presents selected audio products as a reference catalog. The MVP does not process marketplace purchases."
              ar="تعرض GearBeat حاليًا منتجات صوتية مختارة ككتالوج للمرجعية. النسخة الأولية لا تعالج عمليات شراء عبر المتجر."
            />
          </p>

          <h3 style={{ color: "#fff", marginTop: 32, marginBottom: 16 }}>
            <T en="1. No online checkout" ar="1. لا يوجد دفع إلكتروني" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T
              en="Cart, payment, escrow, refunds, and seller payouts are not active marketplace services in this MVP."
              ar="السلة والدفع والضمان المالي والاسترداد ومدفوعات البائعين ليست خدمات متجر مفعلة في هذه النسخة الأولية."
            />
          </p>

          <h3 style={{ color: "#fff", marginTop: 32, marginBottom: 16 }}>
            <T en="2. No shipping or warranty handling" ar="2. لا توجد معالجة للشحن أو الضمان" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T
              en="GearBeat does not currently arrange delivery, returns, or warranty claims for catalog items. Product details are provided for reference and enquiries only."
              ar="لا تقوم GearBeat حاليًا بترتيب التوصيل أو الإرجاع أو مطالبات الضمان لمنتجات الكتالوج. تفاصيل المنتجات معروضة للمرجعية والاستفسار فقط."
            />
          </p>

          <h3 style={{ color: "#fff", marginTop: 32, marginBottom: 16 }}>
            <T en="3. Future commerce terms" ar="3. شروط التجارة المستقبلية" />
          </h3>
          <p>
            <T
              en="Commercial marketplace terms, buyer protections, fulfilment rules, and dispute handling will be published before any live marketplace transaction flow is enabled."
              ar="سيتم نشر شروط المتجر التجارية وحماية المشتري وقواعد التنفيذ ومعالجة النزاعات قبل تفعيل أي مسار معاملات تجارية حية."
            />
          </p>
        </div>
      </div>
    </main>
  );
}
