import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Academy Policy | GearBeat",
  description: "Review the GearBeat Academy Policy. Learn about our live lesson model, instructor verification, minor safety standards, and call conduct rules.",
};

export default function AcademyPolicyPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Link href="/legal" className="text-gold" style={{ display: 'inline-block', marginBottom: 32, fontSize: '0.85rem', fontWeight: 600 }}>
        ← <T en="Back to Legal Hub" ar="العودة إلى المركز القانوني" />
      </Link>
      
      <div className="card-premium" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)' }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>
          <T en="Official Academy Standards" ar="معايير الأكاديمية الرسمية" />
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>
          <T en="Academy Policy" ar="سياسة الأكاديمية" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="1. Academy Positioning" ar="1. تموضع الأكاديمية" /></h3>
            <p>
              <T 
                en="GearBeat Academy is a marketplace for live, interactive music and audio learning. We connect students with industry experts for real-time skill development in music production, voice training, audio engineering, and creative arts."
                ar="أكاديمية جيربيت هي سوق لتعلم الموسيقى والصوت بشكل مباشر وتفاعلي. نحن نربط الطلاب بخبراء الصناعة لتطوير المهارات في الوقت الفعلي في الإنتاج الموسيقي، والتدريب الصوتي، والهندسة الصوتية، والفنون الإبداعية."
              />
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="2. Live Lesson Model" ar="2. نموذج الدروس المباشرة" /></h3>
            <p>
              <T 
                en="All Academy sessions are delivered as live, synchronous interactions. GearBeat does not currently offer pre-recorded courses or automated learning paths. The value of our academy lies in direct, real-time mentorship from verified professionals."
                ar="يتم تقديم جميع جلسات الأكاديمية كخيار تفاعلي مباشر ومتزامن. لا تقدم جيربيت حالياً دورات مسجلة مسبقاً أو مسارات تعلم مؤتمتة. تكمن قيمة أكاديميتنا في التوجيه المباشر والوقت الفعلي من محترفين موثقين."
              />
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="3. Instructor Verification" ar="3. توثيق المدربين" /></h3>
            <p>
              <T 
                en="“GearBeat-verified instructors” are individuals whose professional experience, credentials, and identity have been reviewed by the GearBeat internal team. This verification indicates platform trust but does not constitute an endorsement of specific artistic styles or pedagogical outcomes."
                ar="“المدربون الموثقون من جيربيت” هم أفراد تمت مراجعة خبرتهم المهنية ومؤهلاتهم وهويتهم من قبل فريق جيربيت الداخلي. يشير هذا التوثيق إلى الثقة في المنصة ولكنه لا يشكل تأييداً لأنماط فنية معينة أو نتائج تربوية."
              />
            </p>
          </section>

          <section style={{ marginBottom: 32, border: '1px solid rgba(255,0,0,0.2)', padding: 20, borderRadius: 12, background: 'rgba(255,0,0,0.02)' }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="4. Important Regulatory Notice" ar="4. إشعار تنظيمي هام" /></h3>
            <p style={{ marginBottom: 12 }}>
              <T 
                en="GearBeat Academy is a private commercial learning marketplace. We do not claim, and are not currently seeking, government accreditation or official recognition from educational authorities."
                ar="أكاديمية جيربيت هي سوق تعلم تجاري خاص. نحن لا ندعي، ولا نسعى حالياً للحصول على اعتماد حكومي أو اعتراف رسمي من السلطات التعليمية."
              />
            </p>
            <p>
              <T 
                en="Specifically, GearBeat Academy is not accredited by the Ministry of Culture, the Music Commission, the General Entertainment Authority (GEA), or the National eLearning Center (NeLC). No official certificates or government-recognized qualifications are offered."
                ar="تحديداً، أكاديمية جيربيت غير معتمدة من قبل وزارة الثقافة، أو هيئة الموسيقى، أو الهيئة العامة للترفيه (GEA)، أو المركز الوطني للتعليم الإلكتروني (NeLC). لا يتم تقديم شهادات رسمية أو مؤهلات معترف بها حكومياً."
              />
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="5. Minor Safety & Consent" ar="5. سلامة القاصرين والموافقة" /></h3>
            <p style={{ marginBottom: 12 }}>
              <T 
                en="Users must be 18 years of age or older to create an independent student account and book lessons. Students under the age of 18 require explicit parent or legal guardian approval."
                ar="يجب أن يكون عمر المستخدمين 18 عاماً أو أكثر لإنشاء حساب طالب مستقل وحجز الدروس. يتطلب الطلاب الذين تقل أعمارهم عن 18 عاماً موافقة صريحة من الوالدين أو الوصي القانوني."
              />
            </p>
            <p>
              <T 
                en="Parents/guardians are responsible for supervising the student during live video sessions. GearBeat maintains a zero-tolerance policy for inappropriate conduct involving minors, which will result in immediate permanent banning and legal reporting."
                ar="يتحمل الوالدان/الأوصياء مسؤولية الإشراف على الطالب خلال جلسات الفيديو المباشرة. تتبع جيربيت سياسة عدم التسامح مطلقاً مع السلوك غير اللائق الذي ي melibatkan القاصرين، مما سيؤدي إلى حظر دائم فوري وإبلاغ قانوني."
              />
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="6. Video Call & Conduct Rules" ar="6. قواعد مكالمات الفيديو والسلوك" /></h3>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li><T en="Sessions are delivered via third-party tools (e.g., Zoom, Google Meet). Links are only shared after booking confirmation." ar="يتم تقديم الجلسات عبر أدوات طرف ثالث (مثل Zoom، Google Meet). يتم مشاركة الروابط فقط بعد تأكيد الحجز." /></li>
              <li><T en="Professional attire and appropriate background environments are required for both students and instructors." ar="يشترط ارتداء ملابس مهنية وتوفير بيئات خلفية مناسبة لكل من الطلاب والمدربين." /></li>
              <li><T en="Recording of sessions is strictly prohibited unless written consent is provided by both the instructor and student (and guardian, if applicable)." ar="يُمنع منعاً باتاً تسجيل الجلسات ما لم يتم تقديم موافقة خطية من كل من المدرب والطالب (والوصي، إذا كان ذلك ينطبق)." /></li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 style={{ color: '#fff', marginBottom: 12 }}><T en="7. Attendance & Cancellations" ar="7. الحضور والإلغاء" /></h3>
            <p>
              <T 
                en="Rescheduling requests must be made at least 24 hours in advance. No-shows or late cancellations may result in the forfeiture of the session fee. Specific instructor cancellation policies may also apply."
                ar="يجب تقديم طلبات إعادة الجدولة قبل 24 ساعة على الأقل. قد يؤدي عدم الحضور أو الإلغاء المتأخر إلى مصادرة رسوم الجلسة. قد تنطبق أيضاً سياسات إلغاء خاصة بالمدرب."
              />
            </p>
          </section>

          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            <p>
              <T 
                en="Note: GearBeat Academy policies are subject to ongoing regulatory review. This policy was last updated in May 2026." 
                ar="ملاحظة: تخضع سياسات أكاديمية جيربيت للمراجعة التنظيمية المستمرة. تم تحديث هذه السياسة لآخر مرة في مايو 2026." 
              />
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
