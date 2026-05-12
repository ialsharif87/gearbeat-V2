import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Marketplace Policy",
  description: "Review the GearBeat Marketplace Policy. Learn about buyer protections, seller obligations, and gear verification standards.",
};

export default function MarketplacePolicyPage() {
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
          <T en="Marketplace Policy" ar="سياسة السوق" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This marketplace policy is a structural draft. It is NOT finalized and is pending review by the GearBeat logistics and legal team." ar="سياسة السوق هذه هي مسودة هيكلية. وهي ليست نهائية وبانتظار المراجعة من قبل فريق اللوجستيات والقانون في GearBeat." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Buyer Protection & Disputes" ar="1. حماية المشتري والنزاعات" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="GearBeat ensures that gear is described accurately by vendors. If an item arrives damaged or is significantly not as described, buyers can initiate a dispute within 3 business days of delivery. GearBeat will mediate to resolve through replacement or refund." ar="تضمن GearBeat وصف المعدات بدقة من قبل التجار. إذا وصل عنصر تالفاً أو كان مختلفاً بشكل كبير عما تم وصفه، يمكن للمشترين بدء نزاع في غضون 3 أيام عمل من التسليم. ستقوم GearBeat بالوساطة للحل من خلال الاستبدال أو الاسترداد." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Seller Obligations & Fulfillment" ar="2. التزامات البائع والتنفيذ" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Vendors must ship orders within 48 hours of confirmation. All gear must be authentic; the listing of counterfeit or stolen equipment is strictly prohibited and will lead to immediate account termination and legal reporting." ar="يجب على التجار شحن الطلبات في غضون 48 ساعة من التأكيد. يجب أن تكون جميع المعدات أصلية؛ يمنع منعاً باتاً إدراج معدات مقلدة أو مسروقة وسيؤدي ذلك إلى إنهاء الحساب فوراً والإبلاغ القانوني." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="3. Returns & Payouts" ar="3. المرتجعات والمدفوعات" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Standard return windows apply for new gear according to local consumer protection laws. Payouts to sellers are held in escrow until the dispute window passes to ensure platform trust and buyer safety." ar="تطبق نوافذ الإرجاع القياسية للمعدات الجديدة وفقاً لقوانين حماية المستهلك المحلية. يتم الاحتفاظ بالمدفوعات للبائعين في حساب ضمان (Escrow) حتى انتهاء نافذة النزاع لضمان الثقة في المنصة وسلامة المشتري." />
          </p>
        </div>
      </div>
    </main>
  );
}
