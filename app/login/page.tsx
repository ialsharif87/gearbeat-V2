import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";

type AccountType = "customer" | "owner" | "vendor";

type LoginSearchParams = {
  next?: string;
  account?: string;
  created?: string;
  error?: string;
};

function safeNextPath(value: string | null | undefined) {
  if (!value) return "";
  if (!value.startsWith("/")) return "";
  if (value.startsWith("//")) return "";
  return value;
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeAccountType(value: string): AccountType {
  if (value === "owner") return "owner";
  if (value === "vendor") return "vendor";
  return "customer";
}

function loginRedirectPath({
  error,
  account,
  next
}: {
  error?: string;
  account?: AccountType;
  next?: string;
}) {
  const params = new URLSearchParams();

  if (error) {
    params.set("error", error);
  }

  if (account) {
    params.set("account", account);
  }

  const safeNext = safeNextPath(next);

  if (safeNext) {
    params.set("next", safeNext);
  }

  const query = params.toString();

  return query ? `/login?${query}` : "/login";
}

function getLoginMessage({
  error,
  created,
  isStaffAccess
}: {
  error?: string;
  created?: string;
  isStaffAccess: boolean;
}) {
  if (created && !isStaffAccess) {
    return {
      type: "success" as const,
      en: "Account created. Please login to continue.",
      ar: "تم إنشاء الحساب. الرجاء تسجيل الدخول للمتابعة."
    };
  }

  if (error && error !== "none") {
    return {
      type: "error" as const,
      en: "Email or password is incorrect.",
      ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة."
    };
  }

  return null;
}

async function ensureProfileForUser({
  supabaseAdmin,
  user,
  selectedAccountType
}: {
  supabaseAdmin: any;
  user: any;
  selectedAccountType: AccountType;
}) {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    const metadataRole = user.user_metadata?.role;

    if (
      (selectedAccountType === "owner" || selectedAccountType === "vendor") &&
      existingProfile.role !== selectedAccountType &&
      metadataRole === selectedAccountType
    ) {
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          role: selectedAccountType,
          account_status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("auth_user_id", user.id)
        .select("id, auth_user_id, email, full_name, phone, role, account_status")
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return updatedProfile;
    }

    return existingProfile;
  }

  const metadataRole = user.user_metadata?.role;
  const role =
    selectedAccountType === "owner" || selectedAccountType === "vendor" || metadataRole === "owner" || metadataRole === "vendor"
      ? (selectedAccountType || metadataRole)
      : "customer";

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const phone =
    user.user_metadata?.phone ||
    user.user_metadata?.phone_number ||
    user.user_metadata?.mobile ||
    "";

  const { data: newProfile, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      auth_user_id: user.id,
      email: user.email,
      full_name: fullName,
      phone,
      role,
      account_status: "active",
      updated_at: new Date().toISOString()
    })
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      full_name: fullName,
      name: fullName,
      phone,
      phone_number: phone,
      mobile: phone,
      role,
      account_type: role
    }
  });

  return newProfile;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<LoginSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const nextPath = safeNextPath(params?.next);

  const isStaffAccess = nextPath === "/admin";
  const defaultAccount: AccountType = params?.account === "owner" ? "owner" : (params?.account === "vendor" ? "vendor" : "customer");

  const loginMessage = getLoginMessage({
    error: params?.error,
    created: params?.created,
    isStaffAccess
  });

  async function login(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const email = cleanText(formData.get("email")).toLowerCase();
    const password = String(formData.get("password") || "");
    const next = safeNextPath(String(formData.get("next") || ""));
    const selectedAccountType = normalizeAccountType(
      cleanText(formData.get("account_type"))
    );

    if (!email) {
      redirect(
        loginRedirectPath({
          error: "missing_email",
          account: selectedAccountType,
          next
        })
      );
    }

    if (!password) {
      redirect(
        loginRedirectPath({
          error: "missing_password",
          account: selectedAccountType,
          next
        })
      );
    }


    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      redirect(
        loginRedirectPath({
          error: "invalid_login",
          account: selectedAccountType,
          next
        })
      );
    }

    const user = data.user;

    if (!user) {
      redirect(
        loginRedirectPath({
          error: "login_failed",
          account: selectedAccountType,
          next
        })
      );
    }

    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("id, auth_user_id, email, admin_role, status")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (next === "/admin") {
      if (adminUser) {
        redirect("/admin");
      }

      await supabase.auth.signOut();

      redirect(
        loginRedirectPath({
          error: "not_staff",
          next
        })
      );
    }

    if (adminUser) {
      redirect("/admin");
    }

    const profile = await ensureProfileForUser({
      supabaseAdmin,
      user,
      selectedAccountType
    });

    if (profile.account_status === "deleted") {
      await supabase.auth.signOut();

      redirect(
        loginRedirectPath({
          error: "inactive_account",
          account: selectedAccountType,
          next
        })
      );
    }

    if (profile.account_status === "pending_deletion") {
      redirect("/account/delete");
    }

    if (profile.account_status && profile.account_status !== "active") {
      await supabase.auth.signOut();

      redirect(
        loginRedirectPath({
          error: "inactive_account",
          account: selectedAccountType,
          next
        })
      );
    }

    if (selectedAccountType === "owner") {
      if (profile.role !== "owner") {
        await supabase.auth.signOut();

        redirect(
          loginRedirectPath({
            error: "wrong_account_type",
            account: selectedAccountType,
            next
          })
        );
      }

      redirect("/owner/onboarding");
    }

    if (selectedAccountType === "vendor") {
      if (profile.role !== "vendor") {
        await supabase.auth.signOut();

        redirect(
          loginRedirectPath({
            error: "wrong_account_type",
            account: selectedAccountType,
            next
          })
        );
      }

      redirect("/vendor");
    }

    if (selectedAccountType === "customer") {
      if (profile.role !== "customer") {
        await supabase.auth.signOut();

        redirect(
          loginRedirectPath({
            error: "wrong_account_type",
            account: selectedAccountType,
            next
          })
        );
      }

      redirect("/customer");
    }

    redirect("/customer");
  }

  return (
    <section className={isStaffAccess ? "staff-login-clean-page" : ""}>
      <div className={isStaffAccess ? "staff-login-shell" : "auth-shell"}>
        <div className={isStaffAccess ? "card staff-login-card" : "card auth-card"}>
          <span className="badge">
            {isStaffAccess ? (
              <T en="Secure Team Access" ar="دخول الفريق الآمن" />
            ) : (
              <T en="Login" ar="تسجيل الدخول" />
            )}
          </span>

          <h1>
            {isStaffAccess ? (
              <T en="Admin / Staff Login" ar="دخول الأدمن / الموظفين" />
            ) : (
              <T en="Welcome back" ar="مرحبًا بعودتك" />
            )}
          </h1>

          <p>
            {isStaffAccess ? (
              <T
                en="This page is restricted to approved GearBeat team members only."
                ar="هذه الصفحة مخصصة فقط لأعضاء فريق GearBeat المعتمدين."
              />
            ) : (
              <T
                en="Login as a customer, studio owner, or gear vendor."
                ar="سجّل الدخول كمستخدم، صاحب استوديو، أو تاجر معدات."
              />
            )}
          </p>

          {loginMessage ? (
            <div
              className={loginMessage.type === "success" ? "success" : ""}
              style={
                loginMessage.type === "error"
                  ? {
                      marginBottom: 18,
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(226, 109, 90, 0.14)",
                      border: "1px solid rgba(226, 109, 90, 0.35)",
                      color: "var(--gb-danger)"
                    }
                  : { marginBottom: 18 }
              }
            >
              <T en={loginMessage.en} ar={loginMessage.ar} />
            </div>
          ) : null}

          <form className="form" action={login}>
            <input type="hidden" name="next" value={nextPath} />

            {isStaffAccess ? (
              <input type="hidden" name="account_type" value="customer" />
            ) : (
              <>
                <label>
                  <T en="Login as" ar="الدخول كـ" />
                </label>

                <select
                  className="input"
                  name="account_type"
                  defaultValue={defaultAccount}
                  required
                >
                  <option value="customer">Customer / مستخدم</option>
                  <option value="owner">Studio Owner / مالك استوديو</option>
                  <option value="vendor">Gear Vendor / تاجر معدات</option>
                </select>
              </>
            )}

            <label>
              <T en="Email address" ar="البريد الإلكتروني" />
            </label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />

            <label>
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Your password"
              required
            />

            <button className="btn" type="submit">
              {isStaffAccess ? (
                <T en="Enter Dashboard" ar="دخول لوحة الإدارة" />
              ) : (
                <T en="Login" ar="تسجيل الدخول" />
              )}
            </button>
          </form>

          {!isStaffAccess ? (
            <div className="actions" style={{ marginTop: 18 }}>
              <Link
                href="/signup?account=customer"
                className="btn btn-secondary"
              >
                <T en="Create Customer Account" ar="إنشاء حساب مستخدم" />
              </Link>

              <Link href="/signup?account=owner" className="btn btn-secondary">
                <T
                  en="Create Studio Owner Account"
                  ar="إنشاء حساب مالك استوديو"
                />
              </Link>

              <Link href="/vendor-signup" className="btn btn-secondary" style={{ border: '1px solid var(--gb-gold)' }}>
                <T
                  en="Create Gear Vendor Account"
                  ar="إنشاء حساب تاجر معدات"
                />
              </Link>

              <Link href="/" className="btn btn-secondary">
                <T en="Back to Home" ar="العودة للرئيسية" />
              </Link>
            </div>
          ) : (
            <>
              <div
                className="actions"
                style={{ marginTop: 18, justifyContent: "center" }}
              >
                <Link href="/" className="btn btn-secondary">
                  <T en="Back to Home" ar="العودة للصفحة الرئيسية" />
                </Link>
              </div>

              <p className="staff-login-note">
                <T
                  en="If you are not part of the GearBeat team, please use the public login page."
                  ar="إذا لم تكن من فريق GearBeat، الرجاء استخدام صفحة الدخول العامة."
                />
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
