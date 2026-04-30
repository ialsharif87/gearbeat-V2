import Link from "next/link";
import { requireCustomerLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";

export default async function CustomerPage() {
  const { profile } = await requireCustomerLayoutAccess();

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Customer Area" ar="منطقة العميل" />
        </span>

        <h1>
          <T en="Customer Dashboard" ar="لوحة تحكم العميل" />
        </h1>

        <p>
          <T
            en="Manage your bookings, payments, and future orders from one place."
            ar="أدر حجوزاتك ومدفوعاتك وطلباتك المستقبلية من مكان واحد."
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
            en="This is your customer area. You can browse studios, check your bookings, and later we will add orders, favorites, reviews, and profile settings."
            ar="هذه منطقة العميل الخاصة بك. يمكنك تصفح الاستوديوهات، متابعة حجوزاتك، ولاحقًا سنضيف الطلبات، المفضلة، التقييمات، وإعدادات الملف الشخصي."
          />
        </p>

        <div className="stats-row">
          <div className="stat">
            <b>
              <T en="Studios" ar="الاستوديوهات" />
            </b>
            <span>
              <T en="Browse and book" ar="تصفح واحجز" />
            </span>
          </div>

          <div className="stat">
            <b>
              <T en="Bookings" ar="الحجوزات" />
            </b>
            <span>
              <T en="Track requests" ar="تابع الطلبات" />
            </span>
          </div>

          <div className="stat">
            <b>
              <T en="Payments" ar="المدفوعات" />
            </b>
            <span>
              <T en="View status" ar="تابع الحالة" />
            </span>
          </div>
        </div>

        <div className="actions">
          <Link href="/studios" className="btn">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </Link>

          <Link href="/customer/bookings" className="btn btn-secondary">
            <T en="My Bookings" ar="حجوزاتي" />
          </Link>
        </div>
      </div>
    </section>
  );
}
