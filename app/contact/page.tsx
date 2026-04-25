import Link from "next/link";
import T from "../../components/t";

export default function ContactPage() {
  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Contact" ar="تواصل معنا" />
        </span>

        <h1>
          <T en="Get in touch with GearBeat" ar="تواصل مع GearBeat" />
        </h1>

        <p>
          <T
            en="For support, partnerships, studio onboarding, or general inquiries."
            ar="للدعم، الشراكات، إضافة الاستوديوهات، أو الاستفسارات العامة."
          />
        </p>
      </div>

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Support" ar="الدعم" />
          </span>

          <h2>support@gearbeat.com</h2>

          <p>
            <T
              en="For booking, account, payment, or review issues."
              ar="لمشاكل الحجوزات، الحساب، الدفع، أو التقييمات."
            />
          </p>

          <a href="mailto:support@gearbeat.com" className="btn">
            <T en="Email Support" ar="راسل الدعم" />
          </a>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Business" ar="الأعمال" />
          </span>

          <h2>hello@gearbeat.com</h2>

          <p>
            <T
              en="For partnerships, studio onboarding, and business inquiries."
              ar="للشراكات، إضافة الاستوديوهات، والاستفسارات التجارية."
            />
          </p>

          <a href="mailto:hello@gearbeat.com" className="btn btn-secondary">
            <T en="Contact GearBeat" ar="تواصل مع GearBeat" />
          </a>
        </div>
      </div>

      <div className="actions">
        <Link href="/support" className="btn">
          <T en="Support Page" ar="صفحة الدعم" />
        </Link>

        <Link href="/about" className="btn btn-secondary">
          <T en="About GearBeat" ar="عن GearBeat" />
        </Link>
      </div>
    </section>
  );
}
