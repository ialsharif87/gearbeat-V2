import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";
import SmartDiscoveryPreview from "@/components/smart-discovery-preview";

export const metadata: Metadata = {
  title: "GearBeat Academy | Master the Art of Sound",
  description: "Elite music, voice, and audio production lessons. Learn from world-class instructors in-person or online with GearBeat Academy.",
};

export default function AcademyLandingPage() {
  return (
    <main className="academy-page">
      {/* HERO SECTION */}
      <section className="academy-hero">
        <div className="container text-center animate-up">
          <div className="badge-gold mb-24 ms-auto me-auto">
            <T en="DEMO READINESS: ACADEMY PILOT" ar="جاهزية العرض: تجربة الأكاديمية" />
          </div>
          <h1 className="hero-title text-balance">
            <T en="Master the art of" ar="احترف فنون" />{" "}
            <span className="neon-text">
              <T en="sound." ar="الصوت." />
            </span>
          </h1>
          <p className="lead text-balance mb-48">
            <T
              en="Elite 1:1 lessons and group masterclasses with verified industry experts. Currently onboarding elite instructors for our global pilot launch."
              ar="دروس خاصة 1:1 ودروس ماستر كلاس جماعية مع خبراء صناعة معتمدين. نقوم حالياً بضم مدربين متميزين لإطلاقنا التجريبي العالمي."
            />
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/support" className="btn btn-primary btn-lg shadow-gold">
              <T en="Join Academy" ar="انضم للأكاديمية" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
              <T en="Become a Partner" ar="انضم كشريك" />
            </Link>
          </div>
        </div>
      </section>

      {/* LEARNING VERTICALS */}
      <section className="section-padding bg-darker">
        <div className="container">
          <div className="section-head text-center">
            <SmartDiscoveryPreview vertical="academy" />
            <h2><T en="Creative Learning Verticals" ar="مجالات التعلم الإبداعي" /></h2>
            <p className="text-muted"><T en="Specialized curriculums designed for modern creators." ar="مناهج متخصصة مصممة للمبدعين العصريين." /></p>
          </div>

          <div className="grid grid-4 gap-24">
            {[
              { icon: '🎹', en: 'Music Production', ar: 'الإنتاج الموسيقي', descEn: 'DAW mastery, sound design, and arrangement.', descAr: 'إتقان برامج الإنتاج، تصميم الصوت، والتوزيع.' },
              { icon: '🎙️', en: 'Voice & Vocals', ar: 'الصوت والغناء', descEn: 'Technical voice training and performance.', descAr: 'تدريب صوتي تقني وأداء غنائي.' },
              { icon: '🎧', en: 'Audio Engineering', ar: 'الهندسة الصوتية', descEn: 'Mixing, mastering, and signal flow.', descAr: 'المكس، الماستر، ومسار الإشارة.' },
              { icon: '📻', en: 'Podcast & Broadcast', ar: 'البودكاست والبث', descEn: 'Storytelling and technical recording.', descAr: 'سرد القصص والتسجيل التقني.' },
            ].map(v => (
              <div key={v.en} className="card-premium text-center">
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>{v.icon}</div>
                <h3><T en={v.en} ar={v.ar} /></h3>
                <p style={{ fontSize: '0.85rem', color: '#888' }}><T en={v.descEn} ar={v.descAr} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LESSON STRUCTURE */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-2 items-center gap-60">
            <div>
              <span className="badge-gold"><T en="Flexible Formats" ar="تنسيقات مرنة" /></span>
              <h2><T en="How You Learn." ar="كيف تتعلم." /></h2>
              <p className="text-muted">
                <T 
                  en="Whether you prefer in-person studio sessions or global online connectivity, GearBeat Academy adapts to your schedule and goals."
                  ar="سواء كنت تفضل جلسات الاستوديو الشخصية أو الاتصال العالمي عبر الإنترنت، فإن أكاديمية جيربيت تتكيف مع جدولك وأهدافك."
                />
              </p>
              <div className="structure-list">
                {[
                  { en: '1:1 Private Lessons', ar: 'دروس خاصة 1:1' },
                  { en: 'Group Masterclasses', ar: 'دروس جماعية' },
                  { en: 'School & Private Cohorts', ar: 'مجموعات دراسية وخاصة' },
                  { en: 'Global Online Learning', ar: 'تعلم عالمي عبر الإنترنت' },
                  { en: 'In-Person Studio Lessons', ar: 'دروس حضورية في الاستوديو' }
                ].map(item => (
                  <div key={item.en} className="structure-item">
                    <span className="check">✓</span>
                    <T en={item.en} ar={item.ar} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card-premium durations-card">
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ marginBottom: 24 }}><T en="Standard Booking Durations" ar="مدد الحجز القياسية" /></h4>
                <div className="durations-grid">
                  <div className="duration-box"><strong>1</strong><span><T en="HOUR" ar="ساعة" /></span></div>
                  <div className="duration-box"><strong>2</strong><span><T en="HOURS" ar="ساعتين" /></span></div>
                  <div className="duration-box"><strong>3</strong><span><T en="HOURS" ar="ساعات" /></span></div>
                </div>
                <p style={{ marginTop: 24, fontSize: '0.8rem', color: '#666' }}>
                  <T en="Intensive sessions available upon request." ar="جلسات مكثفة متاحة عند الطلب." />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST, SAFETY & REGULATORY POSITIONING */}
      <section className="section-padding bg-darker">
        <div className="container">
          <div className="section-head text-center">
            <h2><T en="Trust & Safety Standards" ar="معايير الثقة والسلامة" /></h2>
            <p className="text-muted"><T en="Professional music learning in a secure, live environment." ar="تعلم موسيقي احترافي في بيئة حية وآمنة." /></p>
          </div>

          <div className="grid grid-3 gap-24">
            <div className="card-premium trust-box">
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>🛡️</div>
              <h3><T en="Verified Instructors" ar="مدربون موثقون" /></h3>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                <T 
                  en="“GearBeat-verified” means we have reviewed an instructor's professional experience and credentials. Note: GearBeat Academy is a private marketplace and does not offer government-accredited certificates or official qualifications."
                  ar="“موثق من جيربيت” يعني أننا قمنا بمراجعة الخبرة المهنية والمؤهلات للمدرب. ملاحظة: أكاديمية جيربيت هي سوق خاص ولا تقدم شهادات معتمدة حكومياً أو مؤهلات رسمية."
                />
              </p>
            </div>
            
            <div className="card-premium trust-box" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>🎥</div>
              <h3><T en="Live Interaction Only" ar="تفاعل حي فقط" /></h3>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                <T 
                  en="Our Academy focuses exclusively on live, synchronous online lessons for real-time feedback. No pre-recorded courses or automated classes are offered in our current MVP."
                  ar="تركز أكاديميتنا حصرياً على الدروس الحية والمباشرة عبر الإنترنت للحصول على تعليقات في الوقت الفعلي. لا يتم تقديم دورات مسجلة مسبقاً أو حصص مؤتمتة في نسختنا الحالية."
                />
              </p>
            </div>

            <div className="card-premium trust-box">
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>👨‍👩‍👧</div>
              <h3><T en="Minor Safety Rules" ar="قواعد سلامة القاصرين" /></h3>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>
                <T 
                  en="Parental approval and supervision are mandatory for students under 18. We maintain strict safeguarding standards for all live video interactions to ensure a safe learning space."
                  ar="موافقة الوالدين والإشراف عليهما إلزاميان للطلاب الذين تقل أعمارهم عن 18 عاماً. نحن نحافظ على معايير حماية صارمة لجميع تفاعلات الفيديو الحية لضمان مساحة تعلم آمنة."
                />
              </p>
            </div>
          </div>
          
          <div className="text-center mt-48">
            <Link href="/legal/academy-policy" className="text-gold" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              <T en="Read Full Academy & Safety Policy" ar="اقرأ سياسة الأكاديمية والسلامة الكاملة" /> →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-padding text-center">
        <div className="container animate-up">
          <div className="card-premium" style={{ padding: '80px 40px', background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.05), transparent)' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 24 }}>
              <T en="Your Creative Evolution Starts Here." ar="تطورك الإبداعي يبدأ من هنا." />
            </h2>
            <p className="text-muted mb-48" style={{ maxWidth: 700, marginInline: 'auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
              <T 
                en="GearBeat Academy is currently in the elite instructor onboarding phase. We are building a global network of verified experts to ensure a world-class learning experience."
                ar="أكاديمية جيربيت حالياً في مرحلة انضمام المدربين النخبة. نحن نبني شبكة عالمية من الخبراء المعتمدين لضمان تجربة تعليمية عالمية المستوى."
              />
            </p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/support" className="btn btn-primary btn-lg shadow-gold">
                <T en="Join Academy" ar="انضم للأكاديمية" />
              </Link>
              <Link href="/support" className="btn btn-outline btn-lg">
                <T en="Become a Partner" ar="انضم كشريك" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .academy-page { background: #000; color: #fff; overflow-x: hidden; }
        .academy-hero { padding: 180px 0 100px; background: radial-gradient(circle at 50% 30%, rgba(201, 162, 77, 0.1) 0%, transparent 70%); }
        .hero-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; margin: 24px 0; letter-spacing: -2px; line-height: 1.1; }
        .hero-title .neon-text { color: var(--gb-gold); text-shadow: 0 0 20px rgba(201, 162, 77, 0.3); }
        .academy-hero .lead { font-size: 1.25rem; color: #888; max-width: 750px; margin-inline: auto; line-height: 1.6; }
        
        .section-padding { padding: 120px 0; }
        .bg-darker { background: #050505; }
        .section-head h2 { font-size: 2.8rem; margin-bottom: 16px; font-weight: 800; }
        
        .structure-list { margin-top: 40px; display: grid; gap: 16px; }
        .structure-item { display: flex; align-items: center; gap: 16px; font-weight: 700; color: #fff; }
        .structure-item .check { color: var(--gb-gold); font-weight: 900; }

        .durations-grid { display: flex; gap: 20px; justify-content: center; }
        .duration-box { 
          width: 80px; padding: 20px 0; background: #000; border: 1px solid #222; border-radius: 12px; 
          display: flex; flex-direction: column; align-items: center; 
        }
        .duration-box strong { font-size: 1.8rem; color: var(--gb-gold); }
        .duration-box span { font-size: 0.6rem; letter-spacing: 1px; font-weight: 800; color: #555; }

        .trust-box { padding: 40px; }
        
        @media (max-width: 1000px) {
          .section-padding { padding: 80px 0; }
          .hero-title { font-size: 3rem; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .grid-4 { grid-template-columns: 1fr; }
          .hero-title { font-size: 2.5rem; }
        }

        [dir="rtl"] .hero-title { letter-spacing: 0; }
        [dir="rtl"] .hero-actions { flex-direction: row-reverse; }
        [dir="rtl"] .structure-item { direction: rtl; }
      `}} />
    </main>
  );
}
