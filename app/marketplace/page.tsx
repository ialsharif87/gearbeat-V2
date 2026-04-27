import Link from "next/link";
import T from "../../components/t";

const marketplacePillars = [
  {
    icon: "🎙️",
    titleEn: "Recording Studios",
    titleAr: "استوديوهات تسجيل",
    descEn: "Find trusted spaces for vocals, music, podcasts, and voice-over sessions.",
    descAr: "اكتشف مساحات موثوقة للتسجيل، الموسيقى، البودكاست، والتعليق الصوتي."
  },
  {
    icon: "🎧",
    titleEn: "Podcast Rooms",
    titleAr: "غرف بودكاست",
    descEn: "Book ready-to-use podcast rooms with the right setup and atmosphere.",
    descAr: "احجز غرف بودكاست جاهزة بتجهيز مناسب وأجواء احترافية."
  },
  {
    icon: "🥁",
    titleEn: "Rehearsal Spaces",
    titleAr: "مساحات تدريب",
    descEn: "Compare rehearsal spaces for bands, performers, and creative teams.",
    descAr: "قارن مساحات التدريب للفرق، الفنانين، والفرق الإبداعية."
  },
  {
    icon: "🎥",
    titleEn: "Production Rooms",
    titleAr: "غرف إنتاج",
    descEn: "Discover creative spaces for media, content, and production sessions.",
    descAr: "اكتشف مساحات إبداعية للإعلام، المحتوى، وجلسات الإنتاج."
  }
];

const marketplaceSteps = [
  {
    number: "01",
    titleEn: "Explore",
    titleAr: "استكشف",
    descEn: "Discover studios by city, district, price, features, equipment, and ratings.",
    descAr: "اكتشف الاستوديوهات حسب المدينة، الحي، السعر، المميزات، المعدات، والتقييمات."
  },
  {
    number: "02",
    titleEn: "Compare",
    titleAr: "قارن",
    descEn: "Review studio details, equipment, location, verified reviews, and trust signals.",
    descAr: "راجع تفاصيل الاستوديو، المعدات، الموقع، التقييمات الموثقة، وإشارات الثقة."
  },
  {
    number: "03",
    titleEn: "Request Booking",
    titleAr: "اطلب الحجز",
    descEn: "Send a booking request to the studio owner and track the status from your dashboard.",
    descAr: "أرسل طلب الحجز لصاحب الاستوديو وتابع الحالة من لوحة التحكم."
  },
  {
    number: "04",
    titleEn: "Review",
    titleAr: "قيّم",
    descEn: "After a paid booking, leave a verified review to help the creator community.",
    descAr: "بعد الحجز المدفوع، اترك تقييمًا موثقًا لمساعدة مجتمع المبدعين."
  }
];

