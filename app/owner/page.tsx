import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";

export default async function OwnerPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, email, admin_role, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect("/login?account=owner");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner") {
    redirect("/forbidden");
  }

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
          <Link href="/owner/onboarding" className="btn">
            <T en="Complete Business Onboarding" ar="إكمال بيانات النشاط" />
          </Link>

          <Link href="/owner/create-studio" className="btn btn-secondary">
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
