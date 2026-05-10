import Link from "next/link";
import T from "@/components/t";

export default function BookingPolicyPage() {
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
          <T en="Booking Policy" ar="سياسة الحجز" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This document is a structural placeholder. It is NOT finalized legal text." ar="هذه الوثيقة هي عنصر نائب هيكلي. وهي ليست نصاً قانونياً نهائياً." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Cancellation & Refunds" ar="1. الإلغاء والاسترداد" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder outlining standard 24h/48h cancellation rules, partial refund structures, and no-show penalties for studio bookings." ar="عنصر نائب لمسودة توضح القواعد القياسية للإلغاء خلال 24/48 ساعة، وهياكل الاسترداد الجزئي، وغرامات عدم الحضور لحجوزات الاستوديو." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Studio Liability" ar="2. مسؤولية الاستوديو" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Draft placeholder detailing studio owner rights regarding equipment damage, overstaying time slots, and inappropriate behavior." ar="عنصر نائب لمسودة تفصل حقوق مالك الاستوديو فيما يتعلق بتلف المعدات وتجاوز الخانات الزمنية والسلوك غير اللائق." />
          </p>
        </div>
      </div>
    </main>
  );
}
