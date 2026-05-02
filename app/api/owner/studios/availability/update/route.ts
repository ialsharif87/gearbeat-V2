import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type DbRow = Record<string, unknown>;

type RuleInput = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  bufferMinutes: number;
};

type ExceptionInput = {
  exceptionDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
};

function readText(row: DbRow | null | undefined, keys: string[]) {
  if (!row) return "";

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function userOwnsStudio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  studioId: string
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
      .select("id")
      .eq("id", studioId)
      .eq(ownerColumn, userId)
      .maybeSingle();

    if (!error && data) {
      return true;
    }
  }

  return false;
}

function normalizeRules(input: unknown): RuleInput[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const row = item as Partial<RuleInput>;

      return {
        dayOfWeek: Number(row.dayOfWeek),
        isOpen: Boolean(row.isOpen),
        openTime: typeof row.openTime === "string" ? row.openTime : "",
        closeTime: typeof row.closeTime === "string" ? row.closeTime : "",
        slotMinutes: Number(row.slotMinutes || 60),
        bufferMinutes: Number(row.bufferMinutes || 0),
      };
    })
    .filter((rule) => {
      if (rule.dayOfWeek < 0 || rule.dayOfWeek > 6) return false;
      if (rule.slotMinutes < 15 || rule.slotMinutes > 720) return false;
      if (rule.bufferMinutes < 0 || rule.bufferMinutes > 240) return false;

      if (!rule.isOpen) return true;

      return isValidTime(rule.openTime) && isValidTime(rule.closeTime);
    });
}

function normalizeExceptions(input: unknown): ExceptionInput[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const row = item as Partial<ExceptionInput>;

      return {
        exceptionDate:
          typeof row.exceptionDate === "string" ? row.exceptionDate : "",
        isClosed: Boolean(row.isClosed),
        openTime: typeof row.openTime === "string" ? row.openTime : "",
        closeTime: typeof row.closeTime === "string" ? row.closeTime : "",
        reason: typeof row.reason === "string" ? row.reason.trim() : "",
      };
    })
    .filter((exception) => {
      if (!isValidDate(exception.exceptionDate)) return false;
      if (exception.isClosed) return true;

      return (
        isValidTime(exception.openTime) && isValidTime(exception.closeTime)
      );
    });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  const studioId =
    typeof body?.studioId === "string" ? body.studioId.trim() : "";

  if (!studioId) {
    return NextResponse.json(
      { error: "Studio ID is required." },
      { status: 400 }
    );
  }

  const ownsStudio = await userOwnsStudio(supabase, user.id, studioId);

  if (!ownsStudio) {
    return NextResponse.json(
      { error: "You do not have permission to manage this studio." },
      { status: 403 }
    );
  }

  const rules = normalizeRules(body?.rules);
  const exceptions = normalizeExceptions(body?.exceptions);

  if (rules.length !== 7) {
    return NextResponse.json(
      { error: "Availability must include all 7 days." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const ruleRows = rules.map((rule) => ({
    studio_id: studioId,
    day_of_week: rule.dayOfWeek,
    is_open: rule.isOpen,
    open_time: rule.isOpen ? rule.openTime : null,
    close_time: rule.isOpen ? rule.closeTime : null,
    slot_minutes: rule.slotMinutes,
    buffer_minutes: rule.bufferMinutes,
    updated_at: now,
  }));

  const { error: rulesError } = await supabase
    .from("studio_availability_rules")
    .upsert(ruleRows, {
      onConflict: "studio_id,day_of_week",
    });

  if (rulesError) {
    return NextResponse.json(
      { error: rulesError.message },
      { status: 500 }
    );
  }

  const { error: deleteExceptionsError } = await supabase
    .from("studio_availability_exceptions")
    .delete()
    .eq("studio_id", studioId);

  if (deleteExceptionsError) {
    return NextResponse.json(
      { error: deleteExceptionsError.message },
      { status: 500 }
    );
  }

  if (exceptions.length > 0) {
    const exceptionRows = exceptions.map((exception) => ({
      studio_id: studioId,
      exception_date: exception.exceptionDate,
      is_closed: exception.isClosed,
      open_time: exception.isClosed ? null : exception.openTime,
      close_time: exception.isClosed ? null : exception.closeTime,
      reason: exception.reason || null,
      updated_at: now,
    }));

    const { error: exceptionsError } = await supabase
      .from("studio_availability_exceptions")
      .insert(exceptionRows);

    if (exceptionsError) {
      return NextResponse.json(
        { error: exceptionsError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    studioId,
  });
}
