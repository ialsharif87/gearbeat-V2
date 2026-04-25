import Link from "next/link";
import T from "../../components/t";

export default function SupportPage() {
  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Support" ar="الدعم" />
        </span>

        <h1>
          <T en="How can we help?" ar="كيف نقدر نساعدك؟" />
        </h1>

        <p>
          <T
            en="Our support team can help with bookings, accounts, studio listings, payments, and reports."
            ar="فريق الدعم يساعدك في الحجوزات، الحسابات، الاستوديوهات، الدفع، والبلاغات."
          />
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <span className="badge">01</span>
          <h2>
            <T en="Booking Support" ar="دعم الحجوزات" />
          </h2>
          <p>
            <T
              en="Need help with booking changes, cancellations, payment status, or review links?"
              ar="تحتاج مساعدة في تعديل الحجز، الإلغاء، حالة الدفع، أو رابط التقييم؟"
            />
          </p>
        </div>

        <div className="card">
          <span className="badge">02</span>
          <h2>
            <T en="Account Support" ar="دعم الحساب" />
          </h2>
          <p>
            <T
              en="Get help with login, profile details, phone number, or identity details."
              ar="احصل على مساعدة في تسجيل الدخول، بيانات الملف، رقم الجوال، أو بيانات الهوية."
            />
          </p>
        </div>

        <div className="card">
          <span className="badge">03</span>
          <h2>
            <T en="Studio Support" ar="دعم الاستوديوهات" />
          </h2>
          <p>
            <T
              en="For studio owners who need help with listings, bookings, visibility, or reviews."
              ar="لأصحاب الاستوديوهات الذين يحتاجون مساعدة في القوائم، الحجوزات، الظهور، أو التقييمات."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Contact Support" ar="تواصل مع الدعم" />
        </span>

        <h2>support@gearbeat.com</h2>

        <p>
          <T
            en="Send us your name, booking reference if available, and a short explanation of the issue."
            ar="أرسل اسمك، رقم الحجز إن وجد، وشرح مختصر للمشكلة."
          />
        </p>

        <div className="actions">
          <a href="mailto:support@gearbeat.com" className="btn">
            <T en="Email Support" ar="راسل الدعم" />
          </a>

          <Link href="/" className="btn btn-secondary">
            <T en="Back to Home" ar="العودة للرئيسية" />
          </Link>
        </div>
      </div>
    </section>
  );
}
