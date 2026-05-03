import Link from "next/link";
import OwnerFinanceReport, {
  type OwnerFinanceRow,
} from "@/components/owner-finance-report";
import { createClient } from "@/lib/supabase/server";
import {
  requireOwnerOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "@/lib/auth-guards";
import T from "@/components/t";

export const dynamic = "force-dynamic";

type CommissionSetting = {
  scopeType: string;
  scopeId: string;
  commissionRate: number;
  isActive: boolean;
};

function normalizeCommission(row: DbRow): CommissionSetting {
  return {
    scopeType: readText(row, ["scope_type"]),
    scopeId: readText(row, ["scope_id"]),
    commissionRate: readNumber(row, ["commission_rate"], 15),
    isActive: Boolean(row.is_active),
  };
}

function getCommissionRate(
  settings: CommissionSetting[],
  options: {
    studioId?: string;
  }
) {
  const activeSettings = settings.filter((setting) => setting.isActive);

  if (options.studioId) {
    const studioRule = activeSettings.find(
      (setting) =>
        setting.scopeType === "studio" && setting.scopeId === options.studioId
    );

    if (studioRule) return studioRule.commissionRate;
  }

  const studioBookingRule = activeSettings.find(
    (setting) =>
      setting.scopeType === "service_type" &&
      setting.scopeId === "studio_booking"
  );

  if (studioBookingRule) return studioBookingRule.commissionRate;

  const globalRule = activeSettings.find(
    (setting) => setting.scopeType === "global"
  );

  return globalRule?.commissionRate || 15;
}

async function fetchCommissionSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<CommissionSetting[]> {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*");

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeCommission);
}

async function fetchOwnedStudios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string
): Promise<DbRow[]> {
  const ownerColumnCandidates = [
    "owner_auth_user_id",
    "owner_id",
    "user_id",
    "created_by",
    "profile_id",
  ];

  for (const ownerColumn of ownerColumnCandidates) {
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq(ownerColumn, ownerId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as DbRow[];
    }
  }

  return [];
}

async function fetchBookingsForStudios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studioIds: string[]
): Promise<DbRow[]> {
  if (studioIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("studio_id", studioIds)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    return [];
  }

  return data as DbRow[];
}

async function fetchPaymentSessionsByBookingId(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

function normalizeBookingRow(
  booking: DbRow,
  studio: DbRow | undefined,
  paymentSession: DbRow | undefined,
  settings: CommissionSetting[]
): OwnerFinanceRow {
  const id = readText(booking, ["id"]);
  const studioId = readText(booking, ["studio_id"]);

  const studioName = readText(
    studio,
    ["name", "title", "studio_name"],
    "Studio"
  );

  const grossAmount = readNumber(booking, [
    "total_amount",
    "total_price",
    "amount",
    "price",
    "subtotal",
  ]);

  const commissionRate = getCommissionRate(settings, {
    studioId,
  });

  const commissionAmount = grossAmount * (commissionRate / 100);
  const netPayable = grossAmount - commissionAmount;

  const paymentStatus =
    readText(booking, ["payment_status", "payment_state"]) ||
    readText(paymentSession, ["status", "payment_status"]) ||
    "pending";

  const startTime = readText(booking, [
    "start_time",
    "starts_at",
    "booking_start",
    "start_at",
    "date",
  ]);

  const endTime = readText(booking, [
    "end_time",
    "ends_at",
    "booking_end",
    "end_at",
  ]);

  return {
    id,
    studioId,
    studioName,
    bookingLabel: readText(booking, ["booking_number", "reference", "id"], "Booking"),
    grossAmount,
    commissionRate,
    commissionAmount,
    netPayable,
    currency: readText(booking, ["currency"], "SAR"),
    paymentStatus,
    bookingStatus: readText(booking, ["status"], "unknown"),
    startTime,
    endTime,
    createdAt: readText(booking, ["created_at"]),
  };
}

export default async function OwnerFinancePage() {
  const supabase = await createClient();

  const { user } = await requireOwnerOrRedirect(supabase);

  const [settings, studios] = await Promise.all([
    fetchCommissionSettings(supabase),
    fetchOwnedStudios(supabase, user.id),
  ]);

  const studiosById = new Map<string, DbRow>();

  for (const studio of studios) {
    const studioId = readText(studio, ["id"]);

    if (studioId) {
      studiosById.set(studioId, studio);
    }
  }

  const studioIds = Array.from(studiosById.keys());
  const bookings = await fetchBookingsForStudios(supabase, studioIds);

  const bookingIds = bookings
    .map((booking) => readText(booking, ["id"]))
    .filter(Boolean) as string[];

  const paymentSessionsByBookingId = await fetchPaymentSessionsByBookingId(
    supabase,
    bookingIds
  );

  const rows = bookings.map((booking) => {
    const bookingId = readText(booking, ["id"]);
    const studioId = readText(booking, ["studio_id"]);

    return normalizeBookingRow(
      booking,
      studiosById.get(studioId),
      paymentSessionsByBookingId.get(bookingId),
      settings
    );
  });

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1>
            <T en="Finance" ar="المالية" />
          </h1>
          <p className="gb-muted-text">
            <T
              en="Track your studio booking revenue, GearBeat commission, and estimated net payable balance."
              ar="تابع إيرادات حجوزات استوديوك وعمولة GearBeat والرصيد الصافي المستحق."
            />
          </p>
        </div>

        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          <T en="Back" ar="رجوع" />
        </Link>
      </section>

      <OwnerFinanceReport rows={rows} />
    </main>
  );
}
