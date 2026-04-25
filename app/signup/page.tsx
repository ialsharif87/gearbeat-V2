import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

function cleanPhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function cleanIdentityNumber(value: string) {
  return value.replace(/\s+/g, "").trim();
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
    const identityType = String(formData.get("identity_type") || "").trim();
    const identityNumber = cleanIdentityNumber(
      String(formData.get("identity_number") || "")
    );

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!phone || phone.length < 8) {
      throw new Error("Please enter a valid phone number.");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const allowedRoles = ["customer", "owner"];

    if (!allowedRoles.includes(role)) {
      throw new Error("Invalid account type.");
    }

    const allowedIdentityTypes = [
      "national_id",
      "iqama",
      "passport",
      "gcc_id"
    ];

    if (!allowedIdentityTypes.includes(identityType)) {
      throw new Error("Identity type is required.");
    }

    if (!identityNumber || identityNumber.length < 5) {
      throw new Error("Please enter a valid identity number.");
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
          identity_type: identityType,
          identity_number: identityNumber,
          identity_locked: true
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
          identity_type: identityType,
          identity_number: identityNumber,
          identity_locked: true,
          identity_created_at: new Date().toISOString(),
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
              <T en="Identity type" ar="نوع الهوية" />
            </label>
            <select className="input" name="identity_type" required>
              <option value="">Select identity type / اختر نوع الهوية</option>
              <option value="national_id">National ID / هوية وطنية</option>
              <option value="iqama">Iqama / إقامة</option>
              <option value="passport">Passport / جواز سفر</option>
              <option value="gcc_id">GCC ID / هوية خليجية</option>
            </select>

            <label>
              <T en="Identity number" ar="رقم الهوية" />
            </label>
            <input
              className="input"
              name="identity_number"
              type="text"
              placeholder="Identity / Iqama / Passport number"
              required
              minLength={5}
            />

            <p className="admin-muted-line">
              <T
                en="Identity details cannot be changed after signup."
                ar="لا يمكن تغيير بيانات الهوية بعد إنشاء الحساب."
              />
            </p>

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
