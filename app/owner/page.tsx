import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";
import DashboardQuickLinks from "../../components/dashboard-quick-links";
import { ownerDashboardLinks } from "../../lib/dashboard-links";
import { requireOwnerOrRedirect } from "../../lib/auth-guards";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

type BankAccountRow = {
  id: string;
  bank_name: string;
  iban: string;
  beneficiary_name: string;
  account_status: string;
  is_default: boolean;
};

function statusStyle(status: string | null | undefined) {
  if (status === "approved" || status === "active") {
    return {
      background: "rgba(103, 197, 135, 0.18)",
      color: "var(--gb-success)",
      border: "1px solid rgba(103, 197, 135, 0.45)"
    };
  }

  if (status === "rejected" || status === "disabled" || status === "deleted") {
    return {
      background: "rgba(226, 109, 90, 0.18)",
      color: "var(--gb-danger)",
      border: "1px solid rgba(226, 109, 90, 0.45)"
    };
  }

  if (status === "pending_review" || status === "pending_deletion") {
    return {
      background: "rgba(255, 193, 7, 0.18)",
      color: "var(--gb-warning)",
      border: "1px solid rgba(255, 193, 7, 0.45)"
    };
  }

  return {
    background: "rgba(255, 255, 255, 0.12)",
    color: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  };
}

