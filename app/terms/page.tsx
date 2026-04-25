import T from "../../components/t";

export default function TermsPage() {
  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Legal" ar="قانوني" />
        </span>

        <h1>
          <T en="Terms & Conditions" ar="الشروط والأحكام" />
        </h1>

        <p>
          <T
            en="These terms explain the basic rules for using GearBeat."
            ar="توضح هذه الشروط القواعد الأساسية لاستخدام GearBeat."
          />
        </p>
      </div>

      <div className="card">
        <h2>
          <T en="Use of the Platform" ar="استخدام المنصة" />
        </h2>
        <p>
          <T
            en="Users must provide accurate account, contact, and booking information. GearBeat may restrict access if misuse, fraud, or unsafe activity is detected."
            ar="يجب على المستخدمين تقديم بيانات حساب وتواصل وحجز صحيحة. يحق لـ GearBeat تقييد الوصول عند وجود إساءة استخدام أو احتيال أو نشاط غير آمن."
          />
        </p>

        <h2>
          <T en="Bookings & Payments" ar="الحجوزات والدفع" />
        </h2>
        <p>
          <T
            en="Bookings are subject to studio availability, booking rules, payment status, and cancellation policies."
            ar="تخضع الحجوزات لتوفر الاستوديو، قواعد الحجز، حالة الدفع، وسياسات الإلغاء."
          />
        </p>

        <h2>
          <T en="Reviews" ar="التقييمات" />
        </h2>
        <p>
          <T
            en="Reviews should be honest, respectful, and related to a real booking experience."
            ar="يجب أن تكون التقييمات صادقة، محترمة، ومرتبطة بتجربة حجز حقيقية."
          />
        </p>

        <h2>
          <T en="Identity Details" ar="بيانات الهوية" />
        </h2>
        <p>
          <T
            en="Identity details may be required to improve trust and safety. Once saved, they cannot be changed by the user directly."
            ar="قد تكون بيانات الهوية مطلوبة لتحسين الثقة والأمان. بعد حفظها، لا يمكن للمستخدم تعديلها مباشرة."
          />
        </p>
      </div>
    </section>
  );
}
