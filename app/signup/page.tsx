import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import T from "../../components/t";

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function cleanPhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function normalizeRole(value: string) {
  if (value === "owner") return "owner";
  return "customer";
}

export default async function SignupPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  async function signup(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const fullName = cleanText(formData.get("full_name"));
    const email = cleanText(formData.get("email")).toLowerCase();
    const phone = cleanPhone(cleanText(formData.get("phone")));
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");
    const role = normalizeRole(cleanText(formData.get("role")));

    if (!fullName || fullName.length < 2) {
      throw new Error("Full name is required.");
    }

    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required.");
    }

    if (!phone || phone.length < 8) {
      throw new Error("Valid phone number is required.");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
          phone,
          phone_number: phone,
          mobile: phone,
          role,
          account_type: role
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    const userId = data.user?.id;

    if (!userId) {
      redirect("/login?signedup=1");
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        auth_user_id: userId,
        email,
        full_name: fullName,
        phone,
        role,
        account_status: "active",
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "auth_user_id"
      }
    );

    if (profileError) {
      throw new Error(profileError.message);
    }

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        name: fullName,
        phone,
        phone_number: phone,
        mobile: phone,
        role,
        account_type: role
      }
    });

    if (role === "owner") {
      redirect("/owner/onboarding");
    }

    redirect("/customer");
  }

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">
          <span className="badge">
            <T en="Create Account" ar="إنشاء حساب" />
          </span>

          <h1>
            <T en="Join GearBeat" ar="انضم إلى GearBeat" />
          </h1>

          <p>
            <T
              en="Create your account as a customer or studio owner."
              ar="أنشئ حسابك كعميل أو صاحب استوديو."
            />
          </p>

          {params?.error ? (
            <div className="error">
              <T en="Signup failed. Please try again." ar="فشل التسجيل. حاول مرة أخرى." />
            </div>
          ) : null}

          {params?.success ? (
            <div className="success">
              <T en="Account created successfully." ar="تم إنشاء الحساب بنجاح." />
            </div>
          ) : null}

          <form className="form" action={signup}>
            <label>
              <T en="Full name" ar="الاسم الكامل" />
            </label>
            <input
              className="input"
              name="full_name"
              type="text"
              placeholder="Your full name"
              required
              minLength={2}
            />

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
              <T en="Phone number" ar="رقم الجوال" />
            </label>
            <input
              className="input"
              name="phone"
              type="tel"
              placeholder="+9665XXXXXXXX"
              required
              minLength={8}
            />

            <label>
              <T en="Account type" ar="نوع الحساب" />
            </label>
            <select className="input" name="role" required defaultValue="customer">
              <option value="customer">
                Customer / عميل
              </option>
              <option value="owner">
                Studio Owner / صاحب استوديو
              </option>
            </select>

            <p className="admin-muted-line">
              <T
                en="Studio owners must complete business onboarding before bookings can be activated."
                ar="أصحاب الاستوديوهات يجب أن يكملوا بيانات الشركة والوثائق قبل تفعيل الحجوزات."
              />
            </p>

            <label>
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />

            <label>
              <T en="Confirm password" ar="تأكيد كلمة المرور" />
            </label>
            <input
              className="input"
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              required
              minLength={6}
            />

            <button className="btn" type="submit">
              <T en="Create Account" ar="إنشاء الحساب" />
            </button>
          </form>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/login" className="btn btn-secondary">
              <T en="Already have an account?" ar="لديك حساب بالفعل؟" />
            </Link>

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
