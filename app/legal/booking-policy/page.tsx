import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Booking Policy",
  description: "Understand GearBeat's studio booking rules, cancellation policies, and refund procedures for creators and studio owners.",
};

export default function BookingPolicyPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Link href="/legal" className="text-gold" style={{ display: 'inline-block', marginBottom: 32, fontSize: '0.85rem', fontWeight: 600 }}>
        ← <T en="Back to Legal Hub" ar="العودة إلى المركز القانوني" />
      </Link>
      
      <div className="card-premium" style={{ border: '1px dashed rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.02)' }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>
          <T en="Official Policy" ar="سياسة رسمية" />
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>
          <T en="Booking Policy" ar="سياسة الحجز" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Notice:" ar="تنبيه:" /></strong> <T en="This booking policy outlines the standards for studio reservations and cancellations on the GearBeat platform." ar="تحدد سياسة الحجز هذه معايير حجوزات الاستوديو وإلغائها على منصة GearBeat." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Cancellation & Refunds" ar="1. الإلغاء والاسترداد" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="GearBeat supports standardized cancellation windows. Bookings cancelled 48+ hours in advance are eligible for a full refund. Cancellations between 24-48 hours incur a partial penalty. Bookings cancelled less than 24 hours before the session start time are non-refundable." ar="تدعم GearBeat نوافذ إلغاء موحدة. الحجوزات الملغاة قبل 48 ساعة أو أكثر مؤهلة لاسترداد كامل المبلغ. الإلغاء بين 24-48 ساعة يترتب عليه غرامة جزئية. الحجوزات الملغاة قبل أقل من 24 ساعة من موعد بدء الجلسة غير قابلة للاسترداد." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Studio Liability & Damage" ar="2. مسؤولية الاستوديو والتلف" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Creators are liable for any physical damage to studio equipment or premises during their session. Studio owners must provide a damage report within 24 hours of the session end. GearBeat acts as a facilitator and monitor for dispute resolution in these cases." ar="يتحمل المبدعون المسؤولية عن أي تلف مادي لمعدات الاستوديو أو المباني خلال جلستهم. يجب على أصحاب الاستوديوهات تقديم تقرير تلف خلال 24 ساعة من انتهاء الجلسة. تعمل GearBeat كميسر ومراقب لحل النزاعات في هذه الحالات." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="3. Overstaying & Session Time" ar="3. تجاوز الوقت ووقت الجلسة" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Sessions must end promptly at the scheduled time to respect the next booking. Overstaying may result in additional hourly charges at the studio's standard rate plus a platform administrative fee." ar="يجب أن تنتهي الجلسات فوراً في الوقت المحدد لاحترام الحجز التالي. قد يؤدي تجاوز الوقت إلى رسوم إضافية بالساعة بسعر الاستوديو القياسي بالإضافة إلى رسوم إدارية للمنصة." />
          </p>
        </div>
      </div>
    </main>
  );
}
