import Link from "next/link";
import T from "../../components/t";

export default function SupportPage() {
  return (
    <section className="support-page">
      <div className="support-hero card">
        <div className="support-hero-content">
          <span className="badge">
            <T en="Support Center" ar="مركز الدعم" />
          </span>

          <h1>
            <T en="How can we help?" ar="كيف نقدر نساعدك؟" />
          </h1>

          <p>
            <T
              en="Our support team is here to help with bookings, accounts, payments, studio listings, reviews, and reports."
              ar="فريق الدعم موجود لمساعدتك في الحجوزات، الحسابات، الدفع، قوائم الاستوديوهات، التقييمات، والبلاغات."
            />
          </p>

          <div className="actions">
            <a href="mailto:support@gearbeat.com" className="btn">
              <T en="Email Support" ar="راسل الدعم" />
            </a>

            <Link href="/contact" className="btn btn-secondary">
              <T en="Contact Page" ar="صفحة التواصل" />
            </Link>
          </div>
        </div>

        <div className="support-hero-panel">
          <div className="support-pulse-ring">
            <span />
            <span />
            <span />
            <strong>GB</strong>
          </div>

          <div className="support-status-card">
            <strong>
              <T en="Support Flow" ar="مسار الدعم" />
            </strong>
            <p>
              <T
                en="Tell us what happened, share your booking reference, and our team will review it."
                ar="اشرح لنا ما حدث، أرسل رقم الحجز إن وجد، وسيقوم فريقنا بمراجعته."
              />
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Support Topics" ar="مواضيع الدعم" />
        </span>

        <h1>
          <T
            en="Choose the support area that matches your issue."
            ar="اختر نوع الدعم المناسب لمشكلتك."
          />
        </h1>

        <p>
          <T
            en="This helps us understand the issue faster and route it to the right team."
            ar="هذا يساعدنا نفهم المشكلة أسرع ونوجهها للفريق المناسب."
          />
        </p>
      </div>

      <div className="support-grid">
        <div className="card support-topic-card">
          <div className="support-topic-icon">📅</div>
          <span className="badge">01</span>
          <h2>
            <T en="Booking Support" ar="دعم الحجوزات" />
          </h2>
          <p>
            <T
              en="For booking changes, cancellations, time issues, review links, or booking confirmation questions."
              ar="لتعديل الحجز، الإلغاء، مشاكل الوقت، روابط التقييم، أو أسئلة تأكيد الحجز."
            />
          </p>
          <a href="mailto:support@gearbeat.com?subject=Booking Support" className="support-card-link">
            <T en="Get booking help" ar="احصل على دعم الحجز" />
          </a>
        </div>

        <div className="card support-topic-card">
          <div className="support-topic-icon">👤</div>
          <span className="badge">02</span>
          <h2>
            <T en="Account Support" ar="دعم الحساب" />
          </h2>
          <p>
            <T
              en="For login issues, profile completion, phone number, identity details, or account type questions."
              ar="لمشاكل تسجيل الدخول، إكمال الملف، رقم الجوال، بيانات الهوية، أو نوع الحساب."
            />
          </p>
          <a href="mailto:support@gearbeat.com?subject=Account Support" className="support-card-link">
            <T en="Get account help" ar="احصل على دعم الحساب" />
          </a>
        </div>

        <div className="card support-topic-card">
          <div className="support-topic-icon">🎙️</div>
          <span className="badge">03</span>
          <h2>
            <T en="Studio Support" ar="دعم الاستوديوهات" />
          </h2>
          <p>
            <T
              en="For studio owners who need help with listings, bookings, visibility, verification, or reviews."
              ar="لأصحاب الاستوديوهات الذين يحتاجون مساعدة في القوائم، الحجوزات، الظهور، التوثيق، أو التقييمات."
            />
          </p>
          <a href="mailto:support@gearbeat.com?subject=Studio Support" className="support-card-link">
            <T en="Get studio help" ar="احصل على دعم الاستوديو" />
          </a>
        </div>

        <div className="card support-topic-card">
          <div className="support-topic-icon">⚠️</div>
          <span className="badge">04</span>
          <h2>
            <T en="Report a Problem" ar="بلّغ عن مشكلة" />
          </h2>
          <p>
            <T
              en="Report an unsafe experience, incorrect studio details, payment issue, review concern, or suspicious activity."
              ar="بلّغ عن تجربة غير آمنة، بيانات استوديو غير صحيحة، مشكلة دفع، مشكلة تقييم، أو نشاط مشبوه."
            />
          </p>
          <a href="mailto:support@gearbeat.com?subject=Report a Problem" className="support-card-link">
            <T en="Report now" ar="أرسل بلاغ الآن" />
          </a>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="support-split">
        <div className="card">
          <span className="badge">
            <T en="Before Contacting Support" ar="قبل التواصل مع الدعم" />
          </span>

          <h2>
            <T
              en="Send the right details so we can help faster."
              ar="أرسل التفاصيل الصحيحة حتى نساعدك أسرع."
            />
          </h2>

          <div className="support-check-list">
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
              <T en="A clear explanation of the issue" ar="شرح واضح للمشكلة" />
            </span>
            <span>
              <T en="Screenshots if needed" ar="صور توضيحية إذا لزم" />
            </span>
          </div>
        </div>

        <div className="card support-contact-card">
          <span className="badge">
            <T en="Direct Contact" ar="تواصل مباشر" />
          </span>

          <h2>support@gearbeat.com</h2>

          <p>
            <T
              en="For urgent support, email us with your booking or account details. Our team will review your request."
              ar="للدعم العاجل، راسلنا مع بيانات الحجز أو الحساب. سيقوم فريقنا بمراجعة طلبك."
            />
          </p>

          <div className="support-contact-box">
            <strong>
              <T en="Support hours" ar="أوقات الدعم" />
            </strong>
            <p>
              <T
                en="We aim to respond as soon as possible. Priority is given to active booking and payment issues."
                ar="نسعى للرد بأسرع وقت ممكن. الأولوية لمشاكل الحجوزات النشطة والدفع."
              />
            </p>
          </div>

          <div className="actions">
            <a href="mailto:support@gearbeat.com" className="btn">
              <T en="Email Support" ar="راسل الدعم" />
            </a>

            <Link href="/studios" className="btn btn-secondary">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="card support-trust-card">
        <div>
          <span className="badge">
            <T en="Trust & Safety" ar="الثقة والأمان" />
          </span>

          <h2>
            <T
              en="We take booking trust seriously."
              ar="نأخذ ثقة الحجز بجدية."
            />
          </h2>

          <p>
            <T
              en="GearBeat uses required customer profiles, identity details, booking-linked reviews, admin monitoring, and internal audit logs to help keep the platform safer and more transparent."
              ar="GearBeat تستخدم ملفات العملاء الإلزامية، بيانات الهوية، التقييمات المرتبطة بالحجز، متابعة الإدارة، وسجلات التغيير الداخلية لجعل المنصة أكثر أمانًا وشفافية."
            />
          </p>
        </div>

        <div className="support-trust-grid">
          <div>
            <strong>01</strong>
            <span>
              <T en="Verified profiles" ar="ملفات موثقة" />
            </span>
          </div>

          <div>
            <strong>02</strong>
            <span>
              <T en="Booking-linked reviews" ar="تقييمات مرتبطة بالحجز" />
            </span>
          </div>

          <div>
            <strong>03</strong>
            <span>
              <T en="Admin monitoring" ar="متابعة إدارية" />
            </span>
          </div>

          <div>
            <strong>04</strong>
            <span>
              <T en="Internal audit logs" ar="سجلات تغيير داخلية" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
