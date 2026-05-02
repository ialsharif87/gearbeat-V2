import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createAuditLog } from "../../../lib/audit";
import T from "../../../components/t";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  owner_auth_user_id: string | null;
};

type BookingRow = {
  id: string;
  studio_id: string;
  customer_auth_user_id: string;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_amount: number | null;
  status: string | null;
  payment_status: string | null;
  settlement_status: string | null;
  payout_status: string | null;
  platform_payment_id: string | null;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
};

type PlatformPaymentRow = {
  id: string;
  source_type: string;
  source_id: string;
  customer_auth_user_id: string;
  provider_type: string;
  provider_id: string;
  amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string;
  gateway: string | null;
  gateway_payment_id: string | null;
  gateway_reference: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PlatformSettlementRow = {
  id: string;
  source_type: string;
  source_id: string;
  provider_type: string;
  provider_id: string;
  payment_id: string | null;
  gross_amount: number | null;
  commission_amount: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  currency: string | null;
  settlement_status: string;
  available_for_payout_at: string | null;
  created_at: string | null;
};

type StudioCommissionRuleRow = {
  id: string;
  owner_auth_user_id: string | null;
  studio_id: string | null;
  commission_type: string;
  commission_value: number | null;
  vat_applicable: boolean;
  status: string;
};

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

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

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function sumValues<T>(rows: T[], getter: (row: T) => number | null | undefined) {
  return rows.reduce((sum: number, row: T) => sum + Number(getter(row) || 0), 0);
}

function statusStyle(status: string | null | undefined) {
  if (
    status === "paid" ||
    status === "completed" ||
    status === "eligible" ||
    status === "paid_out"
  ) {
    return {
      background: "rgba(103, 197, 135, 0.18)",
      color: "var(--gb-success)",
      border: "1px solid rgba(103, 197, 135, 0.45)"
    };
  }

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "voided"
  ) {
    return {
      background: "rgba(226, 109, 90, 0.18)",
      color: "var(--gb-danger)",
      border: "1px solid rgba(226, 109, 90, 0.45)"
    };
  }

  if (
    status === "unpaid" ||
    status === "payment_required" ||
    status === "pending" ||
    status === "not_ready"
  ) {
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

// Unified GearBeat Commission Logic
async function getGearBeatCommissionRule(supabaseAdmin: any, studioId: string) {
  // 1. Get default commission rate
  const { data: globalSettings } = await supabaseAdmin
    .from("commission_settings")
    .select("default_percentage")
    .limit(1)
    .maybeSingle();

  const defaultCommission = globalSettings?.default_percentage || 15;

  // 2. Check for custom studio commission rate
  const { data: customCommission } = await supabaseAdmin
    .from("studio_commissions")
    .select("commission_percentage")
    .eq("studio_id", studioId)
    .maybeSingle();

  return customCommission?.commission_percentage ?? defaultCommission;
}

export default async function AdminStudioPaymentsPage() {
  await requireAdminRole(["super_admin", "operations", "finance"]);

  const supabaseAdmin = createAdminClient();

  async function createPaymentRecord(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = cleanText(formData.get("booking_id"));

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    const { data: bookingData, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        total_amount,
        status,
        payment_status,
        platform_payment_id,
        paid_at,
        studios (
          id,
          name,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as BookingRow;
    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    if (booking.platform_payment_id) {
      throw new Error("This booking already has a payment record.");
    }

    if (booking.payment_status !== "paid") {
      throw new Error("Only paid bookings can be synced into platform payments.");
    }

    const totalAmount = Number(booking.total_amount || 0);

    if (totalAmount <= 0) {
      throw new Error("Booking amount must be greater than zero.");
    }

    const now = new Date().toISOString();

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("platform_payments")
      .insert({
        source_type: "studio_booking",
        source_id: booking.id,
        customer_auth_user_id: booking.customer_auth_user_id,
        provider_type: "studio_owner",
        provider_id: studio.owner_auth_user_id,
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        currency: "SAR",
        payment_status: "paid",
        gateway: "manual",
        gateway_reference: `manual-booking-${booking.id}`,
        paid_at: booking.paid_at || now,
        metadata: {
          created_from: "admin_studio_payments",
          booking_id: booking.id,
          studio_id: booking.studio_id
        }
      })
      .select("id")
      .single();

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    const { error: transactionError } = await supabaseAdmin
      .from("platform_payment_transactions")
      .insert({
        payment_id: payment.id,
        transaction_type: "payment",
        amount: totalAmount,
        status: "succeeded",
        gateway_reference: `manual-booking-${booking.id}`,
        raw_response: {
          source: "manual_admin_sync"
        }
      });

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        platform_payment_id: payment.id,
        paid_at: booking.paid_at || now,
        payment_status: "paid",
        settlement_status:
          booking.status === "completed" ? "eligible" : "pending",
        updated_at: now
      })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      throw new Error(bookingUpdateError.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_booking_payment_record_created",
      entityType: "booking",
      entityId: booking.id,
      oldValues: {
        platform_payment_id: booking.platform_payment_id
      },
      newValues: {
        platform_payment_id: payment.id,
        payment_status: "paid"
      },
      metadata: {
        admin_role: admin.admin_role,
        studio_id: booking.studio_id,
        owner_auth_user_id: studio.owner_auth_user_id
      }
    });

    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/customer/bookings");
  }

  async function createSettlement(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = cleanText(formData.get("booking_id"));

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    const { data: bookingData, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        total_amount,
        status,
        payment_status,
        settlement_status,
        platform_payment_id,
        studios (
          id,
          name,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as BookingRow;
    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    if (booking.payment_status !== "paid") {
      throw new Error("Only paid bookings can be settled.");
    }

    const paymentId = booking.platform_payment_id;

    if (!paymentId) {
      throw new Error("Create payment record before settlement.");
    }

    const { data: existingSettlement } = await supabaseAdmin
      .from("platform_settlements")
      .select("id")
      .eq("source_type", "studio_booking")
      .eq("source_id", booking.id)
      .eq("provider_type", "studio_owner")
      .eq("provider_id", studio.owner_auth_user_id)
      .maybeSingle();

    if (existingSettlement) {
      throw new Error("Settlement already exists for this booking.");
    }

    const grossAmount = Number(booking.total_amount || 0);

    if (grossAmount <= 0) {
      throw new Error("Gross amount must be greater than zero.");
    }

    const commissionPercentage = await getGearBeatCommissionRule(
      supabaseAdmin,
      booking.studio_id
    );

    const commissionAmount = Number(
      ((grossAmount * commissionPercentage) / 100).toFixed(2)
    );

    const taxAmount = 0;
    const netAmount = Math.max(0, grossAmount - commissionAmount);

    const settlementStatus =
      booking.status === "completed" ? "eligible" : "pending";

    const availableForPayoutAt =
      booking.status === "completed" ? new Date().toISOString() : null;

    const { data: settlement, error: settlementError } = await supabaseAdmin
      .from("platform_settlements")
      .insert({
        source_type: "studio_booking",
        source_id: booking.id,
        provider_type: "studio_owner",
        provider_id: studio.owner_auth_user_id,
        payment_id: paymentId,
        gross_amount: grossAmount,
        commission_amount: commissionAmount,
        tax_amount: taxAmount,
        net_amount: netAmount,
        currency: "SAR",
        settlement_status: settlementStatus,
        available_for_payout_at: availableForPayoutAt
      })
      .select("id")
      .single();

    if (settlementError) {
      throw new Error(settlementError.message);
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        settlement_status: settlementStatus,
        payout_status: "not_started",
        updated_at: new Date().toISOString()
      })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      throw new Error(bookingUpdateError.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_booking_settlement_created",
      entityType: "platform_settlement",
      entityId: settlement.id,
      oldValues: {},
      newValues: {
        settlement_status: settlementStatus,
        gross_amount: grossAmount,
        commission_amount: commissionAmount,
        net_amount: netAmount
      },
      metadata: {
        admin_role: admin.admin_role,
        booking_id: booking.id,
        studio_id: booking.studio_id,
        owner_auth_user_id: studio.owner_auth_user_id,
        commission_percentage: commissionPercentage
      }
    });

    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  const { data: bookingsData, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      studio_id,
      customer_auth_user_id,
      booking_date,
      start_time,
      end_time,
      total_amount,
      status,
      payment_status,
      settlement_status,
      payout_status,
      platform_payment_id,
      paid_at,
      completed_at,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district,
        owner_auth_user_id
      )
    `)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData || []) as BookingRow[];

  const { data: paymentsData } = await supabaseAdmin
    .from("platform_payments")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("provider_type", "studio_owner")
    .order("created_at", { ascending: false });

  const payments = (paymentsData || []) as PlatformPaymentRow[];

  const { data: settlementsData } = await supabaseAdmin
    .from("platform_settlements")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("provider_type", "studio_owner")
    .order("created_at", { ascending: false });

  const settlements = (settlementsData || []) as PlatformSettlementRow[];

  const paymentByBookingId = new Map<string, PlatformPaymentRow>(
    payments.map((payment: PlatformPaymentRow) => [payment.source_id, payment])
  );

  const settlementByBookingId = new Map<string, PlatformSettlementRow>(
    settlements.map((settlement: PlatformSettlementRow) => [
      settlement.source_id,
      settlement
    ])
  );

  const paidBookings = bookings.filter(
    (booking: BookingRow) => booking.payment_status === "paid"
  );

  const bookingsNeedingPaymentRecord = paidBookings.filter(
    (booking: BookingRow) => !booking.platform_payment_id
  );

  const bookingsReadyForSettlement = paidBookings.filter(
    (booking: BookingRow) =>
      booking.platform_payment_id && !settlementByBookingId.has(booking.id)
  );

  const totalPaidBookingAmount = sumValues(
    paidBookings,
    (booking: BookingRow) => booking.total_amount
  );

  const totalPlatformPaidAmount = sumValues(
    payments.filter(
      (payment: PlatformPaymentRow) => payment.payment_status === "paid"
    ),
    (payment: PlatformPaymentRow) => payment.total_amount
  );

  const totalSettlementNetAmount = sumValues(
    settlements,
    (settlement: PlatformSettlementRow) => settlement.net_amount
  );

  const totalCommissionAmount = sumValues(
    settlements,
    (settlement: PlatformSettlementRow) => settlement.commission_amount
  );

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Finance" ar="إدارة المالية" />
        </span>

        <h1>
          <T en="Studio Payments" ar="مدفوعات الاستوديو" />
        </h1>

        <p>
          <T
            en="Monitor studio booking payments, sync old paid bookings into platform payments, and create settlements for payout."
            ar="راقب مدفوعات حجوزات الاستوديو، واربط الحجوزات المدفوعة القديمة بسجلات الدفع، وأنشئ التسويات للبياوت."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/owner-bank-accounts" className="btn btn-secondary">
          <T en="Owner Bank Accounts" ar="حسابات الملاك البنكية" />
        </Link>

        <Link href="/admin/studio-payouts" className="btn btn-secondary">
          <T en="Studio Payouts" ar="بياوت الاستوديو" />
        </Link>

        <Link href="/admin/bookings" className="btn btn-secondary">
          <T en="Bookings" ar="الحجوزات" />
        </Link>
      </div>

      {bookingsError ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{bookingsError.message}</p>
        </div>
      ) : null}

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Bookings" ar="الحجوزات المدفوعة" />
          </span>
          <strong>{paidBookings.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Booking Amount" ar="مبلغ الحجوزات المدفوعة" />
          </span>
          <strong>{money(totalPaidBookingAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Platform Paid Amount" ar="مبلغ الدفع المسجل" />
          </span>
          <strong>{money(totalPlatformPaidAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Need Payment Record" ar="تحتاج سجل دفع" />
          </span>
          <strong>{bookingsNeedingPaymentRecord.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Ready for Settlement" ar="جاهزة للتسوية" />
          </span>
          <strong>{bookingsReadyForSettlement.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Net Settlements" ar="صافي التسويات" />
          </span>
          <strong>{money(totalSettlementNetAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Commission" ar="العمولة" />
          </span>
          <strong>{money(totalCommissionAmount)}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Booking Payment Readiness" ar="جاهزية دفع الحجوزات" />
        </span>

        <h2>
          <T en="Booking finance list" ar="قائمة مالية الحجوزات" />
        </h2>

        <p>
          <T
            en="Only paid bookings can be converted into platform payments and settlements."
            ar="فقط الحجوزات المدفوعة يمكن تحويلها إلى سجلات دفع وتسويات."
          />
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Booking" ar="الحجز" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Payment Record" ar="سجل الدفع" />
                </th>
                <th>
                  <T en="Settlement" ar="التسوية" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.length ? (
                bookings.map((booking: BookingRow) => {
                  const studio = normalizeStudio(booking.studios);
                  const payment = paymentByBookingId.get(booking.id);
                  const settlement = settlementByBookingId.get(booking.id);

                  const canCreatePaymentRecord =
                    booking.payment_status === "paid" &&
                    !booking.platform_payment_id;

                  const canCreateSettlement =
                    booking.payment_status === "paid" &&
                    Boolean(booking.platform_payment_id) &&
                    !settlement;

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p className="admin-muted-line">
                          {studio?.city || ""}
                          {studio?.district ? ` · ${studio.district}` : ""}
                        </p>
                        <p className="admin-muted-line">
                          <small>{studio?.owner_auth_user_id || "No owner"}</small>
                        </p>
                      </td>

                      <td>
                        <strong>{booking.booking_date || "—"}</strong>
                        <p className="admin-muted-line">
                          {booking.start_time || "—"} - {booking.end_time || "—"}
                        </p>
                        <p className="admin-muted-line">
                          <T en="Created:" ar="تم الإنشاء:" />{" "}
                          {formatDate(booking.created_at)}
                        </p>
                      </td>

                      <td>{money(booking.total_amount)}</td>

                      <td>
                        <div className="admin-badge-stack">
                          <span className="badge" style={statusStyle(booking.status)}>
                            {booking.status || "—"}
                          </span>

                          <span
                            className="badge"
                            style={statusStyle(booking.payment_status)}
                          >
                            {booking.payment_status || "—"}
                          </span>

                          <span
                            className="badge"
                            style={statusStyle(booking.settlement_status)}
                          >
                            {booking.settlement_status || "not_ready"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {payment ? (
                          <>
                            <span
                              className="badge"
                              style={statusStyle(payment.payment_status)}
                            >
                              {payment.payment_status}
                            </span>
                            <p className="admin-muted-line">
                              {money(payment.total_amount)}
                            </p>
                            <p className="admin-muted-line">
                              {formatDate(payment.paid_at)}
                            </p>
                          </>
                        ) : booking.platform_payment_id ? (
                          <>
                            <span className="badge">
                              <T en="Linked" ar="مرتبط" />
                            </span>
                            <p className="admin-muted-line">
                              {booking.platform_payment_id}
                            </p>
                          </>
                        ) : (
                          <span className="badge">
                            <T en="Missing" ar="غير موجود" />
                          </span>
                        )}
                      </td>

                      <td>
                        {settlement ? (
                          <>
                            <span
                              className="badge"
                              style={statusStyle(settlement.settlement_status)}
                            >
                              {settlement.settlement_status}
                            </span>

                            <p className="admin-muted-line">
                              <T en="Gross:" ar="الإجمالي:" />{" "}
                              {money(settlement.gross_amount)}
                            </p>

                            <p className="admin-muted-line">
                              <T en="Commission:" ar="العمولة:" />{" "}
                              {money(settlement.commission_amount)}
                            </p>

                            <p className="admin-muted-line">
                              <T en="Net:" ar="الصافي:" />{" "}
                              {money(settlement.net_amount)}
                            </p>
                          </>
                        ) : (
                          <span className="badge">
                            <T en="No settlement" ar="لا توجد تسوية" />
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="admin-studio-actions">
                          <div className="actions">
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="btn btn-small"
                            >
                              <T en="Booking Details" ar="تفاصيل الحجز" />
                            </Link>

                            {studio?.slug ? (
                              <Link
                                href={`/studios/${studio.slug}`}
                                className="btn btn-secondary btn-small"
                              >
                                <T en="Studio" ar="الاستوديو" />
                              </Link>
                            ) : null}
                          </div>

                          <div className="admin-inline-action-grid">
                            {canCreatePaymentRecord ? (
                              <form action={createPaymentRecord}>
                                <input
                                  type="hidden"
                                  name="booking_id"
                                  value={booking.id}
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Create Payment Record" ar="إنشاء سجل دفع" />
                                </button>
                              </form>
                            ) : null}

                            {canCreateSettlement ? (
                              <form action={createSettlement}>
                                <input
                                  type="hidden"
                                  name="booking_id"
                                  value={booking.id}
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Create Settlement" ar="إنشاء تسوية" />
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T en="No bookings found." ar="لا توجد حجوزات." />
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
