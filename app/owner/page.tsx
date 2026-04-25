import Link from "next/link";
import { requireRole } from "../../lib/auth";
import T from "../../components/t";

export default async function OwnerPage() {
  const { profile } = await requireRole("owner");

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner Area" ar="منطقة صاحب الاستوديو" />
        </span>

        <h1>
          <T en="Owner Dashboard" ar="لوحة تحكم صاحب الاستوديو" />
        </h1>

        <p>
          <T
            en="Manage your studios, bookings, confirmations, and future revenue tools."
            ar="أدر استوديوهاتك، الحجوزات، التأكيدات، وأدوات الإيرادات المستقبلية."
          />
        </p>
      </div>

      <div className="card">
        <span className="badge">
          <T en="Welcome" ar="مرحبًا" />
        </span>

        <h2>{profile.full_name || profile.email}</h2>

        <p>
          <T
            en="This is your studio owner area. You can create studios, manage your listings, review booking requests, and later we will add availability, pricing, earnings, and reports."
            ar="هذه منطقة صاحب الاستوديو الخاصة بك. يمكنك إنشاء الاستوديوهات، إدارة القوائم، مراجعة طلبات الحجز، ولاحقًا سنضيف التوفر، الأسعار، الأرباح، والتقارير."
          />
        </p>

        <div className="stats-row">
          <div className="stat">
            <b>
              <T en="Studios" ar="الاستوديوهات" />
            </b>
            <span>
              <T en="Manage listings" ar="إدارة القوائم" />
            </span>
          </div>

          <div className="stat">
            <b>
              <T en="Bookings" ar="الحجوزات" />
            </b>
            <span>
              <T en="Review requests" ar="مراجعة الطلبات" />
            </span>
          </div>

          <div className="stat">
            <b>
              <T en="Revenue" ar="الإيرادات" />
            </b>
            <span>
              <T en="Coming soon" ar="قريبًا" />
            </span>
          </div>
        </div>

        <div className="actions">
          <Link href="/owner/create-studio" className="btn">
            <T en="Create Studio" ar="إنشاء استوديو" />
          </Link>

          <Link href="/owner/studios" className="btn btn-secondary">
            <T en="My Studios" ar="استوديوهاتي" />
          </Link>

          <Link href="/owner/bookings" className="btn btn-secondary">
            <T en="View Bookings" ar="عرض الحجوزات" />
          </Link>
        </div>
      </div>
    </section>
  );
}
