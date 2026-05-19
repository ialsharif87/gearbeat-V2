import { Metadata } from "next";
import Link from "next/link";
import T from "../../../components/t";

export const metadata: Metadata = {
  title: "Partner Application Intake Architecture Preview",
  description: "Unified partner application intake architecture and domain routing directory preview.",
};

export default function PartnerApplyPage() {
  return (
    <section className="support-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero / Header */}
      <div className="support-hero card" style={{ position: "relative", overflow: "hidden", marginBottom: 40 }}>
        <div className="support-hero-content">
          <span className="badge" style={{ background: "var(--gb-gold)", color: "#000" }}>
            <T en="Pre-Launch Architecture Map" ar="خريطة هيكلية ما قبل الإطلاق" />
          </span>

          <h1 style={{ marginTop: 12 }}>
            <T en="Partner Application Intake" ar="طلبات انضمام الشركاء" />
          </h1>

          <p>
            <T
              en="This page demonstrates the planned unified partner intake directory for GearBeat. In the future, this flow will live at partners.gearbeat.app."
              ar="توضح هذه الصفحة المسار الموحد المخطط له لتقديم طلبات الشركاء في GearBeat. مستقبلاً، سيعمل هذا المسار تحت النطاق partners.gearbeat.app."
            />
          </p>

          {/* Alert / Preview Badge */}
          <div style={{
            marginTop: 20,
            padding: "12px 16px",
            background: "rgba(212, 175, 55, 0.05)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            borderRadius: 6,
            fontSize: "0.85rem",
            color: "var(--gb-gold)"
          }}>
            ⚠️ <T 
              en="Application intake architecture preview only — No database inserts, document uploads, or account creation are active." 
              ar="معاينة للهيكل التنظيمي فقط — لا توجد عمليات تسجيل، رفع مستندات، أو حفظ في قاعدة البيانات." 
            />
          </div>
        </div>

        <div className="support-hero-panel">
          <div className="support-pulse-ring">
            <span />
            <span />
            <span />
            <strong>GB</strong>
          </div>

          <div className="support-status-card">
            <strong>
              <T en="Domain Target" ar="النطاق المستهدف" />
            </strong>
            <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--gb-gold)" }}>
              partners.gearbeat.app
            </p>
          </div>
        </div>
      </div>

      {/* Partner Types Matrix */}
      <div className="section-head" style={{ marginBottom: 30 }}>
        <span className="badge">
          <T en="Partner Matrix" ar="مصفوفة الشركاء" />
        </span>

        <h1>
          <T
            en="Choose your partner profile type."
            ar="اختر نوع ملف الشريك الخاص بك."
          />
        </h1>

        <p>
          <T
            en="GearBeat offers specialized roles and subdomains tailored to different audio industry ecosystems."
            ar="تقدم GearBeat أدواراً ونطاقات فرعية متخصصة ومصممة لتناسب مختلف مجالات قطاع الصوتيات."
          />
        </p>
      </div>

      <div className="support-grid" style={{ marginBottom: 40 }}>
        {/* Card 1: Studio Owner */}
        <div className="card support-topic-card">
          <div className="support-topic-icon">🎙️</div>
          <span className="badge">01</span>
          <h2>
            <T en="Studio Owner" ar="مالك استوديو" />
          </h2>
          <p style={{ minHeight: 70 }}>
            <T
              en="List commercial recording facilities, control rooms, and rehearsal spaces for hourly booking."
              ar="أدرج مرافق التسجيل التجارية، غرف التحكم، ومساحات التدريب الصوتي للحجز بالساعة."
            />
          </p>
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>
            <T en="Target: portal.gearbeat.app" ar="المستهدف: portal.gearbeat.app" />
          </div>
        </div>

        {/* Card 2: Seller / Merchant */}
        <div className="card support-topic-card">
          <div className="support-topic-icon">🏪</div>
          <span className="badge">02</span>
          <h2>
            <T en="Seller / Merchant" ar="تاجر / بائع" />
          </h2>
          <p style={{ minHeight: 70 }}>
            <T
              en="Offer audio hardware, studio gear, musical instruments, and software licenses."
              ar="اعرض الأجهزة الصوتية، معدات الاستوديوهات، الآلات الموسيقية، وتراخيص البرمجيات."
            />
          </p>
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>
            <T en="Target: seller.gearbeat.app" ar="المستهدف: seller.gearbeat.app" />
          </div>
        </div>

        {/* Card 3: Service Provider */}
        <div className="card support-topic-card">
          <div className="support-topic-icon">🎚️</div>
          <span className="badge">03</span>
          <h2>
            <T en="Service Provider" ar="مزود خدمة" />
          </h2>
          <p style={{ minHeight: 70 }}>
            <T
              en="Provide professional mixing, mastering, session performance, and vocal talent services."
              ar="قدم خدمات احترافية في هندسة الصوت، الماسترينغ، الأداء الموسيقي، أو الأداء الصوتي."
            />
          </p>
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>
            <T en="Target: providers.gearbeat.app" ar="المستهدف: providers.gearbeat.app" />
          </div>
        </div>

        {/* Card 4: Academy Instructor */}
        <div className="card support-topic-card">
          <div className="support-topic-icon">🎓</div>
          <span className="badge">04</span>
          <h2>
            <T en="Academy Instructor" ar="مدرب أكاديمي" />
          </h2>
          <p style={{ minHeight: 70 }}>
            <T
              en="Publish certified training, host masterclasses, and provide one-on-one audio mentorship."
              ar="انشر برامج تدريبية معتمدة، استضف ورش عمل، وقدم توجيهاً صوتياً فردياً."
            />
          </p>
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>
            <T en="Target: instructors.gearbeat.app" ar="المستهدف: instructors.gearbeat.app" />
          </div>
        </div>

        {/* Card 5: Ticket Organizer */}
        <div className="card support-topic-card">
          <div className="support-topic-icon">🎫</div>
          <span className="badge">05</span>
          <h2>
            <T en="Ticket Organizer" ar="منظم فعاليات" />
          </h2>
          <p style={{ minHeight: 70 }}>
            <T
              en="Organize listening experiences, product demo days, live showcases, and masterclasses."
              ar="نظم تجارب استماع، أيام تجربة المنتجات، العروض الحية، أو ورش العمل الجماعية."
            />
          </p>
          <div style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>
            <T en="Target: organizers.gearbeat.app" ar="المستهدف: organizers.gearbeat.app" />
          </div>
        </div>
      </div>

      {/* Process Flow & Security */}
      <div className="support-split">
        <div className="card">
          <span className="badge">
            <T en="Intake Pipeline" ar="مسار معالجة الطلبات" />
          </span>

          <h2>
            <T
              en="Application Lifecycle"
              ar="دورة حياة الطلبات"
            />
          </h2>

          <div className="support-check-list" style={{ marginTop: 20 }}>
            <span>
              <strong>1. <T en="Submission" ar="التقديم" />:</strong> <T en="Partner chooses profile type on partners.gearbeat.app." ar="يختار الشريك نوع الملف ويملأ البيانات على partners.gearbeat.app." />
            </span>
            <span>
              <strong>2. <T en="Review" ar="المراجعة" />:</strong> <T en="Admin verifies Saudi identity, CR, commercial permits." ar="يراجع المسؤول الهوية السعودية، السجل التجاري، والتراخيص." />
            </span>
            <span>
              <strong>3. <T en="Approval" ar="الموافقة" />:</strong> <T en="Secure email triggers activation and role provisioning." ar="يرسل إشعار تفعيل آمن ويتم تخصيص صلاحية الدور المناسب." />
            </span>
            <span>
              <strong>4. <T en="Onboarding" ar="الانضمام" />:</strong> <T en="Partner logs in to their designated subdomain dashboard." ar="يسجل الشريك الدخول إلى لوحة التحكم الخاصة بنطاقه الفرعي." />
            </span>
          </div>
        </div>

        <div className="card support-contact-card">
          <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <T en="Security Boundary" ar="الحدود الأمنية" />
          </span>

          <h2 style={{ color: "#fff" }}>
            <T en="Intake Safety Regulations" ar="قواعد أمان معالجة الطلبات" />
          </h2>

          <p>
            <T
              en="During the pre-launch/pilot phase, sensitive company records, billing parameters, bank accounts, and commercial permits are never stored on public intake pipelines."
              ar="خلال المرحلة التجريبية، لا يتم حفظ السجلات الحساسة للشركات، أو الحسابات البنكية، أو التراخيص التجارية في مسارات التقديم العامة."
            />
          </p>

          <div className="support-contact-box" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <strong>
              <T en="Manual Auditing" ar="التدقيق اليدوي" />
            </strong>
            <p>
              <T
                en="All approvals are manually reviewed. Public registration forms do not auto-authorize administrative roles or platform operator access."
                ar="تتم مراجعة جميع الموافقات يدوياً. لا تمنح نماذج التسجيل العامة صلاحيات إدارية أو وصولاً لمشغلي المنصة تلقائياً."
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