export default async function OwnerPage() {
  const supabase = await createClient();
  const { user } = await requireOwnerOrRedirect(supabase);
  const supabaseAdmin = createAdminClient();

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profile = profileData as ProfileRow | null;

  if (!profile) {
    redirect("/login?account=owner");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.account_status && profile.account_status !== "active") {
    redirect("/login?account=owner");
  }

  const [
    studiosCountResult,
    bookingsCountResult,
    paidBookingsCountResult,
    pendingBookingsCountResult,
    bankAccountResult,
    eligibleSettlementsResult,
    payoutsResult
  ] = await Promise.all([
    supabaseAdmin
      .from("studios")
      .select("id", { count: "exact", head: true })
      .eq("owner_auth_user_id", user.id),

    supabaseAdmin
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", {
        count: "exact",
        head: true
      })
      .eq("studios.owner_auth_user_id", user.id),

    supabaseAdmin
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", {
        count: "exact",
        head: true
      })
      .eq("studios.owner_auth_user_id", user.id)
      .eq("payment_status", "paid"),

    supabaseAdmin
      .from("bookings")
      .select("id, studios!inner(owner_auth_user_id)", {
        count: "exact",
        head: true
      })
      .eq("studios.owner_auth_user_id", user.id)
      .eq("status", "pending"),

    supabaseAdmin
      .from("owner_bank_accounts")
      .select("id, bank_name, iban, beneficiary_name, account_status, is_default")
      .eq("owner_auth_user_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),

    supabaseAdmin
      .from("platform_settlements")
      .select("id, net_amount")
      .eq("source_type", "studio_booking")
      .eq("provider_type", "studio_owner")
      .eq("provider_id", user.id)
      .eq("settlement_status", "eligible"),

    supabaseAdmin
      .from("platform_payouts")
      .select("id, total_amount, status")
      .eq("provider_type", "studio_owner")
      .eq("provider_id", user.id)
  ]);

  const bankAccount = (bankAccountResult.data || null) as BankAccountRow | null;

  const eligibleSettlements = eligibleSettlementsResult.data || [];
  const payouts = payoutsResult.data || [];

  const availableForPayout = eligibleSettlements.reduce(
    (sum: number, settlement: { net_amount?: number | null }) =>
      sum + Number(settlement.net_amount || 0),
    0
  );

  const paidOutAmount = payouts
    .filter((payout: { status?: string | null }) => payout.status === "paid")
    .reduce(
      (sum: number, payout: { total_amount?: number | null }) =>
        sum + Number(payout.total_amount || 0),
      0
    );

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Studio Owner Area" ar="منطقة صاحب الاستوديو" />
          </p>

          <h1>
            <T en="Owner Dashboard" ar="لوحة تحكم صاحب الاستوديو" />
          </h1>

          <p className="gb-muted-text">
            <T
              en="Manage your studios, bookings, business onboarding, bank account, finance overview, and payouts."
              ar="أدر استوديوهاتك، الحجوزات، بيانات النشاط، الحساب البنكي، النظرة المالية، والبياوت."
            />
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/owner/create-studio" className="gb-button">
            + Create studio
          </Link>
          <Link href="/owner/finance" className="gb-button gb-button-secondary">
            Finance
          </Link>
        </div>
      </section>

      <div className="gb-dashboard-stack">
        <DashboardQuickLinks
          eyebrow="Owner navigation"
          title="Studio owner quick links"
          description="Manage bookings, availability, and owner tools."
          links={ownerDashboardLinks}
        />

      <div className="card">
        <span className="badge">
          <T en="Welcome" ar="مرحبًا" />
        </span>

        <h2>{profile.full_name || profile.email}</h2>

        <p>
          <T
            en="This is your studio owner area. You can create studios, manage your listings, review booking requests, track payment status, and follow your payouts."
            ar="هذه منطقة صاحب الاستوديو الخاصة بك. يمكنك إنشاء الاستوديوهات، إدارة القوائم، مراجعة طلبات الحجز، متابعة حالة الدفع، ومتابعة البياوت."
          />
        </p>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span><T en="Total Studios" ar="إجمالي الاستوديوهات" /></span>
            <strong>{studiosCountResult.count || 0}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Total Bookings" ar="إجمالي الحجوزات" /></span>
            <strong>{bookingsCountResult.count || 0}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Pending Requests" ar="طلبات معلقة" /></span>
            <strong>{pendingBookingsCountResult.count || 0}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Customer Rating" ar="تقييم العملاء" /></span>
            <strong>4.9 ⭐</strong>
          </div>
        </div>

        <div className="gb-action-row">
          <Link href="/owner/create-studio" className="gb-button">
            <T en="+ Create New Studio" ar="+ إنشاء استوديو جديد" />
          </Link>
          <Link href="/owner/bookings" className="gb-button gb-button-secondary">
            <T en="View All Bookings" ar="عرض كافة الحجوزات" />
          </Link>
          <Link href="/owner/reviews" className="gb-button gb-button-secondary">
            <T en="Read Reviews" ar="قراءة المراجعات" />
          </Link>
          <Link href="/owner/finance" className="gb-button gb-button-secondary">
            <T en="Finance" ar="المالية" />
          </Link>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Growth & Visibility" ar="النمو والظهور" />
          </span>

          <h2>
            <T en="Acceleration" ar="التسريع" />
          </h2>

          <p>
            <T
              en="Boost your studio visibility in the marketplace and track your performance metrics."
              ar="ارفع مستوى ظهور استوديوك في المنصة وتابع أداء الظهور."
            />
          </p>

          <div className="actions">
            <Link href="/owner/acceleration" className="btn">
              <T en="Manage Acceleration" ar="إدارة التسريع" />
            </Link>
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Fees & Deductions" ar="الرسوم والخصومات" />
          </span>

          <h2>
            <T en="Commission" ar="العمولة" />
          </h2>

          <p>
            <T
              en="View your current commission percentage and history of deductions on paid bookings."
              ar="عرض نسبة العمولة الحالية وتاريخ الخصومات على الحجوزات المدفوعة."
            />
          </p>

          <div className="actions">
            <Link href="/owner/commission" className="btn">
              <T en="View Commission" ar="عرض العمولة" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Finance" ar="المالية" />
          </span>

          <h2>
            <T en="Finance Overview" ar="النظرة المالية" />
          </h2>

          <p>
            <T
              en="Track paid bookings, pending settlements, available payout balance, commission deductions, and paid payouts."
              ar="تابع الحجوزات المدفوعة، التسويات المعلقة، الرصيد المتاح للبياوت، العمولات المخصومة، والبياوت المدفوع."
            />
          </p>

          <div className="stats-row">
            <div className="stat">
              <b>
                {availableForPayout.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </b>
              <span>
                <T en="Available SAR" ar="متاح ريال" />
              </span>
            </div>

            <div className="stat">
              <b>
                {paidOutAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </b>
              <span>
                <T en="Paid out SAR" ar="تم تحويله ريال" />
              </span>
            </div>
          </div>

          <div className="actions">
            <Link href="/owner/finance" className="btn">
              <T en="Open Finance" ar="فتح المالية" />
            </Link>

            <Link href="/owner/payouts" className="btn btn-secondary">
              <T en="View Payouts" ar="عرض البياوت" />
            </Link>
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Bank Account" ar="الحساب البنكي" />
          </span>

          {bankAccount ? (
            <>
              <h2>{bankAccount.bank_name}</h2>

              <p>
                <T en="Beneficiary:" ar="المستفيد:" />{" "}
                <strong>{bankAccount.beneficiary_name}</strong>
              </p>

              <p>
                <T en="IBAN:" ar="الآيبان:" />{" "}
                <strong>{bankAccount.iban}</strong>
              </p>

              <span
                className="badge"
                style={statusStyle(bankAccount.account_status)}
              >
                {bankAccount.account_status}
              </span>

              {bankAccount.account_status === "approved" ? (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Your bank account is approved for payouts."
                    ar="حسابك البنكي معتمد للتحويلات."
                  />
                </p>
              ) : (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Your bank account is not approved yet. Payouts cannot be sent until admin approval."
                    ar="حسابك البنكي غير معتمد بعد. لا يمكن إرسال البياوت قبل اعتماد الإدارة."
                  />
                </p>
              )}
            </>
          ) : (
            <>
              <h2>
                <T en="No bank account yet" ar="لا يوجد حساب بنكي بعد" />
              </h2>

              <p>
                <T
                  en="Add your bank account to receive payouts after completed paid bookings."
                  ar="أضف حسابك البنكي لاستلام البياوت بعد الحجوزات المدفوعة والمكتملة."
                />
              </p>
            </>
          )}

          <div className="actions">
            <Link href="/owner/bank" className="btn">
              <T en="Manage Bank Account" ar="إدارة الحساب البنكي" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Studios" ar="الاستوديوهات" />
          </span>

          <h2>
            <T en="Studio Management" ar="إدارة الاستوديوهات" />
          </h2>

          <p>
            <T
              en="Create new studios, update existing listings, photos, pricing, features, and booking readiness."
              ar="أنشئ استوديوهات جديدة، وعدّل القوائم الحالية، الصور، الأسعار، المميزات، وجاهزية الحجز."
            />
          </p>

          <div className="actions">
            <Link href="/owner/create-studio" className="btn">
              <T en="Create Studio" ar="إنشاء استوديو" />
            </Link>

            <Link href="/owner/studios" className="btn btn-secondary">
              <T en="Manage Studios" ar="إدارة الاستوديوهات" />
            </Link>

            <Link href="/owner/availability" className="btn btn-secondary">
              <T en="Manage Availability" ar="إدارة التوافر" />
            </Link>
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Bookings" ar="الحجوزات" />
          </span>

          <h2>
            <T en="Booking Requests" ar="طلبات الحجز" />
          </h2>

          <p>
            <T
              en="Review new booking requests, confirm bookings, request payment, and monitor paid or completed bookings."
              ar="راجع طلبات الحجز الجديدة، أكد الحجوزات، اطلب الدفع، وتابع الحجوزات المدفوعة أو المكتملة."
            />
          </p>

          <div className="actions">
            <Link href="/owner/bookings" className="btn">
              <T en="View Bookings" ar="عرض الحجوزات" />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
