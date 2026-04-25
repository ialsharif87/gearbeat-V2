import Link from "next/link";
import T from "../../components/t";

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero card">
        <div className="about-hero-content">
          <span className="badge">
            <T en="About GearBeat" ar="من نحن" />
          </span>

          <h1>
            <T
              en="Built for creators. Designed for studios."
              ar="منصة صُممت للمبدعين وأصحاب الاستوديوهات."
            />
          </h1>

          <p>
            <T
              en="GearBeat connects musicians, podcasters, producers, and creators with trusted studios and creative spaces through a simple, transparent, and secure booking experience."
              ar="GearBeat تربط الموسيقيين، صناع البودكاست، المنتجين، والمبدعين باستوديوهات ومساحات إبداعية موثوقة من خلال تجربة حجز سهلة، واضحة، وآمنة."
            />
          </p>

          <div className="actions">
            <Link href="/studios" className="btn">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>

            <Link href="/support" className="btn btn-secondary">
              <T en="Contact Support" ar="تواصل مع الدعم" />
            </Link>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-sound-card">
            <div className="about-wave">
              {Array.from({ length: 28 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>

            <div className="about-sound-stats">
              <div>
                <strong>01</strong>
                <span>
                  <T en="Creators" ar="مبدعون" />
                </span>
              </div>

              <div>
                <strong>02</strong>
                <span>
                  <T en="Studios" ar="استوديوهات" />
                </span>
              </div>

              <div>
                <strong>03</strong>
                <span>
                  <T en="Trust" ar="ثقة" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="about-mission-grid">
        <div className="card">
          <span className="badge">
            <T en="Our Mission" ar="مهمتنا" />
          </span>

          <h2>
            <T
              en="Make studio booking simple, trusted, and organized."
              ar="نجعل حجز الاستوديوهات أسهل، أوثق، وأكثر تنظيمًا."
            />
          </h2>

          <p>
            <T
              en="We help creators find the right space faster, and help studio owners manage visibility, bookings, reviews, and operations from one place."
              ar="نساعد المبدعين في العثور على المساحة المناسبة بسرعة، ونساعد أصحاب الاستوديوهات في إدارة الظهور، الحجوزات، التقييمات، والعمليات من مكان واحد."
            />
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Our Vision" ar="رؤيتنا" />
          </span>

          <h2>
            <T
              en="A stronger sound community."
              ar="مجتمع صوتي أقوى."
            />
          </h2>

          <p>
            <T
              en="GearBeat is designed to support artists, studios, producers, podcasters, and the wider creative economy."
              ar="GearBeat صُممت لدعم الفنانين، الاستوديوهات، المنتجين، صناع البودكاست، والاقتصاد الإبداعي بشكل أوسع."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="section-head">
        <span className="badge">
          <T en="What We Do" ar="ماذا نقدم" />
        </span>

        <h1>
          <T
            en="One platform for discovery, booking, trust, and operations."
            ar="منصة واحدة للاكتشاف، الحجز، الثقة، والتشغيل."
          />
        </h1>

        <p>
          <T
            en="GearBeat gives creators a better booking journey and gives studio owners tools to manage their business."
            ar="GearBeat تمنح المبدعين تجربة حجز أفضل، وتمنح أصحاب الاستوديوهات أدوات لإدارة أعمالهم."
          />
        </p>
      </div>

      <div className="grid">
        <div className="card about-feature-card">
          <div className="about-feature-icon">🎧</div>
          <h2>
            <T en="Studio Discovery" ar="اكتشاف الاستوديوهات" />
          </h2>
          <p>
            <T
              en="Find spaces based on city, vibe, pricing, equipment, and creative needs."
              ar="اعثر على المساحات حسب المدينة، الأجواء، السعر، المعدات، واحتياجاتك الإبداعية."
            />
          </p>
        </div>

        <div className="card about-feature-card">
          <div className="about-feature-icon">📅</div>
          <h2>
            <T en="Clear Booking Flow" ar="تجربة حجز واضحة" />
          </h2>
          <p>
            <T
              en="A direct flow for bookings, payment status, customer details, and review requests."
              ar="مسار واضح للحجوزات، حالة الدفع، بيانات العميل، وطلبات التقييم."
            />
          </p>
        </div>

        <div className="card about-feature-card">
          <div className="about-feature-icon">⭐</div>
          <h2>
            <T en="Verified Reviews" ar="تقييمات موثقة" />
          </h2>
          <p>
            <T
              en="Reviews are connected to booking activity to improve transparency."
              ar="التقييمات مرتبطة بنشاط الحجز لتحسين الشفافية."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="about-split">
        <div className="card">
          <span className="badge">
            <T en="For Creators" ar="للمبدعين" />
          </span>

          <h2>
            <T
              en="Book with confidence."
              ar="احجز بثقة."
            />
          </h2>

          <p>
            <T
              en="Creators can browse spaces, compare what each studio offers, book sessions, and share feedback after real visits."
              ar="يستطيع المبدعون تصفح المساحات، مقارنة ما يقدمه كل استوديو، حجز الجلسات، ومشاركة تجربتهم بعد زيارات حقيقية."
            />
          </p>

          <div className="about-check-list">
            <span>
              <T en="Trusted studio details" ar="تفاصيل استوديو موثوقة" />
            </span>
            <span>
              <T en="Simple booking journey" ar="رحلة حجز سهلة" />
            </span>
            <span>
              <T en="Post-booking review flow" ar="تقييم بعد انتهاء الحجز" />
            </span>
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="For Studio Owners" ar="لأصحاب الاستوديوهات" />
          </span>

          <h2>
            <T
              en="Manage your studio digitally."
              ar="أدر استوديوك رقميًا."
            />
          </h2>

          <p>
            <T
              en="Studio owners can manage listings, monitor bookings, build trust with reviews, and improve visibility."
              ar="أصحاب الاستوديوهات يستطيعون إدارة القوائم، متابعة الحجوزات، بناء الثقة بالتقييمات، وتحسين الظهور."
            />
          </p>

          <div className="about-check-list">
            <span>
              <T en="Listing management" ar="إدارة القوائم" />
            </span>
            <span>
              <T en="Booking visibility" ar="وضوح الحجوزات" />
            </span>
            <span>
              <T en="Review monitoring" ar="متابعة التقييمات" />
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="card about-trust-card">
        <div>
          <span className="badge">
            <T en="Trust & Safety" ar="الثقة والأمان" />
          </span>

          <h2>
            <T
              en="Built with accountability from day one."
              ar="مبنية على الوضوح والمسؤولية من البداية."
            />
          </h2>

          <p>
            <T
              en="GearBeat uses required customer profiles, locked identity details, booking-linked reviews, internal admin monitoring, and audit logs to protect the booking experience."
              ar="GearBeat تستخدم ملفات عملاء إلزامية، بيانات هوية مقفلة، تقييمات مرتبطة بالحجز، مراقبة إدارية داخلية، وسجلات تغيير لحماية تجربة الحجز."
            />
          </p>
        </div>

        <div className="about-trust-grid">
          <div>
            <strong>01</strong>
            <span>
              <T en="Profile completion" ar="إكمال الملف" />
            </span>
          </div>

          <div>
            <strong>02</strong>
            <span>
              <T en="Locked identity" ar="هوية مقفلة" />
            </span>
          </div>

          <div>
            <strong>03</strong>
            <span>
              <T en="Verified reviews" ar="تقييمات موثقة" />
            </span>
          </div>

          <div>
            <strong>04</strong>
            <span>
              <T en="Admin audit logs" ar="سجل تغييرات" />
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 30 }} />

      <div className="card about-final-cta">
        <span className="badge">
          <T en="Join GearBeat" ar="انضم إلى GearBeat" />
        </span>

        <h2>
          <T
            en="Ready to discover your next studio?"
            ar="جاهز تكتشف استوديوك القادم؟"
          />
        </h2>

        <p>
          <T
            en="Start browsing trusted creative spaces or list your studio today."
            ar="ابدأ بتصفح المساحات الإبداعية الموثوقة أو أضف استوديوك اليوم."
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
