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
};

type AvailabilityException = {
  id: string;
  exceptionDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
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
  };
}

function normalizeException(row: DbRow): AvailabilityException {
  return {
    id: readText(row, ["id"]),
    exceptionDate: readText(row, ["exception_date"]),
    isClosed: Boolean(row.is_closed),
    openTime: (readText(row, ["open_time"]) || "09:00").slice(0, 5),
    closeTime: (readText(row, ["close_time"]) || "18:00").slice(0, 5),
    reason: readText(row, ["reason"]),
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
      .order("exception_date", { ascending: true });

    initialRules = ((rules || []) as DbRow[]).map(normalizeRule);
    initialExceptions = ((exceptions || []) as DbRow[]).map(normalizeException);
  }

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1>
            <T en="Studio Availability" ar="أوقات الاستوديو" />
          </h1>
          <p className="gb-muted-text">
            <T
              en="Manage working hours, closed days, booking slots, and special date exceptions for your studios."
              ar="أدر ساعات العمل والأيام المغلقة وفترات الحجز والاستثناءات الخاصة."
            />
          </p>
        </div>

        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          <T en="Back" ar="رجوع" />
        </Link>
      </section>

      {ownedStudios.length === 0 ? (
        <section className="gb-empty-state">
          <h2>
            <T en="No studios found" ar="لا توجد استوديوهات" />
          </h2>
          <p>
            <T
              en="No studios linked to this account yet."
              ar="لا توجد استوديوهات مرتبطة بهذا الحساب بعد."
            />
          </p>
        </section>
      ) : null}

      {ownedStudios.length > 0 ? (
        <>
          <section className="gb-card" style={{ marginBottom: '24px' }}>
            <p className="gb-eyebrow">
              <T en="Select studio" ar="اختر استوديو" />
            </p>
            <div className="gb-action-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
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
                    className={
                      isSelected
                        ? "gb-button"
                        : "gb-button gb-button-secondary"
                    }
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
          />
        </>
      ) : null}
    </main>
  );
}
