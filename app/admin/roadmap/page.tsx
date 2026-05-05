import T from "@/components/t";

export const dynamic = "force-dynamic";

export default function RoadmapPage() {
  return (
    <main style={{ padding: 40, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <header style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12 }}>
          <T en="Project Roadmap & Compliance" ar="خارطة الطريق والامتثال" />
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          <T 
            en="Strategic timeline for GearBeat scaling and regulatory alignment in KSA." 
            ar="الجدول الزمني الاستراتيجي لتوسع جير بيت والامتثال التنظيمي في المملكة." 
          />
        </p>
      </header>

      <div style={{ display: 'grid', gap: 60, maxWidth: 1000 }}>
        
        {/* PDPL COMPLIANCE SECTION */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: 12, fontWeight: 900 }}>PDPL</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              <T en="PDPL Compliance Strategy" ar="استراتيجية الامتثال لنظام حماية البيانات" />
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 24 }}>
            {/* Phase 1 */}
            <TimelineBlock 
              phase="Phase 1" 
              phaseAr="المرحلة ١"
              titleEn="Before Launch" 
              titleAr="قبل الإطلاق"
              status="Mandatory" 
              statusAr="إلزامي"
              items={[
                { en: "Register on NDGP (ndgp.sdaia.gov.sa)", ar: "التسجيل في منصة (نطاق) ndgp.sdaia.gov.sa" },
                { en: "Bilingual Privacy Policy (AR + EN)", ar: "سياسة خصوصية ثنائية اللغة (عربي + إنجليزي)" },
                { en: "Explicit consent on all data collection points", ar: "نموذج موافقة صريح في جميع نقاط جمع البيانات" },
                { en: "Local Data Hosting (KSA Residency)", ar: "استضافة البيانات داخل المملكة (AWS Riyadh / STC Cloud)" },
                { en: "Data Breach Protocol (72-hour notification)", ar: "بروتوكول الإبلاغ عن تسريب البيانات (خلال ٧٢ ساعة)" }
              ]}
            />

            {/* Phase 2 */}
            <TimelineBlock 
              phase="Phase 2" 
              phaseAr="المرحلة ٢"
              titleEn="After 3–6 Months" 
              titleAr="بعد ٣-٦ أشهر"
              status="Evaluate" 
              statusAr="تقييم"
              items={[
                { en: "Assess DPO requirement (Large-scale/Sensitive data)", ar: "تقييم الحاجة لتعيين مسؤول حماية بيانات (DPO)" },
                { en: "Transfer Risk Assessment for external APIs", ar: "تقييم مخاطر نقل البيانات للخدمات الخارجية" }
              ]}
            />

            {/* Phase 3 */}
            <TimelineBlock 
              phase="Phase 3" 
              phaseAr="المرحلة ٣"
              titleEn="Ongoing Operations" 
              titleAr="العمليات المستمرة"
              status="Ongoing" 
              statusAr="مستمر"
              items={[
                { en: "Renew NDGP certificate (Valid 5 years)", ar: "تجديد شهادة منصة نطاق (كل ٥ سنوات)" },
                { en: "Privacy Policy reviews for new features", ar: "مراجعة سياسة الخصوصية عند إضافة ميزات جديدة" }
              ]}
            />
          </div>

          {/* WARNING CALLOUT */}
          <div style={{ 
            marginTop: 40, 
            padding: 24, 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            borderRadius: 16, 
            display: 'flex', 
            gap: 20, 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div>
              <p style={{ fontWeight: 800, color: '#ef4444', margin: 0, fontSize: '1.1rem' }}>
                <T 
                  en="Non-compliance fines reach SAR 5,000,000 per violation." 
                  ar="تصل غرامات عدم الامتثال إلى ٥,٠٠٠,٠٠٠ ريال سعودي لكل مخالفة." 
                />
              </p>
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>
                <T 
                  en="SDAIA issued 48 enforcement decisions in 2025–2026." 
                  ar="أصدرت سدايا ٤٨ قراراً إنفاذياً خلال عامي ٢٠٢٥-٢٠٢٦." 
                />
              </p>
            </div>
          </div>
        </section>

        {/* GENERAL PROJECT PHASES */}
        <section style={{ borderTop: '1px solid #1a1a1a', paddingTop: 60 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>
            <T en="General Project Execution" ar="مراحل تنفيذ المشروع العامة" />
          </h2>
          <div style={{ display: 'grid', gap: 24 }}>
             <SimplePhase 
               number="1" 
               titleEn="Foundation & UI" 
               titleAr="الأساس والواجهات" 
               descEn="Marketplace homepage, Auth, and Layout." 
               descAr="الصفحة الرئيسية، الهوية البصرية، ونظام الدخول."
               active 
             />
             <SimplePhase 
               number="2" 
               titleEn="Operations & Booking" 
               titleAr="العمليات والحجز" 
               descEn="Studio scheduling and Equipment checkout." 
               descAr="جدولة الاستوديوهات وإتمام طلبات المعدات."
             />
             <SimplePhase 
               number="3" 
               titleEn="Scale & Growth" 
               titleAr="التوسع والنمو" 
               descEn="Loyalty, Marketing automation, and Payouts." 
               descAr="نظام الولاء، أتمتة التسويق، والتحويلات المالية."
             />
          </div>
        </section>

      </div>
    </main>
  );
}

interface TimelineItem {
  en: string;
  ar: string;
}

interface TimelineBlockProps {
  phase: string;
  phaseAr: string;
  titleEn: string;
  titleAr: string;
  status: 'Mandatory' | 'Evaluate' | 'Ongoing';
  statusAr: string;
  items: TimelineItem[];
}

function TimelineBlock({ phase, phaseAr, titleEn, titleAr, status, statusAr, items }: TimelineBlockProps) {
  const statusColors: Record<string, { bg: string, text: string, border: string }> = {
    Mandatory: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#ef4444' },
    Evaluate: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#3b82f6' },
    Ongoing: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: '#22c55e' }
  };
  
  const colors = statusColors[status];

  return (
    <div style={{ background: '#111', borderRadius: 24, border: '1px solid #1e1e1e', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <span style={{ color: '#cfa86e', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <T en={phase} ar={phaseAr} />
          </span>
          <h3 style={{ fontSize: '1.4rem', marginTop: 4 }}>
            <T en={titleEn} ar={titleAr} />
          </h3>
        </div>
        <span style={{ 
          background: colors.bg, 
          color: colors.text, 
          border: `1px solid ${colors.border}`,
          padding: '4px 12px',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 800
        }}>
          <T en={status} ar={statusAr} />
        </span>
      </div>
      <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 12, fontSize: '0.95rem' }}>
            <span style={{ color: colors.text }}>•</span>
            <div>
              <div style={{ color: '#fff' }}>{item.en}</div>
              <div style={{ color: '#888', fontSize: '0.85rem' }}>{item.ar}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SimplePhaseProps {
  number: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  active?: boolean;
}

function SimplePhase({ number, titleEn, titleAr, descEn, descAr, active }: SimplePhaseProps) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 24, 
      padding: 24, 
      background: active ? 'rgba(207,168,110,0.05)' : 'transparent', 
      borderRadius: 16, 
      border: `1px solid ${active ? '#cfa86e' : '#222'}` 
    }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 12, 
        background: active ? '#cfa86e' : '#222', 
        color: active ? '#000' : '#888', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 900, 
        fontSize: '1.2rem' 
      }}>
        {number}
      </div>
      <div>
        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>
          <T en={titleEn} ar={titleAr} />
        </h4>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0 0' }}>
          <T en={descEn} ar={descAr} />
        </p>
      </div>
    </div>
  );
}
