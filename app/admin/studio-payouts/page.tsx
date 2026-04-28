import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createAuditLog } from "../../../lib/audit";
import T from "../../../components/t";

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
  hold_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  approved_by: string | null;
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

type OwnerBankAccountRow = {
  id: string;
  owner_auth_user_id: string;
  bank_name: string;
  iban: string;
  beneficiary_name: string;
  account_status: string;
  is_default: boolean;
};

type OwnerProfileRow = {
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

type OwnerRecord = {
  user: {
    email?: string | null;
    phone?: string | null;
    user_metadata?: Record<string, any>;
  } | null;
  profile: OwnerProfileRow | null;
};

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  owner_auth_user_id: string | null;
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

function sumValues<T>(rows: T[], getter: (row: T) => number | null | undefined) {
  return rows.reduce((sum: number, row: T) => sum + Number(getter(row) || 0), 0);
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function statusStyle(status: string | null | undefined) {
  if (
    status === "approved" ||
    status === "paid" ||
    status === "paid_out" ||
    status === "eligible"
  ) {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "rejected"
  ) {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  if (
    status === "draft" ||
    status === "pending_approval" ||
    status === "pending" ||
    status === "included_in_payout" ||
    status === "on_hold"
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

function getOwnerName(owner: OwnerRecord | undefined) {
  const metadata = owner?.user?.user_metadata || {};

  return (
    owner?.profile?.full_name ||
    metadata.full_name ||
    metadata.name ||
    owner?.user?.email ||
    owner?.profile?.email ||
    "Studio Owner"
  );
}

function getOwnerEmail(owner: OwnerRecord | undefined) {
  return owner?.profile?.email || owner?.user?.email || "—";
}

function getOwnerPhone(owner: OwnerRecord | undefined) {
  const metadata = owner?.user?.user_metadata || {};

  return (
    owner?.profile?.phone ||
    owner?.user?.phone ||
    metadata.phone ||
    metadata.phone_number ||
    metadata.mobile ||
    "—"
  );
}

function groupByProvider(settlements: PlatformSettlementRow[]) {
  const groups = new Map<string, PlatformSettlementRow[]>();

  settlements.forEach((settlement: PlatformSettlementRow) => {
    const existing = groups.get(settlement.provider_id) || [];
    groups.set(settlement.provider_id, [...existing, settlement]);
  });

  return Array.from(groups.entries()).map(([providerId, rows]) => ({
    providerId,
    rows,
    totalNet: sumValues(rows, (row: PlatformSettlementRow) => row.net_amount),
    totalGross: sumValues(rows, (row: PlatformSettlementRow) => row.gross_amount),
    totalCommission: sumValues(
      rows,
      (row: PlatformSettlementRow) => row.commission_amount
    )
  }));
}

export default async function AdminStudioPayoutsPage() {
  await requireAdminRole(["super_admin", "operations", "finance"]);

  const supabaseAdmin = createAdminClient();

  async function createPayoutForOwner(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const ownerAuthUserId = cleanText(formData.get("owner_auth_user_id"));

    if (!ownerAuthUserId) {
      throw new Error("Missing owner ID.");
    }

    const { data: bankAccount, error: bankError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("id,owner_auth_user_id,bank_name,iban,beneficiary_name,account_status,is_default")
      .eq("owner_auth_user_id", ownerAuthUserId)
      .eq("is_default", true)
      .eq("account_status", "approved")
      .maybeSingle();

    if (bankError) {
      throw new Error(bankError.message);
    }

    if (!bankAccount) {
      throw new Error("Owner does not have an approved default bank account.");
    }

    const { data: eligibleSettlementsData, error: settlementsError } =
      await supabaseAdmin
        .from("platform_settlements")
        .select("*")
        .eq("source_type", "studio_booking")
        .eq("provider_type", "studio_owner")
        .eq("provider_id", ownerAuthUserId)
        .eq("settlement_status", "eligible")
        .order("created_at", { ascending: true });

    if (settlementsError) {
      throw new Error(settlementsError.message);
    }

    const eligibleSettlements =
      (eligibleSettlementsData || []) as PlatformSettlementRow[];

    if (!eligibleSettlements.length) {
      throw new Error("No eligible settlements found for this owner.");
    }

    const totalAmount = sumValues(
      eligibleSettlements,
      (settlement: PlatformSettlementRow) => settlement.net_amount
    );

    if (totalAmount <= 0) {
      throw new Error("Payout amount must be greater than zero.");
    }

    const { data: payout, error: payoutError } = await supabaseAdmin
      .from("platform_payouts")
      .insert({
        provider_type: "studio_owner",
        provider_id: ownerAuthUserId,
        bank_account_type: "owner_bank_account",
        bank_account_id: bankAccount.id,
        total_amount: totalAmount,
        currency: "SAR",
        status: "pending_approval"
      })
      .select("id,payout_number")
      .single();

    if (payoutError) {
      throw new Error(payoutError.message);
    }

    const payoutItems = eligibleSettlements.map(
      (settlement: PlatformSettlementRow) => ({
        payout_id: payout.id,
        settlement_id: settlement.id,
        source_type: settlement.source_type,
        source_id: settlement.source_id,
        gross_amount: settlement.gross_amount || 0,
        commission_amount: settlement.commission_amount || 0,
        net_amount: settlement.net_amount || 0
      })
    );

    const { error: itemsError } = await supabaseAdmin
      .from("platform_payout_items")
      .insert(payoutItems);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const settlementIds = eligibleSettlements.map(
      (settlement: PlatformSettlementRow) => settlement.id
    );

    const bookingIds = eligibleSettlements.map(
      (settlement: PlatformSettlementRow) => settlement.source_id
    );

    const { error: settlementUpdateError } = await supabaseAdmin
      .from("platform_settlements")
      .update({
        settlement_status: "included_in_payout",
        updated_at: new Date().toISOString()
      })
      .in("id", settlementIds);

    if (settlementUpdateError) {
      throw new Error(settlementUpdateError.message);
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        settlement_status: "included_in_payout",
        payout_status: "included_in_payout",
        updated_at: new Date().toISOString()
      })
      .in("id", bookingIds);

    if (bookingUpdateError) {
      throw new Error(bookingUpdateError.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_owner_payout_created",
      entityType: "platform_payout",
      entityId: payout.id,
      oldValues: {},
      newValues: {
        status: "pending_approval",
        total_amount: totalAmount,
        settlement_count: eligibleSettlements.length
      },
      metadata: {
        admin_role: admin.admin_role,
        owner_auth_user_id: ownerAuthUserId,
        bank_account_id: bankAccount.id,
        payout_number: payout.payout_number,
        settlement_ids: settlementIds,
        booking_ids: bookingIds
      }
    });

    revalidatePath("/admin/studio-payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function approvePayout(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const payoutId = cleanText(formData.get("payout_id"));

    if (!payoutId) {
      throw new Error("Missing payout ID.");
    }

    const { data: oldPayout, error: readError } = await supabaseAdmin
      .from("platform_payouts")
      .select("*")
      .eq("id", payoutId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldPayout) {
      throw new Error("Payout not found.");
    }

    if (!["draft", "pending_approval"].includes(oldPayout.status)) {
      throw new Error("Only draft or pending approval payouts can be approved.");
    }

    const { error } = await supabaseAdmin
      .from("platform_payouts")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", payoutId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_owner_payout_approved",
      entityType: "platform_payout",
      entityId: payoutId,
      oldValues: {
        status: oldPayout.status
      },
      newValues: {
        status: "approved"
      },
      metadata: {
        admin_role: admin.admin_role,
        provider_id: oldPayout.provider_id,
        payout_number: oldPayout.payout_number
      }
    });

    revalidatePath("/admin/studio-payouts");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function markPayoutPaid(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const payoutId = cleanText(formData.get("payout_id"));

    if (!payoutId) {
      throw new Error("Missing payout ID.");
    }

    const { data: payoutData, error: payoutError } = await supabaseAdmin
      .from("platform_payouts")
      .select("*")
      .eq("id", payoutId)
      .maybeSingle();

    if (payoutError) {
      throw new Error(payoutError.message);
    }

    const payout = payoutData as PlatformPayoutRow | null;

    if (!payout) {
      throw new Error("Payout not found.");
    }

    if (payout.status !== "approved") {
      throw new Error("Only approved payouts can be marked as paid.");
    }

    const { data: payoutItemsData, error: itemsError } = await supabaseAdmin
      .from("platform_payout_items")
      .select("*")
      .eq("payout_id", payoutId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const payoutItems = (payoutItemsData || []) as PlatformPayoutItemRow[];

    if (!payoutItems.length) {
      throw new Error("This payout has no payout items.");
    }

    const settlementIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.settlement_id
    );

    const bookingIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.source_id
    );

    const now = new Date().toISOString();

    const { error: payoutUpdateError } = await supabaseAdmin
      .from("platform_payouts")
      .update({
        status: "paid",
        paid_at: now,
        updated_at: now
      })
      .eq("id", payoutId);

    if (payoutUpdateError) {
      throw new Error(payoutUpdateError.message);
    }

    const { error: settlementUpdateError } = await supabaseAdmin
      .from("platform_settlements")
      .update({
        settlement_status: "paid_out",
        updated_at: now
      })
      .in("id", settlementIds);

    if (settlementUpdateError) {
      throw new Error(settlementUpdateError.message);
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        settlement_status: "paid_out",
        payout_status: "paid",
        updated_at: now
      })
      .in("id", bookingIds);

    if (bookingUpdateError) {
      throw new Error(bookingUpdateError.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_owner_payout_paid",
      entityType: "platform_payout",
      entityId: payoutId,
      oldValues: {
        status: payout.status
      },
      newValues: {
        status: "paid",
        paid_at: now
      },
      metadata: {
        admin_role: admin.admin_role,
        provider_id: payout.provider_id,
        payout_number: payout.payout_number,
        settlement_ids: settlementIds,
        booking_ids: bookingIds
      }
    });

    revalidatePath("/admin/studio-payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function cancelPayout(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const payoutId = cleanText(formData.get("payout_id"));

    if (!payoutId) {
      throw new Error("Missing payout ID.");
    }

    const { data: payoutData, error: payoutError } = await supabaseAdmin
      .from("platform_payouts")
      .select("*")
      .eq("id", payoutId)
      .maybeSingle();

    if (payoutError) {
      throw new Error(payoutError.message);
    }

    const payout = payoutData as PlatformPayoutRow | null;

    if (!payout) {
      throw new Error("Payout not found.");
    }

    if (payout.status === "paid") {
      throw new Error("Paid payouts cannot be cancelled.");
    }

    if (payout.status === "cancelled") {
      throw new Error("This payout is already cancelled.");
    }

    const { data: payoutItemsData, error: itemsError } = await supabaseAdmin
      .from("platform_payout_items")
      .select("*")
      .eq("payout_id", payoutId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const payoutItems = (payoutItemsData || []) as PlatformPayoutItemRow[];

    const settlementIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.settlement_id
    );

    const bookingIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.source_id
    );

    const now = new Date().toISOString();

    const { error: payoutUpdateError } = await supabaseAdmin
      .from("platform_payouts")
      .update({
        status: "cancelled",
        updated_at: now
      })
      .eq("id", payoutId);

    if (payoutUpdateError) {
      throw new Error(payoutUpdateError.message);
    }

    if (settlementIds.length > 0) {
      const { error: settlementUpdateError } = await supabaseAdmin
        .from("platform_settlements")
        .update({
          settlement_status: "eligible",
          updated_at: now
        })
        .in("id", settlementIds);

      if (settlementUpdateError) {
        throw new Error(settlementUpdateError.message);
      }
    }

    if (bookingIds.length > 0) {
      const { error: bookingUpdateError } = await supabaseAdmin
        .from("bookings")
        .update({
          settlement_status: "eligible",
          payout_status: "not_started",
          updated_at: now
        })
        .in("id", bookingIds);

      if (bookingUpdateError) {
        throw new Error(bookingUpdateError.message);
      }
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_owner_payout_cancelled",
      entityType: "platform_payout",
      entityId: payoutId,
      oldValues: {
        status: payout.status
      },
      newValues: {
        status: "cancelled"
      },
      metadata: {
        admin_role: admin.admin_role,
        provider_id: payout.provider_id,
        payout_number: payout.payout_number,
        settlement_ids: settlementIds,
        booking_ids: bookingIds
      }
    });

    revalidatePath("/admin/studio-payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function markPayoutFailed(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const payoutId = cleanText(formData.get("payout_id"));
    const failureReason = cleanText(formData.get("failure_reason"));

    if (!payoutId) {
      throw new Error("Missing payout ID.");
    }

    if (!failureReason) {
      throw new Error("Failure reason is required.");
    }

    const { data: payoutData, error: payoutError } = await supabaseAdmin
      .from("platform_payouts")
      .select("*")
      .eq("id", payoutId)
      .maybeSingle();

    if (payoutError) {
      throw new Error(payoutError.message);
    }

    const payout = payoutData as PlatformPayoutRow | null;

    if (!payout) {
      throw new Error("Payout not found.");
    }

    if (payout.status === "paid") {
      throw new Error("Paid payouts cannot be marked as failed.");
    }

    const { data: payoutItemsData, error: itemsError } = await supabaseAdmin
      .from("platform_payout_items")
      .select("*")
      .eq("payout_id", payoutId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    const payoutItems = (payoutItemsData || []) as PlatformPayoutItemRow[];

    const settlementIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.settlement_id
    );

    const bookingIds = payoutItems.map(
      (item: PlatformPayoutItemRow) => item.source_id
    );

    const now = new Date().toISOString();

    const { error: payoutUpdateError } = await supabaseAdmin
      .from("platform_payouts")
      .update({
        status: "failed",
        failure_reason: failureReason,
        updated_at: now
      })
      .eq("id", payoutId);

    if (payoutUpdateError) {
      throw new Error(payoutUpdateError.message);
    }

    if (settlementIds.length > 0) {
      const { error: settlementUpdateError } = await supabaseAdmin
        .from("platform_settlements")
        .update({
          settlement_status: "eligible",
          updated_at: now
        })
        .in("id", settlementIds);

      if (settlementUpdateError) {
        throw new Error(settlementUpdateError.message);
      }
    }

    if (bookingIds.length > 0) {
      const { error: bookingUpdateError } = await supabaseAdmin
        .from("bookings")
        .update({
          settlement_status: "eligible",
          payout_status: "failed",
          updated_at: now
        })
        .in("id", bookingIds);

      if (bookingUpdateError) {
        throw new Error(bookingUpdateError.message);
      }
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "studio_owner_payout_failed",
      entityType: "platform_payout",
      entityId: payoutId,
      oldValues: {
        status: payout.status,
        failure_reason: payout.failure_reason
      },
      newValues: {
        status: "failed",
        failure_reason: failureReason
      },
      metadata: {
        admin_role: admin.admin_role,
        provider_id: payout.provider_id,
        payout_number: payout.payout_number,
        settlement_ids: settlementIds,
        booking_ids: bookingIds
      }
    });

    revalidatePath("/admin/studio-payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  const { data: settlementsData, error: settlementsError } = await supabaseAdmin
    .from("platform_settlements")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("provider_type", "studio_owner")
    .order("created_at", { ascending: false });

  const settlements = (settlementsData || []) as PlatformSettlementRow[];

  const eligibleSettlements = settlements.filter(
    (settlement: PlatformSettlementRow) =>
      settlement.settlement_status === "eligible"
  );

  const { data: payoutsData, error: payoutsError } = await supabaseAdmin
    .from("platform_payouts")
    .select("*")
    .eq("provider_type", "studio_owner")
    .order("created_at", { ascending: false });

  const payouts = (payoutsData || []) as PlatformPayoutRow[];

  const payoutIds = payouts.map((payout: PlatformPayoutRow) => payout.id);

  let payoutItems: PlatformPayoutItemRow[] = [];

  if (payoutIds.length > 0) {
    const { data: payoutItemsData } = await supabaseAdmin
      .from("platform_payout_items")
      .select("*")
      .in("payout_id", payoutIds);

    payoutItems = (payoutItemsData || []) as PlatformPayoutItemRow[];
  }

  const providerIds = Array.from(
    new Set([
      ...settlements.map((settlement: PlatformSettlementRow) => settlement.provider_id),
      ...payouts.map((payout: PlatformPayoutRow) => payout.provider_id)
    ])
  ).filter(Boolean);

  const ownerResults = await Promise.all(
    providerIds.map(async (ownerId: string) => {
      const [{ data: userData }, { data: profileData }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(ownerId),
        supabaseAdmin
          .from("profiles")
          .select("auth_user_id,email,full_name,phone,role,account_status")
          .eq("auth_user_id", ownerId)
          .maybeSingle()
      ]);

      return {
        id: ownerId,
        user: userData?.user || null,
        profile: (profileData || null) as OwnerProfileRow | null
      };
    })
  );

  const ownerMap = new Map<string, OwnerRecord>(
    ownerResults.map((item) => [
      item.id,
      {
        user: item.user,
        profile: item.profile
      }
    ])
  );

  const { data: bankAccountsData } = await supabaseAdmin
    .from("owner_bank_accounts")
    .select("id,owner_auth_user_id,bank_name,iban,beneficiary_name,account_status,is_default")
    .in("owner_auth_user_id", providerIds.length ? providerIds : ["00000000-0000-0000-0000-000000000000"]);

  const bankAccounts = (bankAccountsData || []) as OwnerBankAccountRow[];

  const approvedDefaultBankByOwner = new Map<string, OwnerBankAccountRow>();

  bankAccounts.forEach((account: OwnerBankAccountRow) => {
    if (
      account.is_default &&
      account.account_status === "approved" &&
      !approvedDefaultBankByOwner.has(account.owner_auth_user_id)
    ) {
      approvedDefaultBankByOwner.set(account.owner_auth_user_id, account);
    }
  });

  const settlementSourceIds = settlements.map(
    (settlement: PlatformSettlementRow) => settlement.source_id
  );

  let bookings: BookingRow[] = [];

  if (settlementSourceIds.length > 0) {
    const { data: bookingsData } = await supabaseAdmin
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
          slug,
          owner_auth_user_id
        )
      `)
      .in("id", settlementSourceIds);

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

  const eligibleGroups = groupByProvider(eligibleSettlements);

  const totalEligibleAmount = sumValues(
    eligibleSettlements,
    (settlement: PlatformSettlementRow) => settlement.net_amount
  );

  const pendingPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "pending_approval"
  );

  const approvedPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "approved"
  );

  const paidPayouts = payouts.filter(
    (payout: PlatformPayoutRow) => payout.status === "paid"
  );

  const paidPayoutAmount = sumValues(
    paidPayouts,
    (payout: PlatformPayoutRow) => payout.total_amount
  );

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Finance" ar="إدارة المالية" />
        </span>

        <h1>
          <T en="Studio Payouts" ar="بياوت الاستوديو" />
        </h1>

        <p>
          <T
            en="Create, approve, and mark payouts as paid for eligible studio owner settlements."
            ar="أنشئ واعتمد وعلّم البياوت كمدفوع لتسويات أصحاب الاستوديو المؤهلة."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/studio-payments" className="btn btn-secondary">
          <T en="Studio Payments" ar="مدفوعات الاستوديو" />
        </Link>

        <Link href="/admin/owner-bank-accounts" className="btn btn-secondary">
          <T en="Owner Bank Accounts" ar="حسابات الملاك البنكية" />
        </Link>
      </div>

      {settlementsError ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{settlementsError.message}</p>
        </div>
      ) : null}

      {payoutsError ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{payoutsError.message}</p>
        </div>
      ) : null}

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Eligible Settlements" ar="تسويات مؤهلة" />
          </span>
          <strong>{eligibleSettlements.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Eligible Amount" ar="المبلغ المؤهل" />
          </span>
          <strong>{money(totalEligibleAmount)}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Payouts" ar="بياوت بانتظار الاعتماد" />
          </span>
          <strong>{pendingPayouts.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved Payouts" ar="بياوت معتمد" />
          </span>
          <strong>{approvedPayouts.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Payouts" ar="بياوت مدفوع" />
          </span>
          <strong>{paidPayouts.length}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Amount" ar="مبلغ مدفوع" />
          </span>
          <strong>{money(paidPayoutAmount)}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Create Payouts" ar="إنشاء بياوت" />
        </span>

        <h2>
          <T en="Eligible settlements by owner" ar="التسويات المؤهلة حسب المالك" />
        </h2>

        <p>
          <T
            en="A payout can be created only if the owner has an approved default bank account."
            ar="يمكن إنشاء البياوت فقط إذا كان لدى صاحب الاستوديو حساب بنكي افتراضي معتمد."
          />
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Owner" ar="صاحب الاستوديو" />
                </th>
                <th>
                  <T en="Bank" ar="البنك" />
                </th>
                <th>
                  <T en="Settlements" ar="التسويات" />
                </th>
                <th>
                  <T en="Gross" ar="الإجمالي" />
                </th>
                <th>
                  <T en="Commission" ar="العمولة" />
                </th>
                <th>
                  <T en="Net Payout" ar="صافي البياوت" />
                </th>
                <th>
                  <T en="Action" ar="الإجراء" />
                </th>
              </tr>
            </thead>

            <tbody>
              {eligibleGroups.length ? (
                eligibleGroups.map((group) => {
                  const owner = ownerMap.get(group.providerId);
                  const bank = approvedDefaultBankByOwner.get(group.providerId);

                  return (
                    <tr key={group.providerId}>
                      <td>
                        <strong>{getOwnerName(owner)}</strong>
                        <p className="admin-muted-line">{getOwnerEmail(owner)}</p>
                        <p className="admin-muted-line">
                          <T en="Phone:" ar="الجوال:" /> {getOwnerPhone(owner)}
                        </p>
                        <p className="admin-muted-line">
                          <small>{group.providerId}</small>
                        </p>
                      </td>

                      <td>
                        {bank ? (
                          <>
                            <strong>{bank.bank_name}</strong>
                            <p className="admin-muted-line">
                              {bank.beneficiary_name}
                            </p>
                            <p className="admin-muted-line">{bank.iban}</p>
                            <span className="badge" style={statusStyle("approved")}>
                              approved
                            </span>
                          </>
                        ) : (
                          <span className="badge" style={statusStyle("failed")}>
                            <T en="No approved bank" ar="لا يوجد حساب معتمد" />
                          </span>
                        )}
                      </td>

                      <td>{group.rows.length}</td>

                      <td>{money(group.totalGross)}</td>

                      <td>{money(group.totalCommission)}</td>

                      <td>
                        <strong>{money(group.totalNet)}</strong>
                      </td>

                      <td>
                        {bank ? (
                          <form action={createPayoutForOwner}>
                            <input
                              type="hidden"
                              name="owner_auth_user_id"
                              value={group.providerId}
                            />
                            <button className="btn btn-small" type="submit">
                              <T en="Create Payout" ar="إنشاء بياوت" />
                            </button>
                          </form>
                        ) : (
                          <Link
                            href="/admin/owner-bank-accounts"
                            className="btn btn-secondary btn-small"
                          >
                            <T en="Review Bank" ar="مراجعة البنك" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T
                      en="No eligible settlements found."
                      ar="لا توجد تسويات مؤهلة."
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
          <T en="All Payouts" ar="كل البياوت" />
        </span>

        <h2>
          <T en="Payout management" ar="إدارة البياوت" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Payout" ar="البياوت" />
                </th>
                <th>
                  <T en="Owner" ar="صاحب الاستوديو" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Dates" ar="التواريخ" />
                </th>
                <th>
                  <T en="Items" ar="العناصر" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {payouts.length ? (
                payouts.map((payout: PlatformPayoutRow) => {
                  const owner = ownerMap.get(payout.provider_id);
                  const items = payoutItemsByPayoutId.get(payout.id) || [];

                  return (
                    <tr key={payout.id}>
                      <td>
                        <strong>{payout.payout_number}</strong>
                        <p className="admin-muted-line">
                          <small>{payout.id}</small>
                        </p>

                        {payout.failure_reason ? (
                          <p className="admin-muted-line">
                            <T en="Failure:" ar="سبب الفشل:" />{" "}
                            {payout.failure_reason}
                          </p>
                        ) : null}
                      </td>

                      <td>
                        <strong>{getOwnerName(owner)}</strong>
                        <p className="admin-muted-line">{getOwnerEmail(owner)}</p>
                        <p className="admin-muted-line">
                          <small>{payout.provider_id}</small>
                        </p>
                      </td>

                      <td>
                        <strong>{money(payout.total_amount)}</strong>
                      </td>

                      <td>
                        <span className="badge" style={statusStyle(payout.status)}>
                          {payout.status}
                        </span>
                      </td>

                      <td>
                        <p className="admin-muted-line">
                          <T en="Created:" ar="تم الإنشاء:" />{" "}
                          {formatDate(payout.created_at)}
                        </p>

                        <p className="admin-muted-line">
                          <T en="Approved:" ar="تم الاعتماد:" />{" "}
                          {formatDate(payout.approved_at)}
                        </p>

                        <p className="admin-muted-line">
                          <T en="Paid:" ar="تم الدفع:" />{" "}
                          {formatDate(payout.paid_at)}
                        </p>
                      </td>

                      <td>
                        <span className="badge">
                          {items.length} <T en="items" ar="عنصر" />
                        </span>
                      </td>

                      <td>
                        <div className="admin-studio-actions">
                          <div className="admin-inline-action-grid">
                            {["draft", "pending_approval"].includes(
                              payout.status
                            ) ? (
                              <form action={approvePayout}>
                                <input
                                  type="hidden"
                                  name="payout_id"
                                  value={payout.id}
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Approve" ar="اعتماد" />
                                </button>
                              </form>
                            ) : null}

                            {payout.status === "approved" ? (
                              <form action={markPayoutPaid}>
                                <input
                                  type="hidden"
                                  name="payout_id"
                                  value={payout.id}
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Mark Paid" ar="تحديد كمدفوع" />
                                </button>
                              </form>
                            ) : null}

                            {payout.status !== "paid" &&
                            payout.status !== "cancelled" ? (
                              <form action={cancelPayout}>
                                <input
                                  type="hidden"
                                  name="payout_id"
                                  value={payout.id}
                                />
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                >
                                  <T en="Cancel" ar="إلغاء" />
                                </button>
                              </form>
                            ) : null}
                          </div>

                          {payout.status !== "paid" &&
                          payout.status !== "cancelled" ? (
                            <form className="form" action={markPayoutFailed}>
                              <input
                                type="hidden"
                                name="payout_id"
                                value={payout.id}
                              />

                              <label>
                                <T en="Failure reason" ar="سبب الفشل" />
                              </label>

                              <input
                                className="input"
                                name="failure_reason"
                                placeholder="Bank transfer failed..."
                              />

                              <button
                                className="btn btn-secondary btn-small"
                                type="submit"
                              >
                                <T en="Mark Failed" ar="تحديد كفاشل" />
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T en="No payouts found." ar="لا يوجد بياوت." />
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
          <T en="Settlement Details" ar="تفاصيل التسويات" />
        </span>

        <h2>
          <T en="All studio settlements" ar="كل تسويات الاستوديو" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Owner" ar="صاحب الاستوديو" />
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
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
              </tr>
            </thead>

            <tbody>
              {settlements.length ? (
                settlements.map((settlement: PlatformSettlementRow) => {
                  const owner = ownerMap.get(settlement.provider_id);
                  const booking = bookingMap.get(settlement.source_id);
                  const studio = booking ? normalizeStudio(booking.studios) : null;

                  return (
                    <tr key={settlement.id}>
                      <td>
                        <strong>{getOwnerName(owner)}</strong>
                        <p className="admin-muted-line">{getOwnerEmail(owner)}</p>
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

                      <td>{money(settlement.gross_amount)}</td>

                      <td>{money(settlement.commission_amount)}</td>

                      <td>
                        <strong>{money(settlement.net_amount)}</strong>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={statusStyle(settlement.settlement_status)}
                        >
                          {settlement.settlement_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T en="No settlements found." ar="لا توجد تسويات." />
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
