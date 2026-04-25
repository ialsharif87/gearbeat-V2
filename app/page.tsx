import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero card">
        <div className="home-hero-content">
          <span className="badge">
            <T en="Studio Booking Platform" ar="منصة حجز الاستوديوهات" />
          </span>

          <h1>
            <T
              en="Find the right studio for your next sound."
              ar="اعثر على الاستوديو المناسب لصوتك القادم."
            />
          </h1>

          <p>
            <T
              en="GearBeat connects creators with trusted music studios, podcast rooms, rehearsal spaces, and production rooms through a simple and transparent booking experience."
              ar="GearBeat تربط المبدعين باستوديوهات موسيقية موثوقة، غرف بودكاست، مساحات تدريب، وغرف إنتاج من خلال تجربة حجز سهلة وواضحة."
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

        <div className="home-hero-visual">
          <div className="sound-orb">
            <span />
            <span />
            <span />
          </div>

          <div className="hero-mini-card hero-mini-card-one">
            <strong>4.8 ★</strong>
            <p>
              <T en="Verified reviews" ar="تقييمات موثقة" />
            </p>
          </div>

          <div className="hero-mini-card hero-mini-card-two">
            <strong>24/7</strong>
            <p>
              <T en="Booking visibility" ar="وضوح الحجوزات" />
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Why GearBeat" ar="لماذا GearBeat" />
        </span>

        <h1>
          <T
            en="A smoother way to book creative spaces."
            ar="طريقة أسهل لحجز المساحات الإبداعية."
          />
        </h1>

        <p>
          <T
            en="We focus on trust, clarity, and a better booking flow for creators and studio owners."
            ar="نركز على الثقة، الوضوح، وتجربة حجز أفضل للمبدعين وأصحاب الاستوديوهات."
          />
        </p>
      </div>

      <div className="grid">
        <div className="card home-feature-card">
          <div className="home-feature-icon">🎙️</div>
          <h2>
            <T en="Find the right space" ar="اعثر على المساحة المناسبة" />
          </h2>
          <p>
            <T
              en="Search for music studios, podcast rooms, rehearsal spaces, and production rooms."
              ar="ابحث عن استوديوهات موسيقية، غرف بودكاست، مساحات تدريب، وغرف إنتاج."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">✅</div>
          <h2>
            <T en="Book with confidence" ar="احجز بثقة" />
          </h2>
          <p>
            <T
              en="Clear booking details, customer profiles, verified flows, and transparent reviews."
              ar="تفاصيل حجز واضحة، ملفات عملاء، خطوات موثقة، وتقييمات شفافة."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">⚡</div>
          <h2>
            <T en="Manage from one place" ar="إدارة من مكان واحد" />
          </h2>
          <p>
            <T
              en="Studio owners can manage listings, bookings, reviews, and visibility."
              ar="أصحاب الاستوديوهات يقدرون يديرون القوائم، الحجوزات، التقييمات، والظهور."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="home-split">
        <div className="card">
          <span className="badge">
            <T en="For Creators" ar="للمبدعين" />
          </span>

          <h2>
            <T
              en="Create more. Search less."
              ar="اصنع أكثر. وابحث أقل."
            />
          </h2>

          <p>
            <T
              en="Compare studios, understand what each space offers, book your session, and leave a verified review after your visit."
              ar="قارن الاستوديوهات، افهم ما تقدمه كل مساحة، احجز جلستك، واترك تقييمًا موثقًا بعد زيارتك."
            />
          </p>

          <div className="home-check-list">
            <span>
              <T en="Easy studio discovery" ar="اكتشاف الاستوديوهات بسهولة" />
            </span>
            <span>
              <T en="Clear booking details" ar="تفاصيل حجز واضحة" />
            </span>
            <span>
              <T en="Verified review flow" ar="تقييمات مرتبطة بالحجز" />
            </span>
          </div>

          <Link href="/studios" className="btn">
            <T en="Start Browsing" ar="ابدأ التصفح" />
          </Link>
        </div>

        <div className="card">
          <span className="badge">
            <T en="For Studios" ar="للاستوديوهات" />
          </span>

          <h2>
            <T
              en="Turn your space into a bookable business."
              ar="حوّل مساحتك إلى نشاط قابل للحجز."
            />
          </h2>

          <p>
            <T
              en="List your studio, manage bookings, build trust with reviews, and improve your visibility with a stronger digital presence."
              ar="أضف استوديوك، أدر الحجوزات، ابنِ الثقة بالتقييمات، وحسّن ظهورك الرقمي."
            />
          </p>

          <div className="home-check-list">
            <span>
              <T en="Studio profile management" ar="إدارة ملف الاستوديو" />
            </span>
            <span>
              <T en="Booking monitoring" ar="متابعة الحجوزات" />
            </span>
            <span>
              <T en="Review visibility" ar="إظهار التقييمات" />
            </span>
          </div>

          <Link href="/owner" className="btn btn-secondary">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="card home-trust-card">
        <div>
          <span className="badge">
            <T en="Trust & Safety" ar="الثقة والأمان" />
          </span>

          <h2>
            <T
              en="Built around real bookings and clear accountability."
              ar="مبنية حول حجوزات حقيقية ووضوح في المسؤولية."
            />
          </h2>

          <p>
            <T
              en="GearBeat uses required customer profile details, locked identity information, booking-linked reviews, admin monitoring, and internal audit logs to improve trust across the platform."
              ar="GearBeat تستخدم بيانات العميل الإلزامية، الهوية المقفلة، التقييمات المرتبطة بالحجز، مراقبة الإدارة، وسجل التغييرات الداخلي لرفع مستوى الثقة داخل المنصة."
            />
          </p>
        </div>

        <div className="trust-points">
          <div>
            <strong>01</strong>
            <span>
              <T en="Profile completion required" ar="إكمال الملف إلزامي" />
            </span>
          </div>

          <div>
            <strong>02</strong>
            <span>
              <T en="Identity details locked" ar="بيانات الهوية مقفلة" />
            </span>
          </div>

          <div>
            <strong>03</strong>
            <span>
              <T en="Reviews linked to bookings" ar="التقييمات مرتبطة بالحجوزات" />
            </span>
          </div>

          <div>
            <strong>04</strong>
            <span>
              <T en="Admin audit log" ar="سجل تغييرات إداري" />
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="card home-about-preview">
        <span className="badge">
          <T en="About GearBeat" ar="عن GearBeat" />
        </span>

        <h2>
          <T
            en="A platform for creators, studios, and the sound community."
            ar="منصة للمبدعين، الاستوديوهات، ومجتمع الصوت."
          />
        </h2>

        <p>
          <T
            en="GearBeat is designed to make studio booking simpler, more trusted, and more organized for everyone involved."
            ar="GearBeat صُممت لجعل حجز الاستوديوهات أسهل، أكثر ثقة، وأكثر تنظيمًا لكل الأطراف."
          />
        </p>

        <div className="actions">
          <Link href="/about" className="btn">
            <T en="Learn About GearBeat" ar="اعرف أكثر عن GearBeat" />
          </Link>

          <Link href="/support" className="btn btn-secondary">
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </div>
      </div>
    </section>
  );
}
