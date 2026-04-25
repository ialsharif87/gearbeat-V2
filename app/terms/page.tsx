import Link from "next/link";
import T from "../../components/t";

export default function TermsPage() {
  return (
    <section className="legal-page">
      <div className="legal-hero card">
        <span className="badge">
          <T en="Legal" ar="قانوني" />
        </span>

        <h1>
          <T en="Terms & Conditions" ar="الشروط والأحكام" />
        </h1>

        <p>
          <T
            en="These terms explain the basic rules for using GearBeat as a customer, studio owner, or visitor."
            ar="توضح هذه الشروط القواعد الأساسية لاستخدام GearBeat كعميل، صاحب استوديو، أو زائر."
          />
        </p>

        <div className="actions">
          <Link href="/privacy" className="btn">
            <T en="Privacy Policy" ar="سياسة الخصوصية" />
          </Link>

          <Link href="/support" className="btn btn-secondary">
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="legal-grid">
        <div className="card legal-nav-card">
          <span className="badge">
            <T en="Summary" ar="ملخص" />
          </span>

          <h2>
            <T en="Key points" ar="النقاط الأساسية" />
          </h2>

          <div className="legal-mini-list">
            <span>
              <T en="Use accurate account details" ar="استخدم بيانات حساب صحيحة" />
            </span>
            <span>
              <T en="Bookings depend on availability" ar="الحجوزات تعتمد على التوفر" />
            </span>
            <span>
              <T en="Reviews must be honest" ar="التقييمات يجب أن تكون صادقة" />
            </span>
            <span>
              <T en="Identity details may be required" ar="قد تكون بيانات الهوية مطلوبة" />
            </span>
            <span>
              <T en="Misuse may lead to restrictions" ar="إساءة الاستخدام قد تؤدي إلى تقييد الحساب" />
            </span>
          </div>
        </div>

        <div className="card legal-content-card">
          <div className="legal-section">
            <h2>
              <T en="1. Use of the Platform" ar="1. استخدام المنصة" />
            </h2>
            <p>
              <T
                en="Users must provide accurate account, contact, and booking information. GearBeat may restrict access if misuse, fraud, unsafe activity, or policy violations are detected."
                ar="يجب على المستخدمين تقديم بيانات حساب وتواصل وحجز صحيحة. يحق لـ GearBeat تقييد الوصول عند وجود إساءة استخدام، احتيال، نشاط غير آمن، أو مخالفة للسياسات."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="2. Bookings & Availability" ar="2. الحجوزات والتوفر" />
            </h2>
            <p>
              <T
                en="Bookings are subject to studio availability, booking rules, payment status, and cancellation policies. A booking may require confirmation or payment before it is considered final."
                ar="تخضع الحجوزات لتوفر الاستوديو، قواعد الحجز، حالة الدفع، وسياسات الإلغاء. قد يحتاج الحجز إلى تأكيد أو دفع قبل اعتباره نهائيًا."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="3. Payments, Cancellations & Refunds" ar="3. الدفع والإلغاء والاسترجاع" />
            </h2>
            <p>
              <T
                en="Payment, cancellation, and refund handling may depend on the studio rules, booking status, and payment provider. GearBeat may help review disputes, but final outcomes depend on the applicable policy."
                ar="قد تعتمد معالجة الدفع، الإلغاء، والاسترجاع على قواعد الاستوديو، حالة الحجز، ومزود الدفع. قد تساعد GearBeat في مراجعة النزاعات، لكن النتيجة النهائية تعتمد على السياسة المطبقة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="4. Customer Responsibilities" ar="4. مسؤوليات العميل" />
            </h2>
            <p>
              <T
                en="Customers are responsible for arriving on time, respecting studio rules, using the space properly, and providing accurate profile, contact, and identity details when required."
                ar="يتحمل العملاء مسؤولية الحضور في الوقت المحدد، احترام قواعد الاستوديو، استخدام المساحة بشكل مناسب، وتقديم بيانات ملف وتواصل وهوية صحيحة عند الطلب."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="5. Studio Owner Responsibilities" ar="5. مسؤوليات صاحب الاستوديو" />
            </h2>
            <p>
              <T
                en="Studio owners are responsible for keeping listing details accurate, honoring confirmed bookings, maintaining safe spaces, and managing their availability, pricing, and customer experience."
                ar="يتحمل أصحاب الاستوديوهات مسؤولية تحديث بيانات القائمة بدقة، احترام الحجوزات المؤكدة، الحفاظ على مساحة آمنة، وإدارة التوفر والأسعار وتجربة العميل."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="6. Reviews" ar="6. التقييمات" />
            </h2>
            <p>
              <T
                en="Reviews should be honest, respectful, and related to a real booking experience. GearBeat may hide, flag, or remove reviews that are abusive, misleading, irrelevant, or unsafe."
                ar="يجب أن تكون التقييمات صادقة، محترمة، ومرتبطة بتجربة حجز حقيقية. يحق لـ GearBeat إخفاء أو تعليم أو إزالة التقييمات المسيئة، المضللة، غير المرتبطة، أو غير الآمنة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="7. Identity Details" ar="7. بيانات الهوية" />
            </h2>
            <p>
              <T
                en="Identity details may be required to improve trust and safety. Once saved, they cannot be changed by the user directly and may only be reviewed through authorized support or admin processes."
                ar="قد تكون بيانات الهوية مطلوبة لتحسين الثقة والأمان. بعد حفظها، لا يمكن للمستخدم تعديلها مباشرة، وقد تتم مراجعتها فقط من خلال الدعم أو إجراءات الإدارة المصرح بها."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="8. Platform Rights" ar="8. حقوق المنصة" />
            </h2>
            <p>
              <T
                en="GearBeat may update platform features, review listings, restrict unsafe accounts, suspend studios, monitor bookings, and maintain internal audit logs to protect the platform."
                ar="يحق لـ GearBeat تحديث خصائص المنصة، مراجعة القوائم، تقييد الحسابات غير الآمنة، إيقاف الاستوديوهات، متابعة الحجوزات، والاحتفاظ بسجلات تغييرات داخلية لحماية المنصة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="9. Contact" ar="9. التواصل" />
            </h2>
            <p>
              <T
                en="For questions about these terms, contact GearBeat support."
                ar="لأي أسئلة حول هذه الشروط، تواصل مع دعم GearBeat."
              />
            </p>

            <a href="mailto:support@gearbeat.com" className="btn btn-secondary">
              support@gearbeat.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
