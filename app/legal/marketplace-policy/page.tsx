import Link from "next/link";
import T from "@/components/t";

export default function MarketplacePolicyPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Link href="/legal" className="text-gold" style={{ display: 'inline-block', marginBottom: 32, fontSize: '0.85rem', fontWeight: 600 }}>
        ← <T en="Back to Legal Hub" ar="العودة إلى المركز القانوني" />
      </Link>
      
      <div className="card-premium" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)' }}>
        <span className="badge badge-warning" style={{ marginBottom: 16 }}>
          <T en="DRAFT COPY" ar="نسخة مسودة" />
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>
          <T en="Marketplace Policy" ar="سياسة السوق" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This document is a structural placeholder. It is NOT finalized legal text." ar="هذه الوثيقة هي عنصر نائب هيكلي. وهي ليست نصاً قانونياً نهائياً." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Buyer Protection" ar="1. حماية المشتري" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder outlining refund conditions, return windows, and dispute resolution for physical gear purchases." ar="عنصر نائب لمسودة توضح شروط الاسترداد ونوافذ الإرجاع وحل النزاعات لمشتريات المعدات المادية." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Seller Obligations" ar="2. التزامات البائع" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder detailing shipping SLA expectations, counterfeit gear penalties, and payout schedules." ar="عنصر نائب لمسودة توضح توقعات اتفاقية مستوى الخدمة للشحن، وعقوبات المعدات المزيفة، وجداول الدفع." />
          </p>
        </div>
      </div>
    </main>
  );
}
