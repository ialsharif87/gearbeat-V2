import Link from "next/link";
import T from "../../components/t";

export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-hero card">
        <div className="contact-hero-content">
          <span className="badge">
            <T en="Contact GearBeat" ar="تواصل مع GearBeat" />
          </span>

          <h1>
            <T
              en="Let’s connect creators, studios, and sound."
              ar="خلينا نربط المبدعين، الاستوديوهات، والصوت."
            />
          </h1>

          <p>
            <T
              en="Reach out for support, partnerships, studio onboarding, business inquiries, or platform feedback."
              ar="تواصل معنا للدعم، الشراكات، إضافة الاستوديوهات، الاستفسارات التجارية، أو ملاحظات المنصة."
            />
          </p>

          <div className="actions">
            <a href="mailto:support@gearbeat.com" className="btn">
              <T en="Email Support" ar="راسل الدعم" />
            </a>

            <a href="mailto:hello@gearbeat.com" className="btn btn-secondary">
              <T en="Business Inquiry" ar="استفسار تجاري" />
            </a>
          </div>
        </div>

        <div className="contact-visual-card">
          <div className="contact-orb">
            <span />
            <span />
            <span />
            <strong>@</strong>
          </div>

          <div className="contact-floating-card">
            <strong>
              <T en="Fast route" ar="وصول أسرع" />
            </strong>
            <p>
              <T
                en="Choose the right contact path so we can help faster."
                ar="اختر طريقة التواصل المناسبة حتى نقدر نساعدك أسرع."
              />
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="contact-grid">
        <div className="card contact-card">
          <div className="contact-icon">🎧</div>

          <span className="badge">
            <T en="Support" ar="الدعم" />
          </span>

          <h2>support@gearbeat.com</h2>

          <p>
            <T
              en="For booking issues, account access, payment status, profile details, reviews, and reports."
              ar="لمشاكل الحجوزات، دخول الحساب، حالة الدفع، بيانات الملف، التقييمات، والبلاغات."
            />
          </p>

          <a href="mailto:support@gearbeat.com" className="btn">
            <T en="Email Support" ar="راسل الدعم" />
          </a>
        </div>

        <div className="card contact-card">
          <div className="contact-icon">🤝</div>

          <span className="badge">
            <T en="Business" ar="الأعمال" />
          </span>

          <h2>hello@gearbeat.com</h2>

          <p>
            <T
              en="For partnerships, studio onboarding, brand collaborations, and general business inquiries."
              ar="للشراكات، إضافة الاستوديوهات، التعاون مع العلامات، والاستفسارات التجارية العامة."
            />
          </p>

          <a href="mailto:hello@gearbeat.com" className="btn btn-secondary">
            <T en="Contact Business Team" ar="تواصل مع فريق الأعمال" />
          </a>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="contact-split">
        <div className="card">
          <span className="badge">
            <T en="Choose the right path" ar="اختر المسار المناسب" />
          </span>

          <h2>
            <T
              en="What should you include?"
              ar="ماذا يجب أن ترسل؟"
            />
          </h2>

          <div className="contact-check-list">
            <span>
              <T en="Your full name" ar="اسمك الكامل" />
            </span>
            <span>
              <T en="Your account email" ar="إيميل الحساب" />
            </span>
            <span>
              <T en="Booking reference if available" ar="رقم الحجز إن وجد" />
            </span>
            <span>
              <T en="Studio name if related" ar="اسم الاستوديو إذا كان الموضوع متعلقًا به" />
            </span>
            <span>
              <T en="Clear explanation of the request" ar="شرح واضح للطلب" />
            </span>
          </div>
        </div>

        <div className="card contact-social-card">
          <span className="badge">
            <T en="Social Media" ar="وسائل التواصل" />
          </span>

          <h2>
            <T en="Follow GearBeat" ar="تابع GearBeat" />
          </h2>

          <p>
            <T
              en="Follow us for platform updates, featured studios, creator stories, and new launches."
              ar="تابعنا لتحديثات المنصة، الاستوديوهات المميزة، قصص المبدعين، والإطلاقات الجديدة."
            />
          </p>

          <div className="contact-socials">
            <a href="#" aria-label="Instagram">
              <strong>IG</strong>
              <span>Instagram</span>
            </a>

            <a href="#" aria-label="TikTok">
              <strong>TT</strong>
              <span>TikTok</span>
            </a>

            <a href="#" aria-label="X">
              <strong>X</strong>
              <span>X</span>
            </a>

            <a href="#" aria-label="YouTube">
              <strong>YT</strong>
              <span>YouTube</span>
            </a>

            <a href="#" aria-label="LinkedIn">
              <strong>IN</strong>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="card contact-quick-links">
        <div>
          <span className="badge">
            <T en="Quick Links" ar="روابط سريعة" />
          </span>

          <h2>
            <T
              en="Need something specific?"
              ar="تحتاج شيء محدد؟"
            />
          </h2>

          <p>
            <T
              en="Use these links to reach the right page faster."
              ar="استخدم هذه الروابط للوصول للصفحة المناسبة بسرعة."
            />
          </p>
        </div>

        <div className="contact-link-grid">
          <Link href="/support">
            <strong>
              <T en="Support Center" ar="مركز الدعم" />
            </strong>
            <span>
              <T en="Bookings, accounts, reports" ar="الحجوزات، الحسابات، البلاغات" />
            </span>
          </Link>

          <Link href="/about">
            <strong>
              <T en="About GearBeat" ar="عن GearBeat" />
            </strong>
            <span>
              <T en="Mission and platform story" ar="المهمة وقصة المنصة" />
            </span>
          </Link>

          <Link href="/terms">
            <strong>
              <T en="Terms & Conditions" ar="الشروط والأحكام" />
            </strong>
            <span>
              <T en="Platform rules" ar="قواعد المنصة" />
            </span>
          </Link>

          <Link href="/privacy">
            <strong>
              <T en="Privacy Policy" ar="سياسة الخصوصية" />
            </strong>
            <span>
              <T en="Data and privacy" ar="البيانات والخصوصية" />
            </span>
          </Link>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="card contact-final-cta">
        <span className="badge">
          <T en="Start with GearBeat" ar="ابدأ مع GearBeat" />
        </span>

        <h2>
          <T
            en="Ready to find your next studio?"
            ar="جاهز تلاقي استوديوك القادم؟"
          />
        </h2>

        <p>
          <T
            en="Browse creative spaces or list your studio and start building your digital presence."
            ar="تصفح المساحات الإبداعية أو أضف استوديوك وابدأ ببناء حضورك الرقمي."
          />
        </p>

        <div className="actions">
          <Link href="/studios" className="btn">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/owner" className="btn btn-secondary">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>
        </div>
      </div>
    </section>
  );
}
