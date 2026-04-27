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
              en="Ready to discover the creative studio marketplace?"
              ar="جاهز تكتشف سوق الاستوديوهات الإبداعية؟"
            />
          </h2>

          <p>
            <T
              en="Explore trusted studios, creative rooms, podcast spaces, rehearsal rooms, and production spaces through a premium marketplace experience."
              ar="اكتشف استوديوهات موثوقة، غرف إبداعية، مساحات بودكاست، غرف تدريب، ومساحات إنتاج من خلال تجربة Marketplace فاخرة."
            />
          </p>
        </div>

        <div className="footer-cta-actions">
          <Link href="/marketplace" className="btn">
            <T en="Explore Marketplace" ar="استكشف Marketplace" />
          </Link>

          <Link href="/studios" className="btn btn-secondary">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/signup?account=owner" className="btn btn-secondary">
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
            <T en="Marketplace" ar="Marketplace" />
          </h3>

          <Link href="/marketplace">
            <T en="Marketplace Home" ar="الرئيسية" />
          </Link>

          <Link href="/marketplace/creators">
            <T en="For Creators" ar="للمبدعين" />
          </Link>

          <Link href="/marketplace/owners">
            <T en="For Studio Owners" ar="لأصحاب الاستوديوهات" />
          </Link>

          <Link href="/marketplace/how-it-works">
            <T en="How It Works" ar="كيف يعمل" />
          </Link>
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

          <Link href="/signup?account=customer">
            <T en="Create Account" ar="إنشاء حساب" />
          </Link>
        </div>

        <div className="footer-column">
          <h3>
            <T en="For Studios" ar="للاستوديوهات" />
          </h3>

          <Link href="/signup?account=owner">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>

          <Link href="/owner">
            <T en="Owner Dashboard" ar="لوحة صاحب الاستوديو" />
          </Link>

          <Link href="/owner/bookings">
            <T en="Manage Bookings" ar="إدارة الحجوزات" />
          </Link>

          <Link href="/marketplace/owners">
            <T en="Owner Benefits" ar="مميزات المالك" />
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
