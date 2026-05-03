import Link from "next/link";
import CustomerPaymentsReport, {
  type CustomerPaymentRow,
} from "../../../components/customer-payments-report";
import { createClient } from "../../../lib/supabase/server";
import {
  requireCustomerOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

type SupabaseAny = any;

async function fetchMarketplaceOrdersForCustomer(
  supabase: SupabaseAny,
  userId: string
): Promise<DbRow[]> {
  const customerColumnCandidates = [
    "customer_id",
    "user_id",
    "client_id",
    "profile_id",
    "created_by",
  ];

  let emptyResult: DbRow[] = [];

  for (const customerColumn of customerColumnCandidates) {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .select("*")
      .eq(customerColumn, userId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      if ((data as DbRow[]).length > 0) {
        return data as DbRow[];
      }

      emptyResult = data as DbRow[];
    }
  }

  return emptyResult;
}

async function fetchBookingsForCustomer(
  supabase: SupabaseAny,
  userId: string
): Promise<DbRow[]> {
  const customerColumnCandidates = [
    "customer_id",
    "user_id",
    "client_id",
    "profile_id",
    "created_by",
  ];

  let emptyResult: DbRow[] = [];

  for (const customerColumn of customerColumnCandidates) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq(customerColumn, userId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      if ((data as DbRow[]).length > 0) {
        return data as DbRow[];
      }

      emptyResult = data as DbRow[];
    }
  }

  return emptyResult;
}

