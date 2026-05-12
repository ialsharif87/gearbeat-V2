import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Review GearBeat's Privacy Policy. Learn how we collect, protect, and use your data in compliance with Saudi PDPL standards.",
};

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
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This privacy policy is a structural draft. It is NOT finalized and is pending review for compliance with regional data protection regulations." ar="سياسة الخصوصية هذه هي مسودة هيكلية. وهي ليست نهائية وبانتظار المراجعة للامتثال للوائح حماية البيانات الإقليمية." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Data Collection" ar="1. جمع البيانات" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="GearBeat collects information necessary to provide booking and marketplace services, including name, email, phone number, and professional studio details. We also collect transaction metadata to ensure secure payment processing." ar="تجمع GearBeat المعلومات اللازمة لتقديم خدمات الحجز والمتجر، بما في ذلك الاسم والبريد الإلكتروني ورقم الهاتف وتفاصيل الاستوديو المهني. كما نجمع البيانات الوصفية للمعاملات لضمان معالجة الدفع الآمنة." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Usage & Sharing" ar="2. الاستخدام والمشاركة" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Your data is used to manage bookings, verify identity for GearBeat Certified status, and communicate platform updates. We do not sell PII to third parties. Data is shared with payment providers only as required for transaction fulfillment." ar="تُستخدم بياناتك لإدارة الحجوزات، والتحقق من الهوية لحالة GearBeat Certified، وإرسال تحديثات المنصة. نحن لا نبيع معلومات التعريف الشخصية لأطراف ثالثة. يتم مشاركة البيانات مع مزودي الدفع فقط حسب الضرورة لإتمام المعاملات." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="3. PDPL Compliance (KSA)" ar="3. الامتثال لنظام حماية البيانات الشخصية (السعودية)" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="GearBeat is designed with Saudi Personal Data Protection Law (PDPL) principles in mind, focusing on data residency requirements, user consent, and the right to access or rectify personal information." ar="تم تصميم GearBeat مع مراعاة مبادئ نظام حماية البيانات الشخصية السعودي (PDPL)، مع التركيز على متطلبات إقامة البيانات، وموافقة المستخدم، والحق في الوصول إلى المعلومات الشخصية أو تصحيحها." />
          </p>
        </div>
      </div>
    </main>
  );
}
