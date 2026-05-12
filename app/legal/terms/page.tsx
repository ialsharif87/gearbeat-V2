import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read GearBeat's Terms of Service. Learn about platform rules, account responsibilities, and intellectual property rights.",
};

export default function TermsPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Link href="/legal" className="text-gold" style={{ display: 'inline-block', marginBottom: 32, fontSize: '0.85rem', fontWeight: 600 }}>
        ← <T en="Back to Legal Hub" ar="العودة إلى المركز القانوني" />
      </Link>
      
      <div className="card-premium" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)' }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>
          <T en="Official Policy" ar="سياسة رسمية" />
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>
          <T en="Terms of Service" ar="شروط الخدمة" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Notice:" ar="تنبيه:" /></strong> <T en="This document governs the relationship between GearBeat and its users. It is optimized for the platform's current launch operations and pilot phase." ar="تحكم هذه الوثيقة العلاقة بين GearBeat ومستخدميها. وهي مخصصة لعمليات إطلاق المنصة الحالية والمرحلة التجريبية." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Acceptance of Terms" ar="1. قبول الشروط" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="By accessing the GearBeat platform, creating an account, or listing a studio, you agree to be bound by these Terms of Service. These terms govern your use of our discovery, booking, and marketplace ecosystems." ar="من خلال الوصول إلى منصة GearBeat، أو إنشاء حساب، أو إدراج استوديو، فإنك توافق على الالتزام بشروط الخدمة هذه. تحكم هذه الشروط استخدامك لأنظمة الاكتشاف والحجز والمتجر الخاصة بنا." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Account Responsibilities" ar="2. مسؤوليات الحساب" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Users are responsible for maintaining the confidentiality of their credentials. You agree to provide accurate identification and to notify GearBeat immediately of any unauthorized access. Prohibited activities include fraudulent listings, unauthorized reselling, and platform bypass." ar="يتحمل المستخدمون مسؤولية الحفاظ على سرية بيانات اعتمادهم. أنت توافق على تقديم تعريف دقيق وإخطار GearBeat فوراً بأي وصول غير مصرح به. تشمل الأنشطة المحظورة القوائم الاحتيالية، وإعادة البيع غير المصرح بها، وتجاوز المنصة." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="3. Intellectual Property" ar="3. الملكية الفكرية" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="All platform design, code, and GearBeat Certified branding are the exclusive property of GearBeat. Users retain ownership of their uploaded content but grant GearBeat a license to display such content for discovery and marketing purposes." ar="جميع تصميمات المنصة والتعليمات البرمجية وعلامة GearBeat Certified هي ملكية حصرية لـ GearBeat. يحتفظ المستخدمون بملكية محتواهم المرفوع ولكنهم يمنحون GearBeat ترخيصاً لعرض هذا المحتوى لأغراض الاكتشاف والتسويق." />
          </p>
        </div>
      </div>
    </main>
  );
}
