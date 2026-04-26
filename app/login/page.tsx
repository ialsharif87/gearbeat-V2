import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";

function safeNextPath(value: string | null | undefined) {
  if (!value) return "";
  if (!value.startsWith("/")) return "";
  if (value.startsWith("//")) return "";
  return value;
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeAccountType(value: string) {
  if (value === "owner") return "owner";
  return "customer";
}

async function ensureProfileForUser({
  supabaseAdmin,
  user,
  selectedAccountType
}: {
  supabaseAdmin: any;
  user: any;
  selectedAccountType: "customer" | "owner";
}) {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    const metadataRole = user.user_metadata?.role;

    if (
      selectedAccountType === "owner" &&
      existingProfile.role !== "owner" &&
      metadataRole === "owner"
    ) {
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          role: "owner",
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
    selectedAccountType === "owner" || metadataRole === "owner"
      ? "owner"
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
  searchParams?: Promise<{ next?: string; account?: string; created?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const nextPath = safeNextPath(params?.next);

  const isStaffAccess = nextPath === "/admin";
  const defaultAccount =
    params?.account === "owner" ? "owner" : "customer";

  async function login(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const email = cleanText(formData.get("email")).toLowerCase();
    const password = String(formData.get("password") || "");
    const next = safeNextPath(String(formData.get("next") || ""));
    const selectedAccountType = normalizeAccountType(
      cleanText(formData.get("account_type"))
    ) as "customer" | "owner";

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!password) {
      throw new Error("Password is required.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;

    if (!user) {
      throw new Error("Login failed.");
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

      redirect("/forbidden");
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
      redirect("/forbidden");
    }

    if (profile.account_status === "pending_deletion") {
      redirect("/account/delete");
    }

    if (selectedAccountType === "owner") {
      if (profile.role !== "owner") {
        redirect("/forbidden");
      }

      redirect("/owner/onboarding");
    }

    if (selectedAccountType === "customer") {
      if (profile.role !== "customer") {
        redirect("/forbidden");
      }

      redirect("/customer");
    }

    redirect("/customer");
  }

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">
          <span className="badge">
            {isStaffAccess ? (
              <T en="Team Access" ar="دخول الفريق" />
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
                en="Use your approved admin or staff account to access the GearBeat dashboard."
                ar="استخدم حساب الأدمن أو الموظف المعتمد لدخول لوحة تحكم GearBeat."
              />
            ) : (
              <T
                en="Login as a customer or studio owner."
                ar="سجّل الدخول كمستخدم أو مالك استوديو."
              />
            )}
          </p>

          {params?.created ? (
            <div className="success" style={{ marginBottom: 18 }}>
              <T
                en="Account created. Please login to continue."
                ar="تم إنشاء الحساب. الرجاء تسجيل الدخول للمتابعة."
              />
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
                <T en="Enter Admin Dashboard" ar="دخول لوحة الإدارة" />
              ) : (
                <T en="Login" ar="تسجيل الدخول" />
              )}
            </button>
          </form>

          <div className="actions" style={{ marginTop: 18 }}>
            {!isStaffAccess ? (
              <>
                <Link
                  href="/signup?account=customer"
                  className="btn btn-secondary"
                >
                  <T en="Create Customer Account" ar="إنشاء حساب مستخدم" />
                </Link>

                <Link
                  href="/signup?account=owner"
                  className="btn btn-secondary"
                >
                  <T
                    en="Create Studio Owner Account"
                    ar="إنشاء حساب مالك استوديو"
                  />
                </Link>
              </>
            ) : null}

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>

          {isStaffAccess ? (
            <p className="admin-muted-line" style={{ marginTop: 18 }}>
              <T
                en="Public users and studio owners cannot access the admin dashboard."
                ar="المستخدمون وملاك الاستوديوهات لا يمكنهم دخول لوحة الإدارة."
              />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
