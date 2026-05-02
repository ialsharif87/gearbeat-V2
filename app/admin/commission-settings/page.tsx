import Link from "next/link";
import { redirect } from "next/navigation";
import AdminCommissionSettingsManager from "../../../components/admin-commission-settings-manager";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

type DbRow = Record<string, unknown>;

type CommissionScopeType =
  | "global"
  | "studio"
  | "vendor"
  | "product"
  | "service_type";

type CommissionSetting = {
  id?: string;
  scopeType: CommissionScopeType;
  scopeId: string;
  scopeLabel: string;
  commissionRate: number;
  isActive: boolean;
  notes: string;
};

type TargetOption = {
  scopeType: CommissionScopeType;
  id: string;
  label: string;
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

function readNumber(row: DbRow | null | undefined, keys: string[], fallback = 0) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function normalizeSetting(row: DbRow): CommissionSetting {
  return {
    id: readText(row, ["id"]),
    scopeType: readText(row, ["scope_type"], "global") as CommissionScopeType,
    scopeId: readText(row, ["scope_id"]),
    scopeLabel: readText(row, ["scope_label"], "Global default commission"),
    commissionRate: readNumber(row, ["commission_rate"], 15),
    isActive: Boolean(row.is_active),
    notes: readText(row, ["notes"]),
  };
}

async function isAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  appMetadataRole?: string,
  userMetadataRole?: string
) {
  if (appMetadataRole === "admin" || userMetadataRole === "admin") {
    return true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const profileRow = (profile || null) as DbRow | null;

  const role = readText(profileRow, [
    "role",
    "user_role",
    "account_type",
    "type",
  ]);

  return role === "admin" || role === "super_admin";
}

async function fetchCommissionSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<CommissionSetting[]> {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*")
    .order("scope_type", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeSetting);
}

async function fetchStudioOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TargetOption[]> {
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .limit(100);

  if (error || !data) {
    return [];
  }

  return (data as DbRow[])
    .map((studio) => {
      const id = readText(studio, ["id"]);
      const label = readText(
        studio,
        ["name", "title", "studio_name"],
        "Studio"
      );

      return {
        scopeType: "studio" as CommissionScopeType,
        id,
        label,
      };
    })
    .filter((item) => Boolean(item.id));
}

async function fetchVendorOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TargetOption[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(200);

  if (error || !data) {
    return [];
  }

  return (data as DbRow[])
    .filter((profile) => {
      const role = readText(profile, [
        "role",
        "user_role",
        "account_type",
        "type",
      ]);

      return (
        role === "vendor" ||
        role === "owner" ||
        role === "studio_owner" ||
        role === "seller"
      );
    })
    .map((profile) => {
      const id = readText(profile, ["id", "user_id"]);
      const label = readText(
        profile,
        ["full_name", "name", "display_name", "email"],
        "Vendor"
      );

      return {
        scopeType: "vendor" as CommissionScopeType,
        id,
        label,
      };
    })
    .filter((item) => Boolean(item.id));
}

async function fetchProductOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TargetOption[]> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .limit(200);

  if (error || !data) {
    return [];
  }

  return (data as DbRow[])
    .map((product) => {
      const id = readText(product, ["id"]);
      const label = readText(
        product,
        ["name", "title", "product_name"],
        "Product"
      );

      return {
        scopeType: "product" as CommissionScopeType,
        id,
        label,
      };
    })
    .filter((item) => Boolean(item.id));
}

export default async function AdminCommissionSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isAdminUser(
    supabase,
    user.id,
    typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "",
    typeof user.user_metadata?.role === "string" ? user.user_metadata.role : ""
  );

  if (!isAdmin) {
    redirect("/");
  }

  const [
    initialSettings,
    studioOptions,
    vendorOptions,
    productOptions,
  ] = await Promise.all([
    fetchCommissionSettings(supabase),
    fetchStudioOptions(supabase),
    fetchVendorOptions(supabase),
    fetchProductOptions(supabase),
  ]);

  const targetOptions: TargetOption[] = [
    ...studioOptions,
    ...vendorOptions,
    ...productOptions,
  ];

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin dashboard</p>
          <h1>Commission Settings</h1>
          <p className="gb-muted-text">
            Configure GearBeat commission rules from 10% to 30% by global
            default, studio, vendor, product, or service type.
          </p>
        </div>

        <Link href="/admin" className="gb-button gb-button-secondary">
          Back to admin dashboard
        </Link>
      </section>

      <AdminCommissionSettingsManager
        initialSettings={initialSettings}
        targetOptions={targetOptions}
      />
    </main>
  );
}
