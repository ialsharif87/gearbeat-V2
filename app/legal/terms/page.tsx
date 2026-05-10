import Link from "next/link";
import T from "@/components/t";

export default function TermsPage() {
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
          <T en="Terms of Service" ar="شروط الخدمة" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This document is a structural placeholder for Phase 59 architecture. It is NOT finalized legal text and lacks actual enforcement logic." ar="هذه الوثيقة هي عنصر نائب هيكلي لبنية المرحلة 59. وهي ليست نصاً قانونياً نهائياً وتفتقر إلى منطق التنفيذ الفعلي." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Acceptance of Terms" ar="1. قبول الشروط" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder for user agreement to platform rules, arbitration clauses, and account creation terms." ar="عنصر نائب لمسودة موافقة المستخدم على قواعد المنصة، وبنود التحكيم، وشروط إنشاء الحساب." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Account Responsibilities" ar="2. مسؤوليات الحساب" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder for user liability, credential security, and prohibited activities on the GearBeat ecosystem." ar="عنصر نائب لمسودة مسؤولية المستخدم، وأمن بيانات الاعتماد، والأنشطة المحظورة على نظام جيربيت البيئي." />
          </p>
        </div>
      </div>
    </main>
  );
}