async function fetchStudiosMap(
  supabase: SupabaseAny,
  studioIds: string[]
): Promise<Map<string, DbRow>> {
  const map = new Map<string, DbRow>();

  if (studioIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .in("id", studioIds);

  if (error || !data) {
    return map;
  }

  for (const studio of data as DbRow[]) {
    const id = readText(studio, ["id"]);

    if (id) {
      map.set(id, studio);
    }
  }

  return map;
}

async function fetchPaymentSessionsByBookingId(
  supabase: SupabaseAny,
  bookingIds: string[]
): Promise<Map<string, DbRow>> {
  const map = new Map<string, DbRow>();

  if (bookingIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("checkout_payment_sessions")
    .select("*")
    .in("booking_id", bookingIds);

  if (error || !data) {
    return map;
  }

  for (const session of data as DbRow[]) {
    const bookingId = readText(session, ["booking_id"]);

    if (bookingId) {
      map.set(bookingId, session);
    }
  }

  return map;
}

async function fetchPaymentSessionsByOrderId(
  supabase: SupabaseAny,
  orderIds: string[]
): Promise<Map<string, DbRow>> {
  const map = new Map<string, DbRow>();

  if (orderIds.length === 0) {
    return map;
  }

  const orderColumnCandidates = ["order_id", "marketplace_order_id"];

  for (const orderColumn of orderColumnCandidates) {
    const { data, error } = await supabase
      .from("checkout_payment_sessions")
      .select("*")
      .in(orderColumn, orderIds);

    if (!error && data) {
      for (const session of data as DbRow[]) {
        const orderId = readText(session, [orderColumn]);

        if (orderId) {
          map.set(orderId, session);
        }
      }

      if (map.size > 0) {
        return map;
      }
    }
  }

  return map;
}

function buildReceiptNumber(prefix: string, id: string) {
  const cleanId = id.replace(/-/g, "").slice(0, 8).toUpperCase();

  return `${prefix}-${cleanId || "RECEIPT"}`;
}

function normalizeMarketplaceOrder(
  order: DbRow,
  paymentSession: DbRow | undefined
): CustomerPaymentRow {
  const id = readText(order, ["id"]);

  const paymentStatus =
    readText(order, ["payment_status", "payment_state", "paymentStatus"]) ||
    readText(paymentSession, ["status", "payment_status"]) ||
    "pending";

  return {
    id,
    receiptNumber: buildReceiptNumber("MKT", id),
    sourceType: "marketplace_order",
    sourceLabel: "Marketplace order",
    description: readText(order, ["order_number", "reference", "id"], "Marketplace order"),
    amount: readNumber(order, [
      "total_amount",
      "grand_total",
      "total_price",
      "amount",
      "subtotal",
    ]),
    currency: readText(order, ["currency"], "SAR"),
    paymentStatus,
    status: readText(order, ["status", "order_status"], "unknown"),
    createdAt: readText(order, ["created_at"]),
    actionUrl: "/customer/marketplace-orders",
  };
}

function normalizeBooking(
  booking: DbRow,
  studio: DbRow | undefined,
  paymentSession: DbRow | undefined
): CustomerPaymentRow {
  const id = readText(booking, ["id"]);

  const studioName = readText(
    studio,
    ["name", "title", "studio_name"],
    "Studio booking"
  );

  const startTime = readText(booking, [
    "start_time",
    "starts_at",
    "booking_start",
    "start_at",
    "date",
  ]);

  const paymentStatus =
    readText(booking, ["payment_status", "payment_state"]) ||
    readText(paymentSession, ["status", "payment_status"]) ||
    "pending";

  return {
    id,
    receiptNumber: buildReceiptNumber("STU", id),
    sourceType: "studio_booking",
    sourceLabel: "Studio booking",
    description: startTime ? `${studioName} — ${startTime}` : studioName,
    amount: readNumber(booking, [
      "total_amount",
      "total_price",
      "amount",
      "price",
      "subtotal",
    ]),
    currency: readText(booking, ["currency"], "SAR"),
    paymentStatus,
    status: readText(booking, ["status"], "unknown"),
    createdAt: readText(booking, ["created_at"]),
    actionUrl: "/customer",
  };
}

export default async function CustomerPaymentsPage() {
  const supabase = await createClient();

  const { user } = await requireCustomerOrRedirect(supabase);

  const [orders, bookings] = await Promise.all([
    fetchMarketplaceOrdersForCustomer(supabase, user.id),
    fetchBookingsForCustomer(supabase, user.id),
  ]);

  const orderIds = orders
    .map((order) => readText(order, ["id"]))
    .filter(Boolean) as string[];

  const bookingIds = bookings
    .map((booking) => readText(booking, ["id"]))
    .filter(Boolean) as string[];

  const studioIds = Array.from(
    new Set(
      bookings
        .map((booking) => readText(booking, ["studio_id"]))
        .filter(Boolean) as string[]
    )
  );

  const [studiosMap, bookingSessionsMap, orderSessionsMap] =
    await Promise.all([
      fetchStudiosMap(supabase, studioIds),
      fetchPaymentSessionsByBookingId(supabase, bookingIds),
      fetchPaymentSessionsByOrderId(supabase, orderIds),
    ]);

  const marketplaceRows = orders.map((order) => {
    const orderId = readText(order, ["id"]);

    return normalizeMarketplaceOrder(order, orderSessionsMap.get(orderId));
  });

  const bookingRows = bookings.map((booking) => {
    const bookingId = readText(booking, ["id"]);
    const studioId = readText(booking, ["studio_id"]);

    return normalizeBooking(
      booking,
      studiosMap.get(studioId),
      bookingSessionsMap.get(bookingId)
    );
  });

  const rows: CustomerPaymentRow[] = [...marketplaceRows, ...bookingRows].sort(
    (a, b) => {
      const dateA = a.createdAt || "";
      const dateB = b.createdAt || "";
      return dateB.localeCompare(dateA);
    }
  );

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">Customer dashboard</p>
          <h1>Payments & Receipts</h1>
          <p className="gb-muted-text">
            View your marketplace order payments, studio booking payments, and
            internal GearBeat receipts.
          </p>
        </div>

        <Link href="/customer" className="btn">
          Back to customer dashboard
        </Link>
      </section>

      <div className="gb-customer-shell">
        <CustomerPaymentsReport rows={rows} />
      </div>
    </main>
  );
}
