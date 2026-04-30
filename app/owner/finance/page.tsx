import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createAuditLog } from "../../../lib/audit";
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
  paid_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
};

type BankAccountRow = {
  id: string;
  bank_name: string;
  iban: string;
  beneficiary_name: string;
  account_status: string;
  is_default: boolean;
  rejection_reason: string | null;
};

type PlatformPaymentRow = {
  id: string;
  source_type: string;
  source_id: string;
  provider_type: string;
  provider_id: string;
  amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string;
  paid_at: string | null;
  created_at: string | null;
};

type PlatformSettlementRow = {
  id: string;
  source_type: string;
  source_id: string;
  provider_type: string;
  provider_id: string;
  gross_amount: number | null;
  commission_amount: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  currency: string | null;
  settlement_status: string;
  available_for_payout_at: string | null;
  created_at: string | null;
};

type PlatformPayoutRow = {
  id: string;
  payout_number: string;
  total_amount: number | null;
  currency: string | null;
  status: string;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string | null;
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
  return rows.reduce((sum, row) => sum + Number(getter(row) || 0), 0);
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function statusStyle(status: string | null | undefined) {
  if (status === "approved" || status === "paid" || status === "paid_out" || status === "eligible") {
    return {
      background: "rgba(103, 197, 135, 0.18)",
      color: "var(--gb-success)",
      border: "1px solid rgba(103, 197, 135, 0.45)"
    };
  }

  if (status === "rejected" || status === "failed" || status === "cancelled") {
    return {
      background: "rgba(226, 109, 90, 0.18)",
      color: "var(--gb-danger)",
      border: "1px solid rgba(226, 109, 90, 0.45)"
    };
  }

  if (status === "pending" || status === "pending_review" || status === "not_ready") {
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

export default async function OwnerFinancePage() {
  const { user, supabaseAdmin } = await requireOwnerOnly();

  async function requestPayout() {
    "use server";
    const { user, supabaseAdmin } = await requireOwnerOnly();

    // 1. Get approved bank account
    const { data: bankAccount, error: bankError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("id,account_status,is_default")
      .eq("owner_auth_user_id", user.id)
      .eq("is_default", true)
      .eq("account_status", "approved")
      .maybeSingle();

    if (bankError || !bankAccount) {
      throw new Error("You must have an approved default bank account to request a payout.");
    }

    // 2. Get eligible settlements
    const { data: eligibleSettlements, error: settlementsError } = await supabaseAdmin
      .from("platform_settlements")
      .select("*")
      .eq("provider_id", user.id)
      .eq("settlement_status", "eligible");

    if (settlementsError || !eligibleSettlements || eligibleSettlements.length === 0) {
      throw new Error("No eligible funds available for withdrawal.");
    }

    const totalAmount = eligibleSettlements.reduce((sum: number, s: any) => sum + Number(s.net_amount || 0), 0);

    // 3. Create payout record
    const { data: payout, error: payoutError } = await supabaseAdmin
      .from("platform_payouts")
      .insert({
        provider_type: "studio_owner",
        provider_id: user.id,
        bank_account_type: "owner_bank_account",
        bank_account_id: bankAccount.id,
        total_amount: totalAmount,
        currency: "SAR",
        status: "pending_approval"
      })
      .select("id,payout_number")
      .single();

    if (payoutError) throw new Error(payoutError.message);

    // 4. Link items
    const payoutItems = eligibleSettlements.map((s: any) => ({
      payout_id: payout.id,
      settlement_id: s.id,
      source_type: s.source_type,
      source_id: s.source_id,
      gross_amount: s.gross_amount,
      commission_amount: s.commission_amount,
      net_amount: s.net_amount
    }));

    await supabaseAdmin.from("platform_payout_items").insert(payoutItems);

    // 5. Update statuses
    const settlementIds = eligibleSettlements.map((s: any) => s.id);
    const bookingIds = eligibleSettlements.map((s: any) => s.source_id);

    await supabaseAdmin.from("platform_settlements")
      .update({ settlement_status: "included_in_payout", updated_at: new Date().toISOString() })
      .in("id", settlementIds);

    await supabaseAdmin.from("bookings")
      .update({ settlement_status: "included_in_payout", payout_status: "included_in_payout", updated_at: new Date().toISOString() })
      .in("id", bookingIds);

    // 6. Audit Log
    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email || "owner",
      action: "owner_requested_payout",
      entityType: "platform_payout",
      entityId: payout.id,
      oldValues: {},
      newValues: { status: "pending_approval", total_amount: totalAmount },
      metadata: { payout_number: payout.payout_number }
    });

    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/studio-payouts");
  }

  const { data: bankAccountData } = await supabaseAdmin
    .from("owner_bank_accounts")
    .select("id,bank_name,iban,beneficiary_name,account_status,is_default,rejection_reason")
    .eq("owner_auth_user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const bankAccount = bankAccountData as BankAccountRow | null;

  const { data: studioRows, error: studiosError } = await supabaseAdmin
    .from("studios")
    .select("id,name,slug")
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (studiosError) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Finance Overview" ar="النظرة المالية" />
        </h1>
        <p>{studiosError.message}</p>
      </div>
    );
  }

  const studios = (studioRows || []) as StudioRow[];
  const studioIds = studios.map((studio: StudioRow) => studio.id);

  let bookings: BookingRow[] = [];

  if (studioIds.length > 0) {
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
        paid_at,
        completed_at,
        created_at,
        studios (
          id,
          name,
          slug
        )
      `)
      .in("studio_id", studioIds)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      return (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <h1>
            <T en="Finance Overview" ar="النظرة المالية" />
          </h1>
          <p>{bookingsError.message}</p>
        </div>
      );
    }

    bookings = (bookingsData || []) as BookingRow[];
  }

  const { data: paymentsData } = await supabaseAdmin
    .from("platform_payments")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("provider_type", "studio_owner")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  const payments = (paymentsData || []) as PlatformPaymentRow[];

  const { data: settlementsData } = await supabaseAdmin
    .from("platform_settlements")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("provider_type", "studio_owner")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  const settlements = (settlementsData || []) as PlatformSettlementRow[];

  const { data: payoutsData } = await supabaseAdmin
    .from("platform_payouts")
    .select("id,payout_number,total_amount,currency,status,approved_at,paid_at,created_at")
    .eq("provider_type", "studio_owner")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const payouts = (payoutsData || []) as PlatformPayoutRow[];

  const paidBookings = bookings.filter(
    (booking: BookingRow) => booking.payment_status === "paid"
  );

  const completedBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "completed"
  );

  const fallbackPaidBookingTotal = sumValues(
    paidBookings,
    (booking: BookingRow) => booking.total_amount
  );

  const paidPaymentTotal = sumValues(
    payments.filter((payment: PlatformPaymentRow) => payment.payment_status === "paid"),
    (payment: PlatformPaymentRow) => payment.total_amount
  );

  const grossPaidTotal =
    paidPaymentTotal > 0 ? paidPaymentTotal : fallbackPaidBookingTotal;

  const pendingSettlementTotal = sumValues(
    settlements.filter(
      (settlement: PlatformSettlementRow) =>
        settlement.settlement_status === "pending" ||
        settlement.settlement_status === "not_ready"
    ),
    (settlement: PlatformSettlementRow) => settlement.net_amount
  );

  const eligibleSettlementTotal = sumValues(
    settlements.filter(
      (settlement: PlatformSettlementRow) =>
        settlement.settlement_status === "eligible"
    ),
    (settlement: PlatformSettlementRow) => settlement.net_amount
  );

  const paidOutTotal = sumValues(
    settlements.filter(
      (settlement: PlatformSettlementRow) =>
        settlement.settlement_status === "paid_out"
    ),
    (settlement: PlatformSettlementRow) => settlement.net_amount
  );

  const commissionTotal = sumValues(
    settlements,
    (settlement: PlatformSettlementRow) => settlement.commission_amount
  );

  const fallbackPendingAmount = sumValues(
    bookings.filter(
      (booking: BookingRow) =>
        booking.payment_status === "paid" &&
        booking.settlement_status !== "eligible" &&
        booking.settlement_status !== "paid_out"
    ),
    (booking: BookingRow) => booking.total_amount
  );

  const displayPendingSettlement =
    pendingSettlementTotal > 0 ? pendingSettlementTotal : fallbackPendingAmount;

  const latestFinancialBookings = bookings.slice(0, 6);

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner Finance" ar="مالية صاحب الاستوديو" />
        </span>

        <h1>
          <T en="Finance Overview" ar="النظرة المالية" />
        </h1>

        <p>
          <T
            en="Track paid bookings, settlements, commissions, payout readiness, and bank account status."
            ar="تابع الحجوزات المدفوعة، التسويات، العمولات، جاهزية البياوت، وحالة الحساب البنكي."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>

        <Link href="/owner/bank" className="btn btn-secondary">
          <T en="Bank Account" ar="الحساب البنكي" />
        </Link>

        <Link href="/owner/payouts" className="btn btn-secondary">
          <T en="Payouts" ar="البياوت" />
        </Link>

        <Link href="/owner/bookings" className="btn btn-secondary">
          <T en="Bookings" ar="الحجوزات" />
        </Link>

        {eligibleSettlementTotal > 0 && bankAccount?.account_status === "approved" && (
          <form action={requestPayout} style={{ display: "inline-block" }}>
            <button type="submit" className="btn btn-primary">
              <T en="Request Withdrawal" ar="طلب سحب الرصيد" />
            </button>
          </form>
        )}
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Bookings" ar="الحجوزات المدفوعة" />
          </span>
          <strong>{paidBookings.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Gross Paid Amount" ar="إجمالي المدفوع" />
          </span>
          <strong>{money(grossPaidTotal)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Settlement" ar="تسويات معلقة" />
          </span>
          <strong>{money(displayPendingSettlement)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Available for Payout" ar="متاح للبياوت" />
          </span>
          <strong>{money(eligibleSettlementTotal)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Out" ar="تم تحويله" />
          </span>
          <strong>{money(paidOutTotal)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Commission Deducted" ar="العمولة المخصومة" />
          </span>
          <strong>{money(commissionTotal)}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-detail-grid">
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

              {bankAccount.account_status !== "approved" ? (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Payouts cannot be sent until this bank account is approved by admin."
                    ar="لا يمكن إرسال البياوت حتى يتم اعتماد الحساب البنكي من الإدارة."
                  />
                </p>
              ) : (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="This bank account is approved for payouts."
                    ar="هذا الحساب البنكي معتمد للتحويلات."
                  />
                </p>
              )}

              {bankAccount.rejection_reason ? (
                <p>
                  <T en="Rejection reason:" ar="سبب الرفض:" />{" "}
                  {bankAccount.rejection_reason}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2>
                <T en="No bank account" ar="لا يوجد حساب بنكي" />
              </h2>

              <p>
                <T
                  en="Add your bank account before payouts can be processed."
                  ar="أضف حسابك البنكي قبل معالجة البياوت."
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
            <T en="Booking Activity" ar="نشاط الحجوزات" />
          </span>

          <h2>{bookings.length}</h2>

          <p>
            <T en="Total booking requests across your studios." ar="إجمالي طلبات الحجز على استوديوهاتك." />
          </p>

          <div className="admin-badge-stack">
            <span className="badge">
              <T en="Completed:" ar="مكتملة:" /> {completedBookings.length}
            </span>

            <span className="badge">
              <T en="Paid:" ar="مدفوعة:" /> {paidBookings.length}
            </span>

            <span className="badge">
              <T en="Studios:" ar="الاستوديوهات:" /> {studios.length}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Latest Financial Bookings" ar="آخر الحجوزات المالية" />
        </span>

        <h2>
          <T en="Recent booking payment status" ar="حالة دفع آخر الحجوزات" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Date / Time" ar="التاريخ / الوقت" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Booking" ar="الحجز" />
                </th>
                <th>
                  <T en="Payment" ar="الدفع" />
                </th>
                <th>
                  <T en="Settlement" ar="التسوية" />
                </th>
              </tr>
            </thead>

            <tbody>
              {latestFinancialBookings.length ? (
                latestFinancialBookings.map((booking: BookingRow) => {
                  const studio = normalizeStudio(booking.studios);

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                      </td>

                      <td>
                        <strong>{booking.booking_date || "—"}</strong>
                        <p className="admin-muted-line">
                          {booking.start_time || "—"} - {booking.end_time || "—"}
                        </p>
                      </td>

                      <td>{money(booking.total_amount)}</td>

                      <td>
                        <span className="badge" style={statusStyle(booking.status)}>
                          {booking.status || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={statusStyle(booking.payment_status)}
                        >
                          {booking.payment_status || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={statusStyle(booking.settlement_status)}
                        >
                          {booking.settlement_status || "not_ready"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <T
                      en="No booking activity yet."
                      ar="لا يوجد نشاط حجوزات حتى الآن."
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
          <T en="Latest Payouts" ar="آخر البياوت" />
        </span>

        <h2>
          <T en="Recent payout activity" ar="آخر نشاط البياوت" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Payout No." ar="رقم البياوت" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Approved" ar="الاعتماد" />
                </th>
                <th>
                  <T en="Paid" ar="تم الدفع" />
                </th>
              </tr>
            </thead>

            <tbody>
              {payouts.length ? (
                payouts.map((payout: PlatformPayoutRow) => (
                  <tr key={payout.id}>
                    <td>
                      <strong>{payout.payout_number}</strong>
                    </td>

                    <td>{money(payout.total_amount)}</td>

                    <td>
                      <span className="badge" style={statusStyle(payout.status)}>
                        {payout.status}
                      </span>
                    </td>

                    <td>{formatDate(payout.approved_at)}</td>

                    <td>{formatDate(payout.paid_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
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

        <div className="actions">
          <Link href="/owner/payouts" className="btn btn-secondary">
            <T en="View All Payouts" ar="عرض كل البياوت" />
          </Link>
        </div>
      </div>
    </section>
  );
}
