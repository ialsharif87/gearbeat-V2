import Link from "next/link";
import T from "../../components/t";

export default function TermsPage() {
  return (
    <main style={{ background: '#080706', minHeight: '100vh', color: '#fff', padding: '120px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{ 
            background: 'rgba(207, 168, 110, 0.1)', 
            color: '#cfa86e', 
            padding: '8px 16px', 
            borderRadius: 99, 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <T en="Official Agreement" ar="الاتفاقية الرسمية" />
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: 24, marginBottom: 16 }}>
            <T en="Terms of Service" ar="شروط الخدمة" />
          </h1>
          <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            <T 
              en="Legal framework governing the GearBeat ecosystem including Studio Bookings, Marketplace Trade, and Professional Services." 
              ar="الإطار القانوني الذي يحكم منظومة جير بيت بما في ذلك حجز الاستوديوهات، تجارة المتجر، والخدمات المهنية."
            />
          </p>
        </header>

        {/* Content Grid */}
        <div style={{ display: 'grid', gap: 40 }}>
          
          <LegalSection 
            number="1"
            titleEn="Marketplace Operations (Shop Gear)"
            titleAr="عمليات المتجر (شراء المعدات)"
            bodyEn="All marketplace sellers must provide authentic products. GearBeat acts as an intermediary, holding payments in escrow until delivery is confirmed. Buyers are protected under our Return and Refund policy for defective items."
            bodyAr="يجب على جميع تجار المتجر تقديم منتجات أصلية. تعمل جير بيت كوسيط، حيث تحتفظ بالمدفوعات في حساب ضمان حتى تأكيد الاستلام. المشترون محميون بموجب سياسة الاسترجاع للمنتجات المعيبة."
          />

          <LegalSection 
            number="2"
            titleEn="Professional Services (Book Services)"
            titleAr="الخدمات المهنية (حجز الخدمات)"
            bodyEn="Service providers (Mix/Master/Production) are bound by the project scope defined in the booking. Milestone payments are released upon customer approval of deliverables. Dispute resolution is managed via GearBeat Arbitration."
            bodyAr="مقدمو الخدمات (ميكس/ماستر/إنتاج) ملزمون بنطاق المشروع المحدد في الحجز. يتم تحرير دفعات المراحل عند موافقة العميل على التسليمات. تتم إدارة حل النزاعات عبر تحكيم جير بيت."
          />

          <LegalSection 
            number="3"
            titleEn="Studio Bookings & Access"
            titleAr="حجوزات الاستوديوهات والدخول"
            bodyEn="Studio bookings are time-locked. Owners must ensure the space is ready as described. Customers must adhere to noise and safety regulations. Cancellations are subject to the specific policy selected by the studio owner."
            bodyAr="حجوزات الاستوديوهات مرتبطة بالوقت. يجب على الملاك ضمان جاهزية المساحة كما هو موصف. يجب على العملاء الالتزام بأنظمة الضوضاء والسلامة. تخضع الإلغاءات للسياسة المحددة من قبل صاحب الاستوديو."
          />

          <LegalSection 
            number="4"
            titleEn="Commission & Payments"
            titleAr="العمولات والمدفوعات"
            bodyEn="GearBeat deducts a standard platform commission (15% default) from every successful transaction. Payouts to providers are processed within 3-7 business days after order/booking completion."
            bodyAr="تقتطع جير بيت عمولة منصة قياسية (15% افتراضي) من كل عملية ناجحة. تتم معالجة المدفوعات للمزودين في غضون 3-7 أيام عمل بعد اكتمال الطلب أو الحجز."
          />

        </div>

        {/* Footer Actions */}
        <footer style={{ marginTop: 80, padding: 40, background: '#111', borderRadius: 24, textAlign: 'center', border: '1px solid #1a1a1a' }}>
          <h3 style={{ marginBottom: 12 }}><T en="Need a Custom Agreement?" ar="تحتاج إلى اتفاقية مخصصة؟" /></h3>
          <p style={{ color: '#666', marginBottom: 24 }}>
            <T en="Enterprise partners can request modified terms for large-scale operations." ar="يمكن لشركاء الشركات طلب شروط معدلة للعمليات واسعة النطاق." />
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/contact" style={{ padding: '12px 24px', background: '#cfa86e', color: '#000', textDecoration: 'none', borderRadius: 12, fontWeight: 700 }}>
              <T en="Contact Legal Team" ar="تواصل مع الفريق القانوني" />
            </Link>
            <Link href="/privacy" style={{ padding: '12px 24px', border: '1px solid #333', color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700 }}>
              <T en="Privacy Policy" ar="سياسة الخصوصية" />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function LegalSection({ number, titleEn, titleAr, bodyEn, bodyAr }: any) {
  return (
    <section style={{ 
      background: 'rgba(255,255,255,0.02)', 
      padding: 40, 
      borderRadius: 24, 
      border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: -20, 
        left: -10, 
        fontSize: '8rem', 
        fontWeight: 900, 
        color: 'rgba(207, 168, 110, 0.03)',
        zIndex: 0
      }}>
        {number}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cfa86e', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>{titleEn}</span>
          <span style={{ fontFamily: 'var(--font-ar)' }}>{titleAr}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <p style={{ color: '#888', lineHeight: 1.6, fontSize: '1rem' }}>{bodyEn}</p>
          <p style={{ color: '#888', lineHeight: 1.6, fontSize: '1rem', textAlign: 'right', direction: 'rtl' }}>{bodyAr}</p>
        </div>
      </div>
    </section>
  );
}