export default function MarketplacePage() {
  return (
    <section className="marketplace-shell">
      <div className="marketplace-hero">
        <div className="marketplace-hero-content">
          <span className="marketplace-kicker">
            <T en="GearBeat Marketplace" ar="GearBeat Marketplace" />
          </span>

          <h1>
            <T
              en="A premium marketplace for creative studios."
              ar="Marketplace فاخر للاستوديوهات الإبداعية."
            />
          </h1>

          <p>
            <T
              en="Discover, compare, and book trusted music studios, podcast rooms, rehearsal spaces, and production rooms across Saudi Arabia and the GCC."
              ar="اكتشف، قارن، واحجز استوديوهات موسيقية موثوقة، غرف بودكاست، مساحات تدريب، وغرف إنتاج في السعودية والخليج."
            />
          </p>

          <div className="marketplace-hero-actions">
            <Link href="/studios" className="btn">
              <T en="Browse Bookable Studios" ar="تصفح الاستوديوهات المتاحة" />
            </Link>

            <Link href="/signup?account=owner" className="btn btn-secondary">
              <T en="List Your Studio" ar="أضف استوديوك" />
            </Link>
          </div>
        </div>

        <div className="marketplace-hero-panel">
          <div className="marketplace-sound-card">
            <span>LIVE MARKETPLACE</span>
            <h2>GearBeat</h2>
            <p>
              <T
                en="Studios, creators, bookings, reviews, and trust in one connected experience."
                ar="استوديوهات، مبدعين، حجوزات، تقييمات، وثقة في تجربة واحدة مترابطة."
              />
            </p>

            <div className="marketplace-wave" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="marketplace-section">
        <div className="marketplace-section-head">
          <span className="marketplace-kicker">
            <T en="Explore Categories" ar="استكشف التصنيفات" />
          </span>

          <h2>
            <T
              en="Different creative spaces. One booking marketplace."
              ar="مساحات إبداعية مختلفة. Marketplace واحد للحجز."
            />
          </h2>

          <p>
            <T
              en="GearBeat helps creators find the right studio based on the type of session, equipment, location, and trust level."
              ar="GearBeat يساعد المبدعين في العثور على الاستوديو المناسب حسب نوع الجلسة، المعدات، الموقع، ومستوى الثقة."
            />
          </p>
        </div>

        <div className="marketplace-card-grid">
          {marketplacePillars.map((item) => (
            <article className="marketplace-card" key={item.titleEn}>
              <div className="marketplace-card-icon">{item.icon}</div>
              <h3>
                <T en={item.titleEn} ar={item.titleAr} />
              </h3>
              <p>
                <T en={item.descEn} ar={item.descAr} />
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="marketplace-section marketplace-split-section">
        <div>
          <span className="marketplace-kicker">
            <T en="For Creators" ar="للمبدعين" />
          </span>

          <h2>
            <T
              en="Book with confidence, not guesswork."
              ar="احجز بثقة، وليس بالتخمين."
            />
          </h2>

          <p>
            <T
              en="Compare studios by verified status, equipment, pricing, location, and real booking-based reviews."
              ar="قارن الاستوديوهات حسب التوثيق، المعدات، الأسعار، الموقع، والتقييمات المبنية على حجوزات فعلية."
            />
          </p>

          <Link href="/marketplace/creators" className="btn btn-secondary">
            <T en="Learn More for Creators" ar="اعرف أكثر للمبدعين" />
          </Link>
        </div>

        <div>
          <span className="marketplace-kicker">
            <T en="For Studio Owners" ar="لأصحاب الاستوديوهات" />
          </span>

          <h2>
            <T
              en="Turn your studio into a bookable business."
              ar="حوّل استوديوك إلى نشاط قابل للحجز."
            />
          </h2>

          <p>
            <T
              en="List your studio, complete business verification, manage bookings, and build a trusted profile inside GearBeat."
              ar="أضف استوديوك، أكمل التحقق التجاري، أدر الحجوزات، وابنِ ملفًا موثوقًا داخل GearBeat."
            />
          </p>

          <Link href="/marketplace/owners" className="btn btn-secondary">
            <T en="Learn More for Owners" ar="اعرف أكثر للمالكين" />
          </Link>
        </div>
      </div>

      <div className="marketplace-section">
        <div className="marketplace-section-head">
          <span className="marketplace-kicker">
            <T en="How It Works" ar="كيف يعمل" />
          </span>

          <h2>
            <T
              en="A simple journey from discovery to verified review."
              ar="رحلة بسيطة من الاكتشاف إلى التقييم الموثق."
            />
          </h2>
        </div>

        <div className="marketplace-steps">
          {marketplaceSteps.map((step) => (
            <article className="marketplace-step" key={step.number}>
              <span>{step.number}</span>
              <h3>
                <T en={step.titleEn} ar={step.titleAr} />
              </h3>
              <p>
                <T en={step.descEn} ar={step.descAr} />
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="marketplace-final-cta">
        <span className="marketplace-kicker">
          <T en="Start Now" ar="ابدأ الآن" />
        </span>

        <h2>
          <T
            en="Ready to enter the GearBeat creative marketplace?"
            ar="جاهز تدخل GearBeat Marketplace الإبداعي؟"
          />
        </h2>

        <p>
          <T
            en="Creators can browse trusted studios. Studio owners can start building their bookable profile today."
            ar="المبدعون يمكنهم تصفح الاستوديوهات الموثوقة. وأصحاب الاستوديوهات يمكنهم بناء ملفهم القابل للحجز من اليوم."
          />
        </p>

        <div className="marketplace-hero-actions">
          <Link href="/studios" className="btn">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/signup?account=owner" className="btn btn-secondary">
            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>
        </div>
      </div>
    </section>
  );
}
