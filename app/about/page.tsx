import Link from "next/link";
import T from "../../components/t";

export default function AboutPage() {
  return (
    <section>
      <div className="section-head">
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
            en="GearBeat connects musicians, podcasters, producers, and creators with trusted studios and creative spaces through a simple booking experience."
            ar="GearBeat تربط الموسيقيين، صناع البودكاست، المنتجين، والمبدعين باستوديوهات ومساحات إبداعية موثوقة من خلال تجربة حجز سهلة وواضحة."
          />
        </p>
      </div>

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Our Mission" ar="مهمتنا" />
          </span>

          <h2>
            <T
              en="Make studio booking simple, transparent, and trusted."
              ar="نجعل حجز الاستوديوهات أسهل، أوضح، وأكثر موثوقية."
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
            <T en="Trust & Safety" ar="الثقة والأمان" />
          </span>

          <h2>
            <T en="Verified flows, real bookings, clear reviews." ar="حجوزات حقيقية، تقييمات واضحة، وتحقق أفضل." />
          </h2>

          <p>
            <T
              en="GearBeat reviews are connected to booking activity. Customer profile details and identity information help improve trust across the platform."
              ar="تقييمات GearBeat مرتبطة بالحجوزات. بيانات العميل والهوية تساعد في رفع مستوى الثقة داخل المنصة."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="grid">
        <div className="card">
          <h2>
            <T en="For Creators" ar="للمبدعين" />
          </h2>
          <p>
            <T
              en="Search, compare, book, and review studios with confidence."
              ar="ابحث، قارن، احجز، وقيّم الاستوديوهات بثقة."
            />
          </p>
        </div>

        <div className="card">
          <h2>
            <T en="For Studios" ar="للاستوديوهات" />
          </h2>
          <p>
            <T
              en="Manage your listing, bookings, reviews, and visibility in one place."
              ar="أدر قائمتك، حجوزاتك، تقييماتك، وظهورك من مكان واحد."
            />
          </p>
        </div>

        <div className="card">
          <h2>
            <T en="For the Sound Community" ar="لمجتمع الصوت" />
          </h2>
          <p>
            <T
              en="A better way for creators and studios to connect."
              ar="طريقة أفضل لربط المبدعين بالاستوديوهات."
            />
          </p>
        </div>
      </div>

      <div className="actions">
        <Link href="/studios" className="btn">
          <T en="Browse Studios" ar="تصفح الاستوديوهات" />
        </Link>

        <Link href="/support" className="btn btn-secondary">
          <T en="Contact Support" ar="تواصل مع الدعم" />
        </Link>
      </div>
    </section>
  );
}
