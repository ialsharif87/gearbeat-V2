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

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const nextPath = safeNextPath(params?.next);

  async function login(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const next = safeNextPath(String(formData.get("next") || ""));

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

    const role = user.user_metadata?.role || "customer";

    if (role === "owner") {
      redirect("/owner");
    }

    redirect("/customer");
  }

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">
          <span className="badge">
            {nextPath === "/admin" ? (
              <T en="Team Access" ar="دخول الفريق" />
            ) : (
              <T en="Login" ar="تسجيل الدخول" />
            )}
          </span>

          <h1>
            {nextPath === "/admin" ? (
              <T en="Admin / Staff Login" ar="دخول الأدمن / الموظفين" />
            ) : (
              <T en="Welcome back" ar="مرحبًا بعودتك" />
            )}
          </h1>

          <p>
            {nextPath === "/admin" ? (
              <T
                en="Use your approved admin or staff account to access the GearBeat dashboard."
                ar="استخدم حساب الأدمن أو الموظف المعتمد لدخول لوحة تحكم GearBeat."
              />
            ) : (
              <T
                en="Login to manage your bookings, profile, or studio dashboard."
                ar="سجّل الدخول لإدارة حجوزاتك، ملفك الشخصي، أو لوحة الاستوديو."
              />
            )}
          </p>

          <form className="form" action={login}>
            <input type="hidden" name="next" value={nextPath} />

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
              {nextPath === "/admin" ? (
                <T en="Enter Admin Dashboard" ar="دخول لوحة الإدارة" />
              ) : (
                <T en="Login" ar="تسجيل الدخول" />
              )}
            </button>
          </form>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/signup" className="btn btn-secondary">
              <T en="Create Account" ar="إنشاء حساب" />
            </Link>

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>

          {nextPath === "/admin" ? (
            <p className="admin-muted-line" style={{ marginTop: 18 }}>
              <T
                en="Public users cannot access the admin dashboard."
                ar="المستخدمون العاديون لا يمكنهم دخول لوحة الإدارة."
              />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
