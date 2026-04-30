import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createAuditLog } from "../../../lib/audit";
import T from "../../../components/t";

type OwnerBankAccountRow = {
  id: string;
  owner_auth_user_id: string;
  bank_name: string;
  iban: string;
  beneficiary_name: string;
  account_status: string;
  is_default: boolean;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
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

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function bankStatusStyle(status: string) {
  if (status === "approved") {
    return {
      background: "rgba(103, 197, 135, 0.18)",
      color: "var(--gb-success)",
      border: "1px solid rgba(103, 197, 135, 0.45)"
    };
  }

  if (status === "rejected") {
    return {
      background: "rgba(226, 109, 90, 0.18)",
      color: "var(--gb-danger)",
      border: "1px solid rgba(226, 109, 90, 0.45)"
    };
  }

  if (status === "disabled") {
    return {
      background: "rgba(255, 255, 255, 0.12)",
      color: "rgba(255, 255, 255, 0.72)",
      border: "1px solid rgba(255, 255, 255, 0.22)"
    };
  }

  return {
    background: "rgba(255, 193, 7, 0.18)",
    color: "var(--gb-warning)",
    border: "1px solid rgba(255, 193, 7, 0.45)"
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

export default async function AdminOwnerBankAccountsPage() {
  await requireAdminRole(["super_admin", "operations", "finance"]);

  const supabaseAdmin = createAdminClient();

  async function approveBankAccount(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bankAccountId = cleanText(formData.get("bank_account_id"));

    if (!bankAccountId) {
      throw new Error("Missing bank account ID.");
    }

    const { data: oldAccount, error: readError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("*")
      .eq("id", bankAccountId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldAccount) {
      throw new Error("Bank account not found.");
    }

    const { error } = await supabaseAdmin
      .from("owner_bank_accounts")
      .update({
        account_status: "approved",
        rejection_reason: null,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", bankAccountId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "owner_bank_account_approved",
      entityType: "owner_bank_account",
      entityId: bankAccountId,
      oldValues: {
        account_status: oldAccount.account_status,
        rejection_reason: oldAccount.rejection_reason
      },
      newValues: {
        account_status: "approved",
        rejection_reason: null
      },
      metadata: {
        admin_role: admin.admin_role,
        owner_auth_user_id: oldAccount.owner_auth_user_id
      }
    });

    revalidatePath("/admin/owner-bank-accounts");
    revalidatePath("/owner/bank");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function rejectBankAccount(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bankAccountId = cleanText(formData.get("bank_account_id"));
    const rejectionReason = cleanText(formData.get("rejection_reason"));

    if (!bankAccountId) {
      throw new Error("Missing bank account ID.");
    }

    if (!rejectionReason) {
      throw new Error("Rejection reason is required.");
    }

    const { data: oldAccount, error: readError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("*")
      .eq("id", bankAccountId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldAccount) {
      throw new Error("Bank account not found.");
    }

    const { error } = await supabaseAdmin
      .from("owner_bank_accounts")
      .update({
        account_status: "rejected",
        rejection_reason: rejectionReason,
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", bankAccountId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "owner_bank_account_rejected",
      entityType: "owner_bank_account",
      entityId: bankAccountId,
      oldValues: {
        account_status: oldAccount.account_status,
        rejection_reason: oldAccount.rejection_reason
      },
      newValues: {
        account_status: "rejected",
        rejection_reason: rejectionReason
      },
      metadata: {
        admin_role: admin.admin_role,
        owner_auth_user_id: oldAccount.owner_auth_user_id
      }
    });

    revalidatePath("/admin/owner-bank-accounts");
    revalidatePath("/owner/bank");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function disableBankAccount(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bankAccountId = cleanText(formData.get("bank_account_id"));

    if (!bankAccountId) {
      throw new Error("Missing bank account ID.");
    }

    const { data: oldAccount, error: readError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("*")
      .eq("id", bankAccountId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldAccount) {
      throw new Error("Bank account not found.");
    }

    const { error } = await supabaseAdmin
      .from("owner_bank_accounts")
      .update({
        account_status: "disabled",
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", bankAccountId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "owner_bank_account_disabled",
      entityType: "owner_bank_account",
      entityId: bankAccountId,
      oldValues: {
        account_status: oldAccount.account_status
      },
      newValues: {
        account_status: "disabled"
      },
      metadata: {
        admin_role: admin.admin_role,
        owner_auth_user_id: oldAccount.owner_auth_user_id
      }
    });

    revalidatePath("/admin/owner-bank-accounts");
    revalidatePath("/owner/bank");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  async function markPendingReview(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bankAccountId = cleanText(formData.get("bank_account_id"));

    if (!bankAccountId) {
      throw new Error("Missing bank account ID.");
    }

    const { data: oldAccount, error: readError } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("*")
      .eq("id", bankAccountId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldAccount) {
      throw new Error("Bank account not found.");
    }

    const { error } = await supabaseAdmin
      .from("owner_bank_accounts")
      .update({
        account_status: "pending_review",
        rejection_reason: null,
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", bankAccountId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "owner_bank_account_marked_pending_review",
      entityType: "owner_bank_account",
      entityId: bankAccountId,
      oldValues: {
        account_status: oldAccount.account_status,
        rejection_reason: oldAccount.rejection_reason
      },
      newValues: {
        account_status: "pending_review",
        rejection_reason: null
      },
      metadata: {
        admin_role: admin.admin_role,
        owner_auth_user_id: oldAccount.owner_auth_user_id
      }
    });

    revalidatePath("/admin/owner-bank-accounts");
    revalidatePath("/owner/bank");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
  }

  const { data: bankAccountsData, error } = await supabaseAdmin
    .from("owner_bank_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  const bankAccounts = (bankAccountsData || []) as OwnerBankAccountRow[];

  const ownerIds = Array.from(
    new Set(
      bankAccounts
        .map((account: OwnerBankAccountRow) => account.owner_auth_user_id)
        .filter(Boolean)
    )
  );

  const ownerResults = await Promise.all(
    ownerIds.map(async (ownerId: string) => {
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

  const totalAccounts = bankAccounts.length;
  const pendingAccounts = bankAccounts.filter(
    (account: OwnerBankAccountRow) => account.account_status === "pending_review"
  ).length;
  const approvedAccounts = bankAccounts.filter(
    (account: OwnerBankAccountRow) => account.account_status === "approved"
  ).length;
  const rejectedAccounts = bankAccounts.filter(
    (account: OwnerBankAccountRow) => account.account_status === "rejected"
  ).length;
  const disabledAccounts = bankAccounts.filter(
    (account: OwnerBankAccountRow) => account.account_status === "disabled"
  ).length;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Finance" ar="إدارة المالية" />
        </span>

        <h1>
          <T en="Owner Bank Accounts" ar="حسابات أصحاب الاستوديو البنكية" />
        </h1>

        <p>
          <T
            en="Review and approve bank accounts before studio owner payouts can be sent."
            ar="راجع واعتمد الحسابات البنكية قبل إرسال بياوت أصحاب الاستوديو."
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

        <Link href="/admin/studio-payouts" className="btn btn-secondary">
          <T en="Studio Payouts" ar="بياوت الاستوديو" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Accounts" ar="إجمالي الحسابات" />
          </span>
          <strong>{totalAccounts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Review" ar="بانتظار المراجعة" />
          </span>
          <strong>{pendingAccounts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved" ar="معتمدة" />
          </span>
          <strong>{approvedAccounts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Rejected" ar="مرفوضة" />
          </span>
          <strong>{rejectedAccounts}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Disabled" ar="معطلة" />
          </span>
          <strong>{disabledAccounts}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {error ? (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{error.message}</p>
        </div>
      ) : null}

      <div className="card">
        <span className="badge">
          <T en="Bank Accounts" ar="الحسابات البنكية" />
        </span>

        <h2>
          <T en="Review list" ar="قائمة المراجعة" />
        </h2>

        <p>
          <T
            en="Approved bank accounts can be used for payouts. Any owner update will reset the account to pending review."
            ar="الحسابات المعتمدة يمكن استخدامها للبياوت. أي تعديل من صاحب الاستوديو سيعيد الحساب إلى انتظار المراجعة."
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
                  <T en="IBAN" ar="الآيبان" />
                </th>
                <th>
                  <T en="Beneficiary" ar="المستفيد" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Dates" ar="التواريخ" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {bankAccounts.length ? (
                bankAccounts.map((account: OwnerBankAccountRow) => {
                  const owner = ownerMap.get(account.owner_auth_user_id);

                  return (
                    <tr key={account.id}>
                      <td>
                        <strong>{getOwnerName(owner)}</strong>
                        <p className="admin-muted-line">{getOwnerEmail(owner)}</p>
                        <p className="admin-muted-line">
                          <T en="Phone:" ar="الجوال:" /> {getOwnerPhone(owner)}
                        </p>
                        <p className="admin-muted-line">
                          <small>{account.owner_auth_user_id}</small>
                        </p>
                      </td>

                      <td>
                        <strong>{account.bank_name}</strong>
                        {account.is_default ? (
                          <p>
                            <span className="badge">
                              <T en="Default" ar="افتراضي" />
                            </span>
                          </p>
                        ) : null}
                      </td>

                      <td>
                        <strong>{account.iban}</strong>
                      </td>

                      <td>
                        <strong>{account.beneficiary_name}</strong>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={bankStatusStyle(account.account_status)}
                        >
                          {account.account_status}
                        </span>

                        {account.rejection_reason ? (
                          <p className="admin-muted-line">
                            <T en="Reason:" ar="السبب:" />{" "}
                            {account.rejection_reason}
                          </p>
                        ) : null}
                      </td>

                      <td>
                        <p className="admin-muted-line">
                          <T en="Created:" ar="تم الإنشاء:" />{" "}
                          {formatDate(account.created_at)}
                        </p>

                        <p className="admin-muted-line">
                          <T en="Updated:" ar="آخر تحديث:" />{" "}
                          {formatDate(account.updated_at)}
                        </p>

                        <p className="admin-muted-line">
                          <T en="Verified:" ar="تم الاعتماد:" />{" "}
                          {formatDate(account.verified_at)}
                        </p>
                      </td>

                      <td>
                        <div className="admin-studio-actions">
                          <div className="admin-inline-action-grid">
                            {account.account_status !== "approved" ? (
                              <form action={approveBankAccount}>
                                <input
                                  type="hidden"
                                  name="bank_account_id"
                                  value={account.id}
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Approve" ar="اعتماد" />
                                </button>
                              </form>
                            ) : null}

                            {account.account_status !== "pending_review" ? (
                              <form action={markPendingReview}>
                                <input
                                  type="hidden"
                                  name="bank_account_id"
                                  value={account.id}
                                />
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                >
                                  <T en="Mark Pending" ar="إرجاع للمراجعة" />
                                </button>
                              </form>
                            ) : null}

                            {account.account_status !== "disabled" ? (
                              <form action={disableBankAccount}>
                                <input
                                  type="hidden"
                                  name="bank_account_id"
                                  value={account.id}
                                />
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                >
                                  <T en="Disable" ar="تعطيل" />
                                </button>
                              </form>
                            ) : null}
                          </div>

                          <form className="form" action={rejectBankAccount}>
                            <input
                              type="hidden"
                              name="bank_account_id"
                              value={account.id}
                            />

                            <label>
                              <T en="Rejection reason" ar="سبب الرفض" />
                            </label>

                            <input
                              className="input"
                              name="rejection_reason"
                              placeholder="Reason for rejection..."
                            />

                            <button
                              className="btn btn-secondary btn-small"
                              type="submit"
                            >
                              <T en="Reject" ar="رفض" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T
                      en="No owner bank accounts found."
                      ar="لا توجد حسابات بنكية لأصحاب الاستوديو."
                    />
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
