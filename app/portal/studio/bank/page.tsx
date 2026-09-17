import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

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

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
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
    redirect("/portal/login");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.account_status && profile.account_status !== "active") {
    redirect("/portal/login");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner" && profile.role !== "studio_owner") {
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

    revalidatePath("/portal/studio/bank");
    revalidatePath("/portal/studio/payouts");
    revalidatePath("/admin/owner-bank-accounts");

    redirect("/portal/studio/bank?saved=1");
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
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Bank Account" ar="الحساب البنكي" />
          </h1>
          <p className="gb-muted-text" style={{ marginTop: '8px' }}>
            <T
              en="Manage your withdrawal bank account. Payouts are transferred here after bookings are completed."
              ar="أدر حسابك البنكي للسحب. سيتم تحويل المستحقات هنا بعد اكتمال الحجوزات."
            />
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/portal/studio" className="gb-button gb-button-outline">
            <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>
          <Link href="/portal/studio/payouts" className="gb-button gb-button-primary">
            <T en="Finance Overview" ar="نظرة مالية" />
          </Link>
        </div>
      </section>

      {params?.saved && (
        <div 
          className="gb-card" 
          style={{ 
            marginBottom: '32px', 
            borderInlineStart: '4px solid var(--gb-teal)', 
            background: 'rgba(15, 160, 138, 0.05)', 
            padding: '16px 24px' 
          }}
        >
          <p style={{ margin: 0, color: 'var(--gb-teal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <T
              en="Bank account details saved and sent for admin review."
              ar="تم حفظ بيانات الحساب البنكي وإرسالها لمراجعة الإدارة."
            />
          </p>
        </div>
      )}

      <div className="gb-dash-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'start', gap: '32px' }}>
        <section className="gb-card" style={{ padding: '40px' }}>
          <p className="gb-eyebrow" style={{ marginBottom: '24px' }}>
            <T en="Current Active Account" ar="الحساب النشط حالياً" />
          </p>

          {defaultBankAccount ? (
            <div className="gb-dashboard-stack" style={{ gap: '32px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>{defaultBankAccount.bank_name}</h2>
                <span
                  className="gb-dash-badge"
                  style={{ 
                    padding: '4px 12px',
                    fontSize: '0.7rem',
                    ...bankStatusStyle(defaultBankAccount.account_status)
                  }}
                >
                  {defaultBankAccount.account_status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <span className="gb-detail-label" style={{ marginBottom: '4px', display: 'block' }}><T en="Beneficiary Name" ar="اسم المستفيد" /></span>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>{defaultBankAccount.beneficiary_name}</div>
                </div>

                <div>
                  <span className="gb-detail-label" style={{ marginBottom: '4px', display: 'block' }}><T en="IBAN Number" ar="رقم الآيبان" /></span>
                  <div style={{ color: 'var(--gb-gold)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '1px', fontFamily: 'monospace' }}>{defaultBankAccount.iban}</div>
                </div>
              </div>

              {defaultBankAccount.rejection_reason && (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span className="gb-detail-label" style={{ color: '#ef4444', marginBottom: '8px', display: 'block' }}><T en="Action Required" ar="مطلوب إجراء" /></span>
                  <p style={{ margin: 0, color: 'white', fontSize: '0.9rem', lineHeight: 1.5 }}>{defaultBankAccount.rejection_reason}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="gb-empty-state" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '24px', opacity: 0.2 }}>🏦</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                <T en="No bank account linked" ar="لا يوجد حساب بنكي مرتبط" />
              </h2>
              <p className="gb-muted-text">
                <T
                  en="Add your bank details to enable manual bank settlements for your bookings."
                  ar="أضف بيانات البنك لتفعيل التسويات البنكية اليدوية لحجوزاتك."
                />
              </p>
            </div>
          )}
        </section>

        <section className="gb-card" style={{ padding: '40px' }}>
          <p className="gb-eyebrow" style={{ marginBottom: '24px' }}>
            <T en="Update Bank Details" ar="تحديث بيانات البنك" />
          </p>

          <form action={saveBankAccount} className="gb-dashboard-stack" style={{ gap: '24px' }}>
            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="Bank Name" ar="اسم البنك" />
              </label>
              <input
                className="gb-input"
                name="bank_name"
                defaultValue={defaultBankAccount?.bank_name || ""}
                placeholder="e.g. Al Rajhi Bank"
                required
              />
            </div>

            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="IBAN Number" ar="رقم الآيبان" />
              </label>
              <input
                className="gb-input"
                name="iban"
                defaultValue={defaultBankAccount?.iban || ""}
                placeholder="SA..."
                required
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="Beneficiary Name" ar="اسم المستفيد" />
              </label>
              <input
                className="gb-input"
                name="beneficiary_name"
                defaultValue={defaultBankAccount?.beneficiary_name || ""}
                placeholder="Full name as per bank records"
                required
              />
            </div>

            <div style={{ marginTop: '8px' }}>
              <button className="gb-button gb-button-primary" type="submit" style={{ width: '100%', justifyContent: 'center', height: '52px' }}>
                <T en="Save & Submit for Review" ar="حفظ وإرسال للمراجعة" />
              </button>
              <p className="gb-muted-text" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '16px' }}>
                <T en="Changes will put your account into pending status for admin review." ar="التغييرات ستضع حسابك في حالة انتظار لمراجعة الإدارة." />
              </p>
            </div>
          </form>
        </section>
      </div>

      <section className="gb-card" style={{ marginTop: '48px', padding: '40px' }}>
        <p className="gb-eyebrow" style={{ marginBottom: '32px' }}>
          <T en="Payout Lifecycle" ar="دورة حياة التحويلات" />
        </p>

        <div className="gb-dash-grid-4" style={{ gap: '32px' }}>
          {[
            { icon: "💰", titleEn: "1. Booking Payment", titleAr: "1. دفع الحجز", textEn: "Customer pays GearBeat securely at the time of booking.", textAr: "يدفع العميل لـ GearBeat بأمان عند الحجز." },
            { icon: "🎵", titleEn: "2. Session Complete", titleAr: "2. اكتمال الجلسة", textEn: "Once the studio session ends, the amount is processed.", textAr: "بمجرد انتهاء الجلسة، تبدأ معالجة المبلغ." },
            { icon: "⚖️", titleEn: "3. Net Calculation", titleAr: "3. حساب الصافي", textEn: "Platform fee is deducted and net profit is added to your ledger.", textAr: "تُخصم رسوم المنصة ويُضاف صافي الربح لسجلك." },
            { icon: "🏦", titleEn: "4. Direct Transfer", titleAr: "4. تحويل مباشر", textEn: "Available balance is transferred to your verified bank account.", textAr: "يتم تحويل الرصيد المتاح لحسابك البنكي الموثق." }
          ].map((step, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid var(--gb-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '20px' }}>{step.icon}</div>
              <strong style={{ display: 'block', marginBottom: '12px', color: 'white', fontSize: '1rem', fontWeight: 800 }}>
                <T en={step.titleEn} ar={step.titleAr} />
              </strong>
              <p className="gb-muted-text" style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                <T en={step.textEn} ar={step.textAr} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
