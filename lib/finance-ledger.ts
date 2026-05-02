type SupabaseAny = any;

export type FinanceLedgerEntryInput = {
  entryType:
    | "customer_payment"
    | "platform_commission"
    | "vendor_payable"
    | "owner_payable"
    | "refund"
    | "manual_adjustment"
    | "payout"
    | "reversal"
    | "general";
  entryGroup:
    | "payment"
    | "commission"
    | "payable"
    | "refund"
    | "adjustment"
    | "payout"
    | "general";
  sourceType:
    | "marketplace_order"
    | "studio_booking"
    | "manual_adjustment"
    | "payout_batch"
    | "refund"
    | "system";
  sourceId: string;
  sourceLabel?: string;
  partnerType: "customer" | "vendor" | "studio_owner" | "platform" | "system";
  partnerId?: string;
  partnerLabel?: string;
  amount: number;
  currency?: string;
  status?: "pending" | "posted" | "void" | "paid" | "refunded" | "reversed";
  transactionDate?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
};

export function isPaidFinanceStatus(status: string) {
  const s = String(status || "").toLowerCase();
  return (
    s === "paid" ||
    s === "manual_paid" ||
    s === "confirmed" ||
    s === "captured"
  );
}

export function isCancelledFinanceStatus(status: string) {
  const s = String(status || "").toLowerCase();
  return (
    s === "cancelled" ||
    s === "canceled" ||
    s === "refunded" ||
    s === "failed" ||
    s === "rejected" ||
    s === "declined"
  );
}

export function financeLedgerStatusFromPayment(
  paymentStatus: string,
  recordStatus = ""
) {
  if (
    isCancelledFinanceStatus(paymentStatus) ||
    isCancelledFinanceStatus(recordStatus)
  ) {
    return "void";
  }

  if (isPaidFinanceStatus(paymentStatus)) {
    return "posted";
  }

  return "pending";
}

export function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export function buildFinanceLedgerPayload(input: FinanceLedgerEntryInput) {
  const now = new Date().toISOString();

  return {
    entry_type: input.entryType,
    entry_group: input.entryGroup,
    source_type: input.sourceType,
    source_id: input.sourceId || "",
    source_label: input.sourceLabel || null,
    partner_type: input.partnerType,
    partner_id: input.partnerId || "",
    partner_label: input.partnerLabel || null,
    amount: roundMoney(input.amount),
    currency: input.currency || "SAR",
    status: input.status || "pending",
    transaction_date: input.transactionDate || now,
    metadata: input.metadata || {},
    updated_by: input.userId || null,
    updated_at: now,
  };
}

export async function upsertFinanceLedgerEntry(
  supabase: SupabaseAny,
  input: FinanceLedgerEntryInput
) {
  const payload = buildFinanceLedgerPayload(input);

  const { data, error } = await supabase
    .from("finance_ledger")
    .upsert(
      {
        ...payload,
        created_by: input.userId || null,
      },
      {
        onConflict:
          "source_type,source_id,entry_type,partner_type,partner_id",
      }
    )
    .select("*")
    .single();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function upsertFinanceLedgerEntries(
  supabase: SupabaseAny,
  inputs: FinanceLedgerEntryInput[]
) {
  if (inputs.length === 0) {
    return {
      count: 0,
      error: null,
    };
  }

  const rows = inputs.map((input) => ({
    ...buildFinanceLedgerPayload(input),
    created_by: input.userId || null,
  }));

  const { error } = await supabase.from("finance_ledger").upsert(rows, {
    onConflict:
      "source_type,source_id,entry_type,partner_type,partner_id",
  });

  if (error) {
    return {
      count: 0,
      error,
    };
  }

  return {
    count: rows.length,
    error: null,
  };
}
