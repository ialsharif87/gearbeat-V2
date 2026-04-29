import Image from "next/image";
import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero card">
        <div className="home-hero-content">
          <div style={{ marginBottom: 22 }}>
            <Image
              src="/brand/logo-horizontal-ai.png"
              alt="GearBeat"
              width={210}
              height={70}
              priority
              style={{
                width: "210px",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          <span className="badge">
            <T
              en="Premium Studio Booking Marketplace"
              ar="منصة فاخرة لحجز الاستوديوهات"
            />
          </span>

          <h1>
            <T
              en="Book the right studio for your next sound."
              ar="احجز الاستوديو المناسب لصوتك القادم."
            />
          </h1>

          <p>
            <T
              en="GearBeat connects artists, producers, podcasters, and creators with trusted music and audio studios across Saudi Arabia and the GCC."
              ar="GearBeat تربط الفنانين، المنتجين، صناع البودكاست، والمبدعين باستوديوهات موسيقية وصوتية موثوقة في السعودية والخليج."
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
              <T en="Verified studio ratings" ar="تقييمات استوديو موثقة" />
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

      <div style={{ height: 34 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Marketplace" ar="الماركت بليس" />
        </span>

        <h1>
          <T
            en="One platform for every creative session."
            ar="منصة واحدة لكل جلسة إبداعية."
          />
        </h1>

        <p>
          <T
            en="From recording and podcasting to rehearsal and production, GearBeat helps creators find, compare, and book the right space with confidence."
            ar="من التسجيل والبودكاست إلى التدريب والإنتاج، GearBeat تساعد المبدعين على البحث، المقارنة، والحجز بثقة."
          />
        </p>
      </div>

      <div className="grid">
        <div className="card home-feature-card">
          <div className="home-feature-icon">🎙️</div>
          <h2>
            <T en="Recording Studios" ar="استوديوهات تسجيل" />
          </h2>
          <p>
            <T
              en="Book premium rooms for vocals, instruments, music production, and full recording sessions."
              ar="احجز غرف فاخرة للتسجيل الصوتي، الآلات، الإنتاج الموسيقي، والجلسات الكاملة."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">🎧</div>
          <h2>
            <T en="Podcast Rooms" ar="غرف بودكاست" />
          </h2>
          <p>
            <T
              en="Find ready-to-record podcast spaces with the right setup, sound treatment, and atmosphere."
              ar="اعثر على غرف بودكاست جاهزة للتسجيل مع التجهيز، العزل، والأجواء المناسبة."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">🥁</div>
          <h2>
            <T en="Rehearsal Spaces" ar="مساحات تدريب" />
          </h2>
          <p>
            <T
              en="Compare rehearsal rooms for bands, artists, and creative teams before booking."
              ar="قارن مساحات التدريب للفرق، الفنانين، والفرق الإبداعية قبل الحجز."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="section-head">
        <span className="badge">
          <T en="How It Works" ar="كيف تعمل المنصة" />
        </span>

        <h1>
          <T
            en="Simple booking. Clear choices. Trusted spaces."
            ar="حجز بسيط. خيارات واضحة. مساحات موثوقة."
          />
        </h1>

        <p>
          <T
            en="GearBeat is built to make studio booking easier for both creators and studio owners."
            ar="GearBeat صُممت لتسهيل حجز الاستوديوهات للمبدعين وأصحاب الاستوديوهات."
          />
        </p>
      </div>

      <div className="grid">
        <div className="card home-feature-card">
          <div className="home-feature-icon">01</div>
          <h2>
            <T en="Discover" ar="اكتشف" />
          </h2>
          <p>
            <T
              en="Browse studios by type, location, features, price, and creative use case."
              ar="تصفح الاستوديوهات حسب النوع، الموقع، المميزات، السعر، والاستخدام الإبداعي."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">02</div>
          <h2>
            <T en="Compare" ar="قارن" />
          </h2>
          <p>
            <T
              en="Review studio details, photos, ratings, rules, and booking information before choosing."
              ar="راجع تفاصيل الاستوديو، الصور، التقييمات، الشروط، ومعلومات الحجز قبل الاختيار."
            />
          </p>
        </div>

        <div className="card home-feature-card">
          <div className="home-feature-icon">03</div>
          <h2>
            <T en="Book" ar="احجز" />
          </h2>
          <p>
            <T
              en="Send your booking request and manage your session through a clear platform flow."
              ar="أرسل طلب الحجز وتابع جلستك من خلال تجربة واضحة داخل المنصة."
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
              en="Find the right room without wasting time."
              ar="اعثر على الغرفة المناسبة بدون تضييع وقت."
            />
          </h2>

          <p>
            <T
              en="Search, compare, and book studios designed for music, voice, podcasting, rehearsal, and production."
              ar="ابحث، قارن، واحجز استوديوهات مخصصة للموسيقى، الصوت، البودكاست، التدريب، والإنتاج."
            />
          </p>

          <div className="home-check-list">
            <span>
              <T en="Premium studio discovery" ar="اكتشاف استوديوهات فاخرة" />
            </span>
            <span>
              <T en="Clear prices and details" ar="أسعار وتفاصيل واضحة" />
            </span>
            <span>
              <T en="Booking-linked reviews" ar="تقييمات مرتبطة بالحجز" />
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
              en="Turn your studio into a bookable business."
              ar="حوّل استوديوك إلى نشاط قابل للحجز."
            />
          </h2>

          <p>
            <T
              en="Create your studio profile, show your rooms, manage booking requests, and improve your visibility."
              ar="أنشئ ملف استوديوك، اعرض غرفك، أدر طلبات الحجز، وحسّن ظهورك."
            />
          </p>

          <div className="home-check-list">
            <span>
              <T en="Studio profile management" ar="إدارة ملف الاستوديو" />
            </span>
            <span>
              <T en="Booking request tracking" ar="متابعة طلبات الحجز" />
            </span>
            <span>
              <T en="Visibility and growth tools" ar="أدوات ظهور ونمو" />
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
              en="Built for real bookings and clear accountability."
              ar="مبنية لحجوزات حقيقية ومسؤولية واضحة."
            />
          </h2>

          <p>
            <T
              en="GearBeat is designed with customer profiles, studio approval flows, booking-linked reviews, admin monitoring, and internal audit logs to support a trusted marketplace."
              ar="GearBeat صُممت بملفات عملاء، موافقات استوديو، تقييمات مرتبطة بالحجز، مراقبة إدارية، وسجل تغييرات داخلي لدعم ماركت بليس موثوق."
            />
          </p>
        </div>

        <div className="trust-points">
          <div>
            <strong>01</strong>
            <span>
              <T en="Studio approval flow" ar="اعتماد الاستوديوهات" />
            </span>
          </div>

          <div>
            <strong>02</strong>
            <span>
              <T en="Customer profile details" ar="بيانات ملف العميل" />
            </span>
          </div>

          <div>
            <strong>03</strong>
            <span>
              <T en="Reviews linked to bookings" ar="تقييمات مرتبطة بالحجوزات" />
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
          <T en="GearBeat Vision" ar="رؤية GearBeat" />
        </span>

        <h2>
          <T
            en="A premium sound-first marketplace for Saudi Arabia and the GCC."
            ar="ماركت بليس فاخر يركز على الصوت في السعودية والخليج."
          />
        </h2>

        <p>
          <T
            en="GearBeat is built to support the creative economy by making professional studio spaces easier to discover, trust, and book."
            ar="GearBeat بُنيت لدعم الاقتصاد الإبداعي من خلال تسهيل اكتشاف الاستوديوهات الاحترافية، الثقة بها، وحجزها."
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
