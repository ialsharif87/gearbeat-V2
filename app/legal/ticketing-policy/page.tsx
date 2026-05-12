import Link from "next/link";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Ticketing Policy",
  description: "Read the GearBeat Ticketing Policy. Understand ticket validity, event entry requirements, and cancellation rules.",
};

export default function TicketingPolicyPage() {
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
          <T en="Ticketing Policy" ar="سياسة التذاكر" />
        </h1>
        
        <div style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>
            <strong><T en="Disclaimer:" ar="إخلاء مسؤولية:" /></strong> <T en="This ticketing policy is a structural draft. It is NOT finalized and is pending review by event organizers and legal counsel." ar="سياسة التذاكر هذه هي مسودة هيكلية. وهي ليست نهائية وبانتظار المراجعة من قبل منظمي الفعاليات والمستشار القانوني." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="1. Non-Transferable Tickets & ID" ar="1. تذاكر غير قابلة للتحويل والهوية" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="To prevent fraud, GearBeat digital tickets are non-transferable unless specified otherwise for a specific event. Buyers may be required to present a matching ID at the door. Unauthorized reselling is strictly prohibited and will void the ticket." ar="لمنع الاحتيال، تذاكر GearBeat الرقمية غير قابلة للتحويل ما لم ينص على خلاف ذلك لفعالية محددة. قد يُطلب من المشترين تقديم هوية مطابقة عند الباب. يمنع منعاً باتاً إعادة البيع غير المصرح بها وسيؤدي ذلك إلى إلغاء التذكرة." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="2. Event Cancellation & Postponement" ar="2. إلغاء الفعالية وتأجيلها" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="If an event is canceled by the organizer, automatic refunds will be processed via GearBeat. In case of postponement, tickets remain valid for the new date. Refunds for postponement are at the discretion of the event organizer." ar="إذا تم إلغاء فعالية من قبل المنظم، فسيتم معالجة المبالغ المستردة تلقائياً عبر GearBeat. في حالة التأجيل، تظل التذاكر صالحة للتاريخ الجديد. المبالغ المستردة للتأجيل تكون وفقاً لتقدير منظم الفعالية." />
          </p>

          <h3 style={{ color: '#fff', marginTop: 32, marginBottom: 16 }}><T en="3. Entry Rules & Security" ar="3. قواعد الدخول والأمن" /></h3>
          <p style={{ marginBottom: 16 }}>
            <T en="Organizers reserve the right to refuse entry for security reasons or violation of event-specific rules. GearBeat is not responsible for entry denials related to behavior or prohibited items." ar="يحتفظ المنظمون بالحق في رفض الدخول لأسباب أمنية أو انتهاك القواعد الخاصة بالفعالية. GearBeat ليست مسؤولة عن حالات رفض الدخول المتعلقة بالسلوك أو المواد المحظورة." />
          </p>
        </div>
      </div>
    </main>
  );
}
