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
      
      <div className="card-premium animate-up" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)', padding: 40 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <span className="badge badge-gold">
            <T en="DRAFT POLICY FOR PILOT PHASE VETTING" ar="مسودة سياسة لغرض مراجعة المرحلة التجريبية" />
          </span>
          <span className="badge" style={{ background: "rgba(255, 77, 77, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 77, 77, 0.2)" }}>
            <T en="PENDING LEGAL REVIEW" ar="قيد المراجعة القانونية" />
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
          <T en="Privacy Policy" ar="سياسة الخصوصية" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 24, fontSize: "1.05rem", color: "#fff", borderLeft: "2px solid var(--gb-gold)", paddingLeft: 16 }}>
            <strong><T en="Important Notice:" ar="تنبيه هام:" /></strong>{" "}
            <T 
              en="This Privacy Policy is a draft prepared for compliance readiness and is subject to change based on final legal counsel approval. GearBeat V2 is in its invite-only GCC pilot phase." 
              ar="سياسة الخصوصية هذه عبارة عن مسودة معدة لغرض الجاهزية والامتثال وتخضع للتغيير بناءً على المراجعة القانونية النهائية. GearBeat V2 حالياً في مرحلتها التجريبية المغلقة للخليج." 
            />
          </p>

          {/* Section 1: Data Collection & Sensitive Data Blocklist */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="1. Data Collection & Sensitive Data Blocklist" ar="1. جمع البيانات وقائمة حظر البيانات الحساسة" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="We collect only necessary information to process manual reservations and platform onboarding (e.g., name, corporate email, mobile number, and city). Under our strict compliance guidelines, GearBeat does not collect, process, or upload sensitive partner documents (such as Commercial Registrations, VAT certificates, national IDs, or bank screenshots) through public web flows until fully localized KSA storage nodes are verified." 
              ar="نحن نجمع فقط المعلومات الضرورية لمعالجة الحجوزات اليدوية والطلبات المبدئية (مثل الاسم، البريد الإلكتروني للعمل، رقم الجوال، والمدينة). بموجب إرشادات الامتثال الصارمة لدينا، لا تقوم المنصة بجمع أو معالجة أو رفع أي وثائق حساسة للشركاء (مثل السجل التجاري، شهادة الضريبة، الهوية الوطنية، أو صور الحسابات البنكية) عبر تدفقات الويب العامة حتى يتم تفعيل خوادم التخزين المحلية المعتمدة داخل المملكة." 
            />
          </p>

          {/* Section 2: Data Residency & Sovereignty */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="2. Data Residency & Sovereignty" ar="2. إقامة البيانات والسيادة المحلية" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="In compliance with the Saudi Personal Data Protection Law (PDPL), all personal identifying information (PII) of Saudi Arabian citizens and residents is designated to be stored locally within the geographical boundaries of the Kingdom of Saudi Arabia. Core staging elements reside temporarily on secure isolated nodes, and any international data transfers are strictly prohibited unless certified under local SDAIA regulatory exemptions." 
              ar="امتثالاً لنظام حماية البيانات الشخصية السعودي (PDPL)، فإن كافة بيانات التعريف الشخصية الخاصة بمواطني ومقيمي المملكة العربية السعودية مصممة ليتم تخزينها محلياً بالكامل داخل الحدود الجغرافية للمملكة. تقيم عناصر النظام التجريبي مؤقتاً على خوادم معزولة آمنة، ويُحظر تماماً نقل البيانات خارج الحدود الإقليمية دون ترخيص وإعفاء رسمي من الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)." 
            />
          </p>

          {/* Section 3: User Rights Under Saudi PDPL */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="3. User Rights Under KSA PDPL" ar="3. حقوق المستخدم بموجب نظام حماية البيانات الشخصية" />
          </h3>
          <p style={{ marginBottom: 12 }}>
            <T 
              en="Every registered user on GearBeat holds the following legal rights regarding their personal datasets under the PDPL:" 
              ar="يتمتع كل مستخدم مسجل على منصة GearBeat بالحقوق القانونية التالية المتعلقة ببياناته الشخصية بموجب النظام:" 
            />
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 24, listStyleType: "square" }}>
            <li style={{ marginBottom: 8 }}>
              <strong><T en="Right to Know:" ar="الحق في العلم:" /></strong>{" "}
              <T en="Access details on our exact processing methods and database storage locations." ar="معرفة تفاصيل وإجراءات معالجة البيانات الشخصية وجهات تخزينها." />
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong><T en="Right of Access:" ar="الحق في الوصول:" /></strong>{" "}
              <T en="Request a full digital copy of all personal datasets registered on our servers." ar="طلب نسخة رقمية كاملة من كافة البيانات الشخصية المسجلة لدى المنصة." />
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong><T en="Right of Correction:" ar="الحق في التصحيح:" /></strong>{" "}
              <T en="Instantly request amendments or updates to outdated or incorrect profile entries." ar="طلب تصحيح أو تحديث أي بيانات غير دقيقة أو قديمة." />
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong><T en="Right of Destruction:" ar="الحق في الإتلاف (الحق في النسيان):" /></strong>{" "}
              <T en="Request permanent erasure of all stored personal records from our databases." ar="طلب الحذف النهائي والإتلاف لكافة السجلات والبيانات الشخصية المسجلة." />
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong><T en="Right to Withdraw Consent:" ar="الحق في سحب الموافقة:" /></strong>{" "}
              <T en="Instantly withdraw previously granted data-processing consents at any time." ar="سحب الموافقة الممنوحة مسبقاً لمعالجة البيانات في أي وقت." />
            </li>
          </ul>

          {/* Section 4: Live Payment Disclaimers */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="4. Payment Gateway & SAMA Readiness" ar="4. بوابة المدفوعات والجاهزية لمؤسسة النقد (ساما)" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="GearBeat does not process raw credit card or automated online transaction credentials directly. All live payment gateway integrations remain subject to SAMA provider licensing, complete regulatory audits, and final operational authorization. Currently, only manual bank-ledger transfer verification options are supported during our GCC pilot rollout." 
              ar="لا تقوم المنصة بمعالجة بطاقات الائتمان أو بيانات الدفع التلقائية مباشرة عبر الإنترنت في هذه المرحلة. تخضع كافة عمليات تكامل بوابة الدفع الحية لترخيص مزودي الخدمة من البنك المركزي السعودي (ساما)، وإتمام التدقيق التنظيمي الشامل. حالياً، يتم دعم خيارات التحقق اليدوي للحوالات البنكية فقط خلال فترة الإطلاق التجريبي للخليج." 
            />
          </p>

          {/* Section 5: Data Protection Office & Contact */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="5. Data Protection Office & Contact" ar="5. مكتب حماية البيانات والتواصل" />
          </h3>
          <p style={{ marginBottom: 24 }}>
            <T 
              en="For any privacy inquiries, consent withdrawals, or user rights execution, please contact our designated Data Protection team at: " 
              ar="لأي استفسارات تتعلق بالخصوصية، أو سحب الموافقة، أو ممارسة حقوقك القانونية، يرجى التواصل مع فريق حماية البيانات المخصص لدينا عبر: " 
            />
            <a href="mailto:privacy@gearbeat.com" style={{ color: "var(--gb-gold)", textDecoration: "underline", fontWeight: 700 }}>
              privacy@gearbeat.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
