import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

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

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeIban(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function isValidSaudiIban(value: string) {
  const iban = normalizeIban(value);

  return iban.startsWith("SA") && iban.length === 24;
}

function bankStatusStyle(status: string) {
  if (status === "approved") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "rejected") {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
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
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };
}

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profileData, error } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const profile = profileData as ProfileRow | null;

  if (!profile) {
    redirect("/login?account=owner");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.account_status && profile.account_status !== "active") {
    redirect("/login?account=owner");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner") {
    redirect("/forbidden");
  }

  return {
    user,
    profile,
    supabaseAdmin
  };
}

export default async function OwnerBankPage({
  searchParams
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const { user, supabaseAdmin } = await requireOwnerOnly();

  async function saveBankAccount(formData: FormData) {
    "use server";

    const { user, supabaseAdmin } = await requireOwnerOnly();

    const bankName = cleanText(formData.get("bank_name"));
    const iban = normalizeIban(cleanText(formData.get("iban")));
    const beneficiaryName = cleanText(formData.get("beneficiary_name"));

    if (!bankName) {
      throw new Error("Bank name is required.");
    }

    if (!iban) {
      throw new Error("IBAN is required.");
    }

    if (!isValidSaudiIban(iban)) {
      throw new Error("Please enter a valid Saudi IBAN. It must start with SA and contain 24 characters.");
    }

    if (!beneficiaryName) {
      throw new Error("Beneficiary name is required.");
    }

    const { data: existingDefaultAccount } = await supabaseAdmin
      .from("owner_bank_accounts")
      .select("id")
      .eq("owner_auth_user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    if (existingDefaultAccount?.id) {
      const { error: updateError } = await supabaseAdmin
        .from("owner_bank_accounts")
        .update({
          bank_name: bankName,
          iban,
          beneficiary_name: beneficiaryName,
          account_status: "pending_review",
          is_default: true,
          rejection_reason: null,
          verified_at: null,
          verified_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingDefaultAccount.id)
        .eq("owner_auth_user_id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      await supabaseAdmin
        .from("owner_bank_accounts")
        .update({
          is_default: false,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", user.id);

      const { error: insertError } = await supabaseAdmin
        .from("owner_bank_accounts")
        .insert({
          owner_auth_user_id: user.id,
          bank_name: bankName,
          iban,
          beneficiary_name: beneficiaryName,
          account_status: "pending_review",
          is_default: true
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    revalidatePath("/owner/bank");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/owner-bank-accounts");

    redirect("/owner/bank?saved=1");
  }

  const { data: bankAccountsData, error } = await supabaseAdmin
    .from("owner_bank_accounts")
    .select("*")
    .eq("owner_auth_user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const bankAccounts = (bankAccountsData || []) as OwnerBankAccountRow[];
  const defaultBankAccount =
    bankAccounts.find((account) => account.is_default) || bankAccounts[0] || null;

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>

        <h1>
          <T en="Bank Account" ar="الحساب البنكي" />
        </h1>

        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner Finance" ar="مالية صاحب الاستوديو" />
        </span>

        <h1>
          <T en="Bank Account" ar="الحساب البنكي" />
        </h1>

        <p>
          <T
            en="Add the bank account where GearBeat payouts will be transferred after your bookings are completed and approved for payout."
            ar="أضف الحساب البنكي الذي سيتم تحويل مستحقات GearBeat إليه بعد اكتمال الحجوزات واعتمادها للبياوت."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>

        <Link href="/owner/finance" className="btn btn-secondary">
          <T en="Finance Overview" ar="نظرة مالية" />
        </Link>

        <Link href="/owner/payouts" className="btn btn-secondary">
          <T en="Payouts" ar="البياوت" />
        </Link>
      </div>

      {params?.saved ? (
        <div className="success" style={{ marginBottom: 24 }}>
          <T
            en="Bank account saved and sent for admin review."
            ar="تم حفظ الحساب البنكي وإرساله لمراجعة الإدارة."
          />
        </div>
      ) : null}

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Current Status" ar="الحالة الحالية" />
          </span>

          {defaultBankAccount ? (
            <>
              <h2>{defaultBankAccount.bank_name}</h2>

              <p>
                <T en="Beneficiary:" ar="اسم المستفيد:" />{" "}
                <strong>{defaultBankAccount.beneficiary_name}</strong>
              </p>

              <p>
                <T en="IBAN:" ar="الآيبان:" />{" "}
                <strong>{defaultBankAccount.iban}</strong>
              </p>

              <span
                className="badge"
                style={bankStatusStyle(defaultBankAccount.account_status)}
              >
                {defaultBankAccount.account_status}
              </span>

              {defaultBankAccount.rejection_reason ? (
                <p style={{ marginTop: 14 }}>
                  <T en="Rejection reason:" ar="سبب الرفض:" />{" "}
                  {defaultBankAccount.rejection_reason}
                </p>
              ) : null}

              {defaultBankAccount.account_status === "approved" ? (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="This bank account is approved for payouts."
                    ar="هذا الحساب البنكي معتمد للتحويلات."
                  />
                </p>
              ) : null}

              {defaultBankAccount.account_status === "pending_review" ? (
                <p style={{ marginTop: 14 }}>
                  <T
                    en="Your bank account is waiting for admin review."
                    ar="حسابك البنكي بانتظار مراجعة الإدارة."
                  />
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2>
                <T en="No bank account yet" ar="لا يوجد حساب بنكي بعد" />
              </h2>

              <p>
                <T
                  en="Add your bank account details to receive future payouts."
                  ar="أضف بيانات حسابك البنكي لاستلام التحويلات المستقبلية."
                />
              </p>
            </>
          )}
        </div>

        <form className="card form" action={saveBankAccount}>
          <span className="badge">
            <T en="Bank Details" ar="بيانات البنك" />
          </span>

          <h2>
            <T en="Payout bank account" ar="حساب تحويل المستحقات" />
          </h2>

          <p>
            <T
              en="Any update to an approved bank account will require admin review again before payouts can be sent."
              ar="أي تعديل على حساب بنكي معتمد سيحتاج مراجعة الإدارة مرة أخرى قبل إرسال التحويلات."
            />
          </p>

          <label>
            <T en="Bank name" ar="اسم البنك" />
          </label>
          <input
            className="input"
            name="bank_name"
            defaultValue={defaultBankAccount?.bank_name || ""}
            placeholder="Example: Al Rajhi Bank"
            required
          />

          <label>
            <T en="IBAN" ar="الآيبان" />
          </label>
          <input
            className="input"
            name="iban"
            defaultValue={defaultBankAccount?.iban || ""}
            placeholder="SA0000000000000000000000"
            required
          />

          <label>
            <T en="Beneficiary name" ar="اسم المستفيد" />
          </label>
          <input
            className="input"
            name="beneficiary_name"
            defaultValue={defaultBankAccount?.beneficiary_name || ""}
            placeholder="Company or account holder name"
            required
          />

          <button className="btn" type="submit">
            <T en="Save Bank Account" ar="حفظ الحساب البنكي" />
          </button>
        </form>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Important" ar="مهم" />
        </span>

        <h2>
          <T en="How payouts will work" ar="كيف سيتم تحويل المستحقات" />
        </h2>

        <div className="admin-list">
          <div className="admin-list-row">
            <div>
              <strong>
                <T en="1. Customer pays GearBeat" ar="1. العميل يدفع لـ GearBeat" />
              </strong>
              <p>
                <T
                  en="The customer payment is recorded under the booking."
                  ar="يتم تسجيل دفعة العميل على الحجز."
                />
              </p>
            </div>
          </div>

          <div className="admin-list-row">
            <div>
              <strong>
                <T en="2. Booking is completed" ar="2. يتم إكمال الحجز" />
              </strong>
              <p>
                <T
                  en="After the session is completed, the booking becomes eligible for settlement."
                  ar="بعد انتهاء الجلسة، يصبح الحجز مؤهلًا للتسوية."
                />
              </p>
            </div>
          </div>

          <div className="admin-list-row">
            <div>
              <strong>
                <T en="3. GearBeat calculates payout" ar="3. GearBeat يحسب البياوت" />
              </strong>
              <p>
                <T
                  en="Commission is deducted, and the net amount becomes available for payout."
                  ar="يتم خصم العمولة، ويصبح صافي المبلغ متاحًا للتحويل."
                />
              </p>
            </div>
          </div>

          <div className="admin-list-row">
            <div>
              <strong>
                <T en="4. Finance sends payout" ar="4. المالية ترسل التحويل" />
              </strong>
              <p>
                <T
                  en="Approved payouts are sent to your approved bank account."
                  ar="يتم تحويل البياوت المعتمد إلى حسابك البنكي المعتمد."
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
