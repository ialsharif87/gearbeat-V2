import Link from "next/link";
import T from "./t";
import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />

      <div className="footer-cta">
        <div>
          <span className="badge">
            <T en="GearBeat" ar="GearBeat" />
          </span>

          <h2>
            <T
              en="Ready to book your next creative session?"
              ar="جاهز تحجز جلستك الإبداعية القادمة؟"
            />
          </h2>

          <p>
            <T
              en="Find trusted studios, podcast rooms, rehearsal spaces, and production rooms in one smooth booking experience."
              ar="اكتشف استوديوهات موثوقة، غرف بودكاست، مساحات تدريب، وغرف إنتاج من خلال تجربة حجز سهلة وواضحة."
            />
          </p>
        </div>

        <div className="footer-cta-actions">
          <Link href="/studios" className="btn">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/owner" className="btn btn-secondary">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="footer-logo-link">
            <img
              src="/gearbeat-logo.png"
              alt="GearBeat"
              className="footer-logo"
            />
          </Link>

          <p>
            <T
              en="GearBeat connects creators with trusted music studios, podcast rooms, rehearsal spaces, and production rooms."
              ar="GearBeat تربط المبدعين باستوديوهات موسيقية موثوقة، غرف بودكاست، مساحات تدريب، وغرف إنتاج."
            />
          </p>

          <SocialLinks />
        </div>

        <div className="footer-column">
          <h3>
            <T en="For Creators" ar="للمبدعين" />
          </h3>

          <Link href="/studios">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/customer/bookings">
            <T en="My Bookings" ar="حجوزاتي" />
          </Link>

          <Link href="/profile">
            <T en="My Profile" ar="ملفي الشخصي" />
          </Link>

          <Link href="/signup">
            <T en="Create Account" ar="إنشاء حساب" />
          </Link>
        </div>

        <div className="footer-column">
          <h3>
            <T en="For Studios" ar="للاستوديوهات" />
          </h3>

          <Link href="/owner">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>

          <Link href="/owner">
            <T en="Owner Dashboard" ar="لوحة صاحب الاستوديو" />
          </Link>

          <Link href="/owner/bookings">
            <T en="Manage Bookings" ar="إدارة الحجوزات" />
          </Link>

          <Link href="/about">
            <T en="Verified Reviews" ar="التقييمات الموثقة" />
          </Link>
        </div>

        <div className="footer-column">
          <h3>
            <T en="Support" ar="الدعم" />
          </h3>

          <Link href="/support">
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>

          <Link href="/support">
            <T en="Booking Help" ar="مساعدة الحجوزات" />
          </Link>

          <Link href="/support">
            <T en="Account Help" ar="مساعدة الحساب" />
          </Link>

          <Link href="/support">
            <T en="Report a Problem" ar="بلّغ عن مشكلة" />
          </Link>
        </div>

        <div className="footer-column">
          <h3>
            <T en="Company & Legal" ar="الشركة والقانون" />
          </h3>

          <Link href="/about">
            <T en="About Us" ar="من نحن" />
          </Link>

          <Link href="/contact">
            <T en="Contact" ar="تواصل معنا" />
          </Link>

          <Link href="/terms">
            <T en="Terms & Conditions" ar="الشروط والأحكام" />
          </Link>

          <Link href="/privacy">
            <T en="Privacy Policy" ar="سياسة الخصوصية" />
          </Link>

          <Link href="/staff-access" className="team-access-link">
            <T en="Team Access" ar="دخول الفريق" />
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          <T
            en="© 2026 GearBeat. All rights reserved."
            ar="© 2026 GearBeat. جميع الحقوق محفوظة."
          />
        </p>

        <p>
          <T
            en="Built for creators, studios, and the sound community."
            ar="صُممت للمبدعين، الاستوديوهات، ومجتمع الصوت."
          />
        </p>
      </div>
    </footer>
  );
}
