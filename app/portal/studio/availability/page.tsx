import Link from "next/link";
import { redirect } from "next/navigation";
import StudioAvailabilityManager from "@/components/studio-availability-manager";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export const dynamic = "force-dynamic";

type DbRow = Record<string, unknown>;

type AvailabilityRule = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  bufferMinutes: number;
  pricePerHour: number;
};

type AvailabilityException = {
  id: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
  pricePerHour?: number | null;
};

type PricingRule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  currency: string;
  isActive: boolean;
};



function readText(row: DbRow | null | undefined, keys: string[], fallback = "") {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

async function fetchOwnedStudios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const ownerColumnCandidates = [
    "owner_id",
    "user_id",
    "created_by",
    "profile_id",
    "owner_auth_user_id"
  ];

  for (const ownerColumn of ownerColumnCandidates) {
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq(ownerColumn, userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as DbRow[];
    }
  }

  return [];
}

function normalizeRule(row: DbRow): AvailabilityRule {
  return {
    dayOfWeek: Number(row.day_of_week),
    isOpen: Boolean(row.is_open),
    openTime: (readText(row, ["open_time"]) || "09:00").slice(0, 5),
    closeTime: (readText(row, ["close_time"]) || "18:00").slice(0, 5),
    slotMinutes:
      typeof row.slot_minutes === "number" ? row.slot_minutes : 60,
    bufferMinutes:
      typeof row.buffer_minutes === "number" ? row.buffer_minutes : 0,
    pricePerHour:
      typeof row.price_per_hour === "number" ? row.price_per_hour : 0,
  };
}

function normalizeException(row: DbRow): AvailabilityException {
  return {
    id: readText(row, ["id"]),
    startDate: readText(row, ["start_date", "exception_date"]),
    endDate: readText(row, ["end_date"]) || readText(row, ["start_date", "exception_date"]),
    isClosed: Boolean(row.is_closed),
    openTime: (readText(row, ["open_time"]) || "09:00").slice(0, 5),
    closeTime: (readText(row, ["close_time"]) || "18:00").slice(0, 5),
    reason: readText(row, ["reason"]),
    pricePerHour: typeof row.price_per_hour === "number" ? row.price_per_hour : null,
  };
}

function normalizePricingRule(row: DbRow): PricingRule {
  return {
    id: readText(row, ["id"]),
    dayOfWeek: Number(row.day_of_week),
    startTime: (readText(row, ["start_time"]) || "09:00").slice(0, 5),
    endTime: (readText(row, ["end_time"]) || "18:00").slice(0, 5),
    pricePerHour: typeof row.price_per_hour === "number" ? row.price_per_hour : 0,
    currency: readText(row, ["currency"]) || "SAR",
    isActive: Boolean(row.is_active),
  };
}

export default async function StudioAvailabilityPage({
  searchParams,
}: {
  searchParams?: Promise<{ studioId?: string; slug?: string }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }


  const requestedStudioId =
    typeof resolvedSearchParams.studioId === "string"
      ? resolvedSearchParams.studioId
      : "";

  const ownedStudios = await fetchOwnedStudios(supabase, user.id);

  const selectedStudio =
    ownedStudios.find(
      (studio) => readText(studio, ["id"]) === requestedStudioId
    ) || ownedStudios[0];

  const selectedStudioId = readText(selectedStudio, ["id"]);
  const selectedStudioName = readText(
    selectedStudio,
    ["name", "title", "studio_name"],
    "Studio"
  );

  let initialRules: AvailabilityRule[] = [];
  let initialExceptions: AvailabilityException[] = [];
  let initialPricingRules: PricingRule[] = [];

  if (selectedStudioId) {
    const { data: rules } = await supabase
      .from("studio_availability_rules")
      .select("*")
      .eq("studio_id", selectedStudioId)
      .order("day_of_week", { ascending: true });

    const { data: exceptions } = await supabase
      .from("studio_availability_exceptions")
      .select("*")
      .eq("studio_id", selectedStudioId)
      .order("start_date", { ascending: true });

    const { data: pricingRules } = await supabase
      .from("studio_availability_pricing_rules")
      .select("*")
      .eq("studio_id", selectedStudioId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    initialRules = ((rules || []) as DbRow[]).map(normalizeRule);
    initialExceptions = ((exceptions || []) as DbRow[]).map(normalizeException);
    initialPricingRules = ((pricingRules || []) as DbRow[]).map(normalizePricingRule);
  }

  return (
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Studio Availability" ar="أوقات الاستوديو" />
          </h1>
          <p className="gb-muted-text" style={{ marginTop: '8px' }}>
            <T
              en="Manage working hours, closed days, booking slots, and special date exceptions for your studios."
              ar="أدر ساعات العمل والأيام المغلقة وفترات الحجز والاستثناءات الخاصة."
            />
          </p>
        </div>

        <Link href="/portal/studio" className="gb-button gb-button-outline">
          <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
        </Link>
      </section>

      {ownedStudios.length === 0 ? (
        <section className="gb-card gb-empty-state" style={{ padding: '80px 40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            <T en="No studios found" ar="لا توجد استوديوهات" />
          </h2>
          <p className="gb-muted-text">
            <T
              en="No studios linked to this account yet."
              ar="لا توجد استوديوهات مرتبطة بهذا الحساب بعد."
            />
          </p>
        </section>
      ) : (
        <div className="gb-dashboard-stack" style={{ gap: '32px' }}>
          <section className="gb-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                  <T en="Select Studio" ar="اختر الاستوديو" />
                </h3>
                <p className="gb-muted-text" style={{ fontSize: '0.85rem' }}>
                  <T en="Switch between your managed studios" ar="تنقل بين استوديوهاتك المدارة" />
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {ownedStudios.map((studio) => {
                const studioId = readText(studio, ["id"]);
                const studioName = readText(
                  studio,
                  ["name", "title", "studio_name"],
                  "Studio"
                );

                const isSelected = studioId === selectedStudioId;

                return (
                  <Link
                    key={studioId}
                    href={`/portal/studio/availability?studioId=${studioId}`}
                    className={`gb-button ${isSelected ? 'gb-button-primary' : 'gb-button-outline'}`}
                    style={{ 
                      padding: '12px 24px',
                      borderRadius: '16px',
                      minWidth: '140px',
                      justifyContent: 'center'
                    }}
                  >
                    {studioName}
                  </Link>
                );
              })}
            </div>
          </section>

          <StudioAvailabilityManager
            studioId={selectedStudioId}
            studioName={selectedStudioName}
            initialRules={initialRules}
            initialExceptions={initialExceptions}
            initialPricingRules={initialPricingRules}
          />
        </div>
      )}
    </main>
  );
}
