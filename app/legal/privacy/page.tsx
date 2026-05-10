import Link from "next/link";
import T from "@/components/t";

export default function PrivacyPage() {
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
          <T en="Privacy Policy" ar="سياسة الخصوصية" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This document is a structural placeholder. It is NOT finalized legal text." ar="هذه الوثيقة هي عنصر نائب هيكلي. وهي ليست نصاً قانونياً نهائياً." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Data Collection" ar="1. جمع البيانات" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder detailing what PII (Personally Identifiable Information) GearBeat collects, including names, emails, payment methods, and location data." ar="عنصر نائب لمسودة تفصل معلومات التعريف الشخصية (PII) التي يجمعها جيربيت، بما في ذلك الأسماء ورسائل البريد الإلكتروني وطرق الدفع وبيانات الموقع." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. PDPL Readiness (Saudi Arabia)" ar="2. جاهزية نظام حماية البيانات الشخصية (السعودية)" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Future clauses addressing compliance with the Saudi Personal Data Protection Law (PDPL), data residency, and user rights to access/delete data." ar="بنود مستقبلية تتناول الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)، ومكان إقامة البيانات، وحقوق المستخدم في الوصول إلى البيانات أو حذفها." />
          </p>
        </div>
      </div>
    </main>
  );
}
