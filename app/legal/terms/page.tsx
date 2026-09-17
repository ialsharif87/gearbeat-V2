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
      
      <div className="card-premium animate-up" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)', padding: 40 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <span className="badge badge-gold">
            <T en="DRAFT TERMS FOR PILOT PHASE VETTING" ar="مسودة شروط الخدمة لغرض مراجعة المرحلة التجريبية" />
          </span>
          <span className="badge" style={{ background: "rgba(255, 77, 77, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 77, 77, 0.2)" }}>
            <T en="PENDING LEGAL REVIEW" ar="قيد المراجعة القانونية" />
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
          <T en="Terms of Service" ar="شروط الخدمة" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 24, fontSize: "1.05rem", color: "#fff", borderLeft: "2px solid var(--gb-gold)", paddingLeft: 16 }}>
            <strong><T en="Important Notice:" ar="تنبيه هام:" /></strong>{" "}
            <T 
              en="These Terms of Service are a draft prepared for compliance readiness and are subject to change based on final legal counsel approval. GearBeat V2 is in its invite-only GCC pilot phase." 
              ar="شروط الخدمة هذه عبارة عن مسودة معدة لغرض الجاهزية والامتثال وتخضع للتغيير بناءً على المراجعة القانونية النهائية. GearBeat V2 حالياً في مرحلتها التجريبية المغلقة للخليج." 
            />
          </p>

          {/* Section 1: Pilot Operations & Warranty Disclaimer */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="1. Pilot Operations & Disclaimer of Warranties" ar="1. العمليات التجريبية وإخلاء المسؤولية عن الضمانات" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="GearBeat V2 operates strictly within a controlled Pilot Phase. The platform discovery engine, marketplace grids, and booking schedules are provisional and provided on an 'as-is' and 'as-available' baseline for sandbox validation. All user bookings, marketplace cart requests, and partner applications are subject to manual administrative review and off-platform verification before final commercial activation." 
              ar="تعمل منصة GearBeat V2 بشكل صارم ضمن مرحلة تجريبية محكومة. محرك استكشاف المنصة، شبكات المتجر، وجداول الحجز مؤقتة ومقدمة على أساس 'كما هي' و'كما تتوفر' لأغراض التحقق والتحسين. تخضع كافة حجوزات المستخدمين، وطلبات عربة التسوق، وطلبات الشركاء للمراجعة الإدارية اليدوية والتحقق خارج المنصة قبل التنشيط التجاري النهائي." 
            />
          </p>

          {/* Section 2: Partner Representation & Corporate Authority */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="2. Partner Representation & Corporate Authority" ar="2. إقرارات الشريك والصلاحية النظامية للشركات" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="By submitting interest profiles, commercial company names, or pre-registration forms on behalf of a music studio, retail vendor, or service entity, you represent and warrant that you are an authorized legal officer of the entity. You certify that you possess the necessary corporate power and authority to submit information for vetting purposes and to bind such entity to draft SLAs." 
              ar="من خلال إرسال ملفات الاهتمام، أسماء الشركات التجارية، أو نماذج التسجيل المسبق نيابة عن استوديو موسيقي، أو بائع تجزئة، أو كيان خدمي، فإنك تقر وتضمن بأنك ممثل نظامي مفوض للكيان المعني. وتصادق على أنك تمتلك الصلاحيات الإدارية والقانونية اللازمة لتقديم المعلومات لأغراض التدقيق وربط الكيان بمسودات اتفاقيات مستوى الخدمة." 
            />
          </p>

          {/* Section 3: Billing & SAMA Payment Disclaimers */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="3. Billing & SAMA Payment Gateways" ar="3. الفوترة وبوابات مدفوعات مؤسسة النقد العربي السعودي (ساما)" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="No automated online credit card processing or merchant payments are active. All live payment gateway integrations remain subject to SAMA provider licensing, complete security audits, and final operational authorization. All checkout workflows during this pilot phase are provisional, utilizing local bank-ledger transfer matching and manual deposit confirmation only." 
              ar="لا يتم تفعيل أي عمليات معالجة لبطاقات الائتمان أو المدفوعات التلقائية للمنافذ عبر الإنترنت. تخضع كافة تكاملات بوابات الدفع لترخيص مزودي الخدمة من البنك المركزي السعودي (ساما)، وإتمام تدقيق الحماية الشامل. جميع عمليات الدفع المتاحة خلال هذه المرحلة التجريبية مؤقتة، وتعتمد حصرياً على مطابقة التحويلات البنكية المحلية والتأكيد اليدوي للإيداعات." 
            />
          </p>

          {/* Section 4: Governing Law & Jurisdiction */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="4. Governing Law & Jurisdiction" ar="4. القانون الواجب التطبيق والاختصاص القضائي" />
          </h3>
          <p style={{ marginBottom: 16 }}>
            <T 
              en="These Terms of Service, along with all platform transactions and policies, shall be governed by, interpreted, and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of Riyadh, Saudi Arabia." 
              ar="تخضع شروط الخدمة هذه، إلى جانب كافة معاملات وسياسات المنصة، وتُفسر وتُطبق وفقاً للأنظمة والقوانين السارية في المملكة العربية السعودية. ويخضع أي نزاع ينشأ عنها أو يتعلق بها للاختصاص القضائي الحصري للمحاكم المختصة بمدينة الرياض، المملكة العربية السعودية." 
            />
          </p>

          {/* Section 5: Legal Inquiries */}
          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16, fontSize: "1.25rem", fontWeight: 800 }}>
            <T en="5. Legal Inquiries & Governance" ar="5. الاستفسارات القانونية والحوكمة" />
          </h3>
          <p style={{ marginBottom: 24 }}>
            <T 
              en="For any legal clarifications, corporate partnership vetting queries, or regulatory questions, please contact our legal desk at: " 
              ar="لأي توضيحات قانونية، استفسارات متعلقة بشراكات الشركات، أو أسئلة تنظيمية، يرجى التواصل مع مكتبنا القانوني عبر: " 
            />
            <a href="mailto:legal@gearbeat.com" style={{ color: "var(--gb-gold)", textDecoration: "underline", fontWeight: 700 }}>
              legal@gearbeat.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
