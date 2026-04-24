import Link from "next/link";
import T from "../components/t";

function Waveform() {
  return (
    <div className="waveform" aria-hidden="true">
      {Array.from({ length: 36 }).map((_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge">
              <T
                en="Premium Music Studio Marketplace"
                ar="منصة فاخرة لحجز الاستوديوهات الموسيقية"
              />
            </span>

            <h1 className="glow-title">
              <T en="Find Your Perfect" ar="اعثر على" />{" "}
              <span className="neon-text">
                <T en="Sound Space" ar="مساحتك الصوتية المثالية" />
              </span>
            </h1>

            <p>
              <T
                en="Book recording studios, podcast rooms, rehearsal spaces, and production rooms with a premium music-tech experience built for creators, artists, and studio owners."
                ar="احجز استوديوهات التسجيل، غرف البودكاست، مساحات التدريب، وغرف الإنتاج من خلال تجربة فاخرة مخصصة للمبدعين والفنانين وأصحاب الاستوديوهات."
              />
            </p>

            <div className="visual-search">
              <span>
                <T
                  en="Advanced search for studios, city, vibe, or price..."
                  ar="ابحث عن الاستوديو، المدينة، الأجواء، أو السعر..."
                />
              </span>
              <span className="search-icon">⌕</span>
            </div>

            <div className="actions">
              <Link href="/studios" className="btn">
                <T en="Book Your Next Studio" ar="احجز استوديوك القادم" />
              </Link>

              <Link href="/signup" className="btn btn-secondary">
                <T en="Join GearBeat" ar="انضم إلى GearBeat" />
              </Link>
            </div>
          </div>

          <div className="card wave-card">
            <span className="badge">
              <T en="Live Studio Pulse" ar="نبض الاستوديو المباشر" />
            </span>

            <h2>
              <T
                en="Creator demand is moving fast."
                ar="طلب المبدعين يتحرك بسرعة."
              />
            </h2>

            <p>
              <T
                en="Track bookings, studio activity, payment status, and owner confirmations from one clean marketplace flow."
                ar="تابع الحجوزات، نشاط الاستوديو، حالة الدفع، وموافقات المالك من خلال مسار واضح واحد."
              />
            </p>

            <Waveform />

            <div className="stats-row">
              <div className="stat">
                <b>24/7</b>
                <span>
                  <T en="Booking access" ar="إتاحة الحجز" />
                </span>
              </div>

              <div className="stat">
                <b>3</b>
                <span>
                  <T en="User roles" ar="أنواع مستخدمين" />
                </span>
              </div>

              <div className="stat">
                <b>Live</b>
                <span>
                  <T en="Supabase data" ar="بيانات مباشرة" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-grid">
        <div className="section-head">
          <span className="badge">
            <T en="Featured Experience" ar="تجربة مميزة" />
          </span>

          <h1>
            <T en="Built for music spaces." ar="مصمم للمساحات الموسيقية." />
          </h1>

          <p>
            <T
              en="GearBeat connects customers and studio owners in one booking flow: discover, request, confirm, and pay."
              ar="GearBeat يربط العملاء وأصحاب الاستوديوهات في مسار حجز واحد: استكشاف، طلب، تأكيد، ودفع."
            />
          </p>
        </div>

        <div className="grid">
          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"
                alt="Recording studio"
              />
            </div>

            <h2>
              <T en="The Echo Chamber" ar="غرفة الصدى" />
            </h2>

            <p>
              <T
                en="Premium recording room with neon ambience and studio-grade gear."
                ar="غرفة تسجيل فاخرة بأجواء نيون ومعدات احترافية."
              />
            </p>

            <p>
              <T en="Price:" ar="السعر:" />{" "}
              <strong>
                <T en="From 250 SAR" ar="من 250 ريال" />
              </strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              <T en="View Details" ar="عرض التفاصيل" />
            </Link>
          </article>

          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0"
                alt="Music production room"
              />
            </div>

            <h2>
              <T en="Producer Suite" ar="جناح المنتج" />
            </h2>

            <p>
              <T
                en="Creative production space for artists, producers, and writers."
                ar="مساحة إنتاج إبداعية للفنانين والمنتجين والكتّاب."
              />
            </p>

            <p>
              <T en="Price:" ar="السعر:" />{" "}
              <strong>
                <T en="From 300 SAR" ar="من 300 ريال" />
              </strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              <T en="View Details" ar="عرض التفاصيل" />
            </Link>
          </article>

          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81"
                alt="Podcast studio"
              />
            </div>

            <h2>
              <T en="Podcast Lab" ar="مختبر البودكاست" />
            </h2>

            <p>
              <T
                en="Clean spoken-word studio for podcasts, interviews, and content."
                ar="استوديو واضح ومجهز للبودكاست والمقابلات وصناعة المحتوى."
              />
            </p>

            <p>
              <T en="Price:" ar="السعر:" />{" "}
              <strong>
                <T en="From 180 SAR" ar="من 180 ريال" />
              </strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              <T en="View Details" ar="عرض التفاصيل" />
            </Link>
          </article>
        </div>
      </section>

      <section className="pulse-panel">
        <div className="card">
          <span className="badge">
            <T en="For Customers" ar="للعملاء" />
          </span>

          <h2>
            <T en="Book with confidence." ar="احجز بثقة." />
          </h2>

          <p>
            <T
              en="Browse studios, create booking requests, track confirmation status, and simulate payment after owner approval."
              ar="تصفح الاستوديوهات، أنشئ طلبات الحجز، تابع حالة التأكيد، وادفع بعد موافقة صاحب الاستوديو."
            />
          </p>

          <Link href="/studios" className="btn">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>
        </div>

        <div className="card">
          <span className="badge">
            <T en="For Studio Owners" ar="لأصحاب الاستوديوهات" />
          </span>

          <h2>
            <T en="Manage your studio flow." ar="أدر مسار استوديوك." />
          </h2>

          <p>
            <T
              en="Create studios, review booking requests, confirm or cancel bookings, and track customer payment status."
              ar="أنشئ الاستوديوهات، راجع طلبات الحجز، أكد أو ألغِ الحجوزات، وتابع حالة دفع العميل."
            />
          </p>

          <Link href="/signup" className="btn btn-secondary">
            <T en="Create Owner Account" ar="إنشاء حساب مالك استوديو" />
          </Link>
        </div>
      </section>
    </>
  );
}
