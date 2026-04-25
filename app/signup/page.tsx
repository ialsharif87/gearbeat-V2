import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

function cleanPhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

export default function SignupPage() {
  async function signUp(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const fullName = String(formData.get("full_name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = cleanPhone(String(formData.get("phone") || ""));
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "customer");

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!phone) {
      throw new Error("Phone number is required.");
    }

    if (phone.length < 8) {
      throw new Error("Please enter a valid phone number.");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const allowedRoles = ["customer", "owner"];

    if (!allowedRoles.includes(role)) {
      throw new Error("Invalid account type.");
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
          role
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert(
        {
          auth_user_id: userId,
          email,
          full_name: fullName,
          phone,
          role,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "auth_user_id"
        }
      );
    }

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
            <T en="Create Account" ar="إنشاء حساب" />
          </span>

          <h1>
            <T en="Join GearBeat" ar="انضم إلى GearBeat" />
          </h1>

          <p>
            <T
              en="Create your account to book studios or list your own studio."
              ar="أنشئ حسابك لحجز الاستوديوهات أو إضافة استوديو خاص بك."
            />
          </p>

          <form className="form" action={signUp}>
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
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />

            <label>
              <T en="Account type" ar="نوع الحساب" />
            </label>
            <select className="input" name="role" defaultValue="customer" required>
              <option value="customer">Customer / عميل</option>
              <option value="owner">Studio Owner / صاحب استوديو</option>
            </select>

            <button className="btn" type="submit">
              <T en="Create Account" ar="إنشاء الحساب" />
            </button>
          </form>

          <p style={{ marginTop: 18 }}>
            <T en="Already have an account?" ar="لديك حساب بالفعل؟" />{" "}
            <Link href="/login">
              <T en="Login" ar="تسجيل الدخول" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
