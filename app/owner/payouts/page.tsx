import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

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

type PlatformPayoutRow = {
  id: string;
  provider_type: string;
  provider_id: string;
  bank_account_type: string;
  bank_account_id: string | null;
  payout_number: string;
  total_amount: number | null;
  currency: string | null;
  status: string;
  approved_at: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PlatformPayoutItemRow = {
  id: string;
  payout_id: string;
  settlement_id: string;
  source_type: string;
  source_id: string;
  gross_amount: number | null;
  commission_amount: number | null;
  net_amount: number | null;
  created_at: string | null;
};

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
};

type BookingRow = {
  id: string;
  studio_id: string;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_amount: number | null;
  status: string | null;
  payment_status: string | null;
  settlement_status: string | null;
  payout_status: string | null;
  studios: StudioRow | StudioRow[] | null;
};

function money(value: number | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} SAR`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function sumValues<T>(rows: T[], getter: (row: T) => number | null | undefined) {
  return rows.reduce((sum: number, row: T) => sum + Number(getter(row) || 0), 0);
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function statusStyle(status: string | null | undefined) {
  if (status === "paid" || status === "approved") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "failed" || status === "cancelled" || status === "rejected") {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  if (
    status === "draft" ||
    status === "pending_approval" ||
    status === "pending_review"
  ) {
    return {
      background: "rgba(255, 193, 7, 0.18)",
      color: "#ffc107",
      border: "1px solid rgba(255, 193, 7, 0.45)"
    };
  }

  return {
    background: "rgba(255, 255, 255, 0.12)",
    color: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  };
}

async function requireOwnerOnly() {
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
    .select("id, auth_user_id, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profileData, error } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
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

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner") {
    redirect("/forbidden");
  }

  return {
    user,
    profile,
    supabaseAdmin
  };
}

export default async function OwnerPayoutsPage() {
  const { user, supabaseAdmin } = await requireOwnerOnly();

  const { data: bankAccountData } = await supabaseAdmin
    .from("owner_bank_accounts")
    .select("id,bank_name,iban,beneficiary_name,account_status,is_default")
    .eq("owner_auth_user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const bankAccount = bankAccountData as BankAccountRow | null;

  const { data: payoutsData, error: payoutsError } = await supabaseAdmin
    .from("platform_payouts")
    .select(
      "id,provider_type,provider_id,bank_account_type,bank_account_id,payout_number,total_amount,currency,status,approved_at,paid_at,failure_reason,created_at,updated_at"
    )
    .eq("provider_type", "studio_owner")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  if (payoutsError) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>

        <h1>
          <T en="Payouts" ar="البياوت" />
        </h1>

        <p>{payoutsError.message}</p>
      </div>
    );
  }

  const payouts = (payoutsData || []) as PlatformPayoutRow[];
  const payoutIds = payouts.map((payout: PlatformPayoutRow) => payout.id);

  let payoutItems: PlatformPayoutItemRow[] = [];

  if (payoutIds.length > 0) {
    const { data: payoutItemsData, error: payoutItemsError } =
      await supabaseAdmin
        .from("platform_payout_items")
        .select(
          "id,payout_id,settlement_id,source_type,source_id,gross_amount,commission_amount,net_amount,created_at"
        )
        .in("payout_id", payoutIds)
        .order("created_at", { ascending: false });

    if (payoutItemsError) {
      return (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>

          <h1>
            <T en="Payouts" ar="البياوت" />
          </h1>

          <p>{payoutItemsError.message}</p>
        </div>
      );
    }

    payoutItems = (payoutItemsData || []) as PlatformPayoutItemRow[];
  }

  const bookingIds = Array.from(
    new Set(
      payoutItems
        .filter((item: PlatformPayoutItemRow) => item.source_type === "studio_booking")
        .map((item: PlatformPayoutItemRow) => item.source_id)
        .filter(Boolean)
    )
  );

  let bookings: BookingRow[] = [];

  if (bookingIds.length > 0) {
    const { data: bookingsData, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        booking_date,
        start_time,
        end_time,
        total_amount,
        status,
        payment_status,
        settlement_status,
        payout_status,
        studios (
          id,
          name,
          slug
        )
      `)
      .in("id", bookingIds);

    if (bookingsError) {
      return (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>

          <h1>
            <T en="Payouts" ar="البياوت" />
          </h1>

          <p>{bookingsError.message}</p>
        </div>
      );
    }

    bookings = (bookingsData || []) as BookingRow[];
  }

  const bookingMap = new Map<string, BookingRow>(
    bookings.map((booking: BookingRow) => [booking.id, booking])
  );

  const payoutItemsByPayoutId = new Map<string, PlatformPayoutItemRow[]>();

  payoutItems.forEach((item: PlatformPayoutItemRow) => {
    const existing = payoutItemsByPayoutId.get(item.payout_id) || [];
    payoutItemsByPayoutId.set(item.payout_id, [...existing, item]);
  });

  const totalPayouts = payouts.length;

  const draftPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "draft"
  ).length;

  const pendingPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "pending_approval"
  ).length;

  const approvedPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "approved"
  ).length;

  const paidPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "paid"
  ).length;

  const failedPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "failed"
  ).length;

  const paidAmount = sumValues(
    payouts.filter((payout: PlatformPayoutRow) => payout.status === "paid"),
    (payout: PlatformPayoutRow) => payout.total_amount
  );

  const upcomingAmount = sumValues(
    payouts.filter(
      (payout: PlatformPayoutRow) =>
        payout.status === "draft" ||
        payout.status === "pending_approval" ||
        payout.status === "approved"
    ),
    (payout: PlatformPayoutRow) => payout.total_amount
  );

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner Finance" ar="مالية صاحب الاستوديو" />
        </span>

        <h1>
          <T en="Payouts" ar="البياوت" />
        </h1>

        <p>
          <T
            en="Track payout batches created by GearBeat finance for your completed and eligible studio bookings."
            ar="تابع دفعات البياوت التي تنشئها مالية GearBeat لحجوزات الاستوديو المكتملة والمؤهلة."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>

        <Link href="/owner/finance" className="btn btn-secondary">
          <T en="Finance Overview" ar="النظرة المالية" />
        </Link>

        <Link href="/owner/bank" className="btn btn-secondary">
          <T en="Bank Account" ar="الحساب البنكي" />
        </Link>

        <Link href="/owner/bookings" className="btn btn-secondary">
          <T en="Bookings" ar="الحجوزات" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Payouts" ar="إجمالي البياوت" />
          </span>
          <strong>{totalPayouts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Upcoming Amount" ar="مبالغ قادمة" />
          </span>
          <strong>{money(upcomingAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Amount" ar="مبالغ محولة" />
          </span>
          <strong>{money(paidAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Approval" ar="بانتظار الاعتماد" />
          </span>
          <strong>{pendingPayouts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved" ar="معتمد" />
          </span>
          <strong>{approvedPayouts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid" ar="مدفوع" />
          </span>
          <strong>{paidPayouts}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Bank Readiness" ar="جاهزية الحساب البنكي" />
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

              <span className="badge" style={statusStyle(bankAccount.account_status)}>
                {bankAccount.account_status}
              </span>

              {bankAccount.account_status === "approved" ? (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Your bank account is approved and can receive payouts."
                    ar="حسابك البنكي معتمد ويمكن استقبال البياوت عليه."
                  />
                </p>
              ) : (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Your bank account must be approved before payouts can be paid."
                    ar="يجب اعتماد حسابك البنكي قبل دفع البياوت."
                  />
                </p>
              )}
            </>
          ) : (
            <>
              <h2>
                <T en="No bank account" ar="لا يوجد حساب بنكي" />
              </h2>

              <p>
                <T
                  en="Add your bank account to receive future payouts."
                  ar="أضف حسابك البنكي لاستلام البياوت مستقبلًا."
                />
              </p>

              <Link href="/owner/bank" className="btn">
                <T en="Add Bank Account" ar="إضافة حساب بنكي" />
              </Link>
            </>
          )}
        </div>

        <div className="card">
          <span className="badge">
            <T en="Status Summary" ar="ملخص الحالات" />
          </span>

          <div className="admin-badge-stack">
            <span className="badge">
              <T en="Draft:" ar="مسودة:" /> {draftPayouts}
            </span>

            <span className="badge">
              <T en="Pending:" ar="معلقة:" /> {pendingPayouts}
            </span>

            <span className="badge">
              <T en="Approved:" ar="معتمدة:" /> {approvedPayouts}
            </span>

            <span className="badge">
              <T en="Paid:" ar="مدفوعة:" /> {paidPayouts}
            </span>

            <span className="badge">
              <T en="Failed:" ar="فاشلة:" /> {failedPayouts}
            </span>
          </div>

          <p style={{ marginTop: 14 }}>
            <T
              en="Payouts are created and approved by GearBeat finance after bookings become eligible."
              ar="يتم إنشاء واعتماد البياوت من مالية GearBeat بعد أن تصبح الحجوزات مؤهلة."
            />
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Payout List" ar="قائمة البياوت" />
        </span>

        <h2>
          <T en="All payout batches" ar="كل دفعات البياوت" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Payout" ar="البياوت" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Created" ar="تم الإنشاء" />
                </th>
                <th>
                  <T en="Approved" ar="تم الاعتماد" />
                </th>
                <th>
                  <T en="Paid" ar="تم الدفع" />
                </th>
                <th>
                  <T en="Items" ar="العناصر" />
                </th>
              </tr>
            </thead>

            <tbody>
              {payouts.length ? (
                payouts.map((payout: PlatformPayoutRow) => {
                  const items = payoutItemsByPayoutId.get(payout.id) || [];

                  return (
                    <tr key={payout.id}>
                      <td>
                        <strong>{payout.payout_number}</strong>

                        {payout.failure_reason ? (
                          <p className="admin-muted-line">
                            <T en="Failure:" ar="سبب الفشل:" />{" "}
                            {payout.failure_reason}
                          </p>
                        ) : null}
                      </td>

                      <td>{money(payout.total_amount)}</td>

                      <td>
                        <span className="badge" style={statusStyle(payout.status)}>
                          {payout.status}
                        </span>
                      </td>

                      <td>{formatDate(payout.created_at)}</td>

                      <td>{formatDate(payout.approved_at)}</td>

                      <td>{formatDate(payout.paid_at)}</td>

                      <td>
                        <span className="badge">
                          {items.length} <T en="items" ar="عنصر" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T
                      en="No payouts have been created yet."
                      ar="لم يتم إنشاء أي بياوت حتى الآن."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Payout Details" ar="تفاصيل البياوت" />
        </span>

        <h2>
          <T en="Related booking settlements" ar="تسويات الحجوزات المرتبطة" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Payout" ar="البياوت" />
                </th>
                <th>
                  <T en="Booking" ar="الحجز" />
                </th>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Gross" ar="الإجمالي" />
                </th>
                <th>
                  <T en="Commission" ar="العمولة" />
                </th>
                <th>
                  <T en="Net" ar="الصافي" />
                </th>
              </tr>
            </thead>

            <tbody>
              {payoutItems.length ? (
                payoutItems.map((item: PlatformPayoutItemRow) => {
                  const payout = payouts.find(
                    (row: PlatformPayoutRow) => row.id === item.payout_id
                  );

                  const booking = bookingMap.get(item.source_id);
                  const studio = booking ? normalizeStudio(booking.studios) : null;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{payout?.payout_number || "—"}</strong>
                      </td>

                      <td>
                        {booking ? (
                          <>
                            <strong>{booking.booking_date || "—"}</strong>
                            <p className="admin-muted-line">
                              {booking.start_time || "—"} -{" "}
                              {booking.end_time || "—"}
                            </p>
                            <div className="admin-badge-stack">
                              <span className="badge">
                                {booking.status || "—"}
                              </span>
                              <span className="badge">
                                {booking.payment_status || "—"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="badge">
                            <T en="Booking not found" ar="الحجز غير موجود" />
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                      </td>

                      <td>{money(item.gross_amount)}</td>

                      <td>{money(item.commission_amount)}</td>

                      <td>
                        <strong>{money(item.net_amount)}</strong>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <T
                      en="No payout items found yet."
                      ar="لا توجد عناصر بياوت حتى الآن."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
