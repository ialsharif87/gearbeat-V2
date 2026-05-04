import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import CountryPhoneFields from "@/components/country-phone-fields";
import { getActiveCountries } from "@/lib/countries";
import { isValidE164, normalizePhoneToE164 } from "@/lib/phone";

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeRole(value: string) {
  if (value === "owner") {
    return "owner";
  }

  return "customer";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectWithError({
  message,
  account,
}: {
  message: string;
  account: "customer" | "owner";
}): never {
  redirect(
    `/signup?account=${account}&error=${encodeURIComponent(message)}`
  );
}

async function deleteAuthUserSafely(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Failed to clean up auth user after signup failure:", error);
    }
  } catch (error) {
    console.error("Unexpected auth cleanup error:", error);
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ account?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const defaultAccount = params?.account === "owner" ? "owner" : "customer";
  const countries = await getActiveCountries();

  async function signup(formData: FormData): Promise<void> {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const fullName = cleanText(formData.get("full_name"));
    const email = normalizeEmail(cleanText(formData.get("email")));
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");
    const role = normalizeRole(cleanText(formData.get("role")));

    const countryCode = cleanText(formData.get("country_code"));
    const phoneCountryCode = cleanText(formData.get("phone_country_code"));
    const phoneLocal = cleanText(formData.get("phone_local"));
    const rawPhoneE164 = cleanText(formData.get("phone_e164"));

    const countries = await getActiveCountries();

    const selectedCountry = countries.find(
      (country) => country.country_code === countryCode
    );

    const phoneE164 =
      rawPhoneE164 ||
      normalizePhoneToE164({
        countryCode,
        localPhone: phoneLocal,
        countries,
      });

    if (!fullName || fullName.length < 2) {
      redirectWithError({
        account: role,
        message: "Full name is required.",
      });
    }

    if (!email || !isValidEmail(email)) {
      redirectWithError({
        account: role,
        message: "Valid email is required.",
      });
    }

    if (!selectedCountry) {
      redirectWithError({
        account: role,
        message: "Selected country is invalid.",
      });
    }

    if (!phoneE164 || !isValidE164(phoneE164)) {
      redirectWithError({
        account: role,
        message:
          "Phone number is invalid. Please select your country and enter a valid phone number.",
      });
    }

    if (!password || password.length < 8) {
      redirectWithError({
        account: role,
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      redirectWithError({
        account: role,
        message: "Passwords do not match.",
      });
    }

    const { data: existingProfile, error: existingProfileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (existingProfileError) {
      console.error("Signup profile lookup error:", existingProfileError);

      redirectWithError({
        account: role,
        message: "Could not verify account availability.",
      });
    }

    if (existingProfile) {
      redirectWithError({
        account: role,
        message: "An account already exists with this email.",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
          phone: phoneE164,
          phone_number: phoneE164,
          mobile: phoneE164,
        },
      },
    });

    if (error) {
      console.error("Signup auth error:", error);

      redirectWithError({
        account: role,
        message:
          "Could not create account. Please check your details and try again.",
      });
    }

    const userId = data.user?.id;

    if (!userId) {
      redirectWithError({
        account: role,
        message: "Could not create account.",
      });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_user_id: userId,
        email,
        full_name: fullName,
        phone: phoneE164,
        country_code: countryCode,
        phone_country_code: phoneCountryCode || selectedCountry.phone_code,
        phone_e164: phoneE164,
        phone_verified: false,
        role,
        account_status: "active",
        preferred_currency: selectedCountry.currency_code,
        preferred_language: "ar",
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Signup profile creation error:", profileError);
      await deleteAuthUserSafely(supabaseAdmin, userId);

      redirectWithError({
        account: role,
        message: "Failed to create user profile. Please try again.",
      });
    }

    if (role === "owner") {
      redirect("/login?account=owner&created=1");
    }

    redirect("/login?account=customer&created=1");
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
              ar="أنشئ حسابك كمستخدم أو مالك استوديو."
            />
          </p>

          {params?.error ? (
            <div
              className="card"
              style={{
                marginBottom: 18,
                borderColor: "rgba(255,77,77,0.4)",
                background: "rgba(255,77,77,0.08)",
              }}
            >
              {params.error}
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

            <CountryPhoneFields
              countries={countries}
              defaultCountryCode="SA"
              countryName="country_code"
              phoneCountryCodeName="phone_country_code"
              phoneLocalName="phone_local"
              phoneE164Name="phone_e164"
            />

            <label>
              <T en="Account type" ar="نوع الحساب" />
            </label>
            <select
              className="input"
              name="role"
              required
              defaultValue={defaultAccount}
            >
              <option value="customer">Customer / مستخدم</option>
              <option value="owner">Studio Owner / مالك استوديو</option>
            </select>

            <p className="admin-muted-line">
              <T
                en="Studio owners must complete business onboarding before their studios can accept bookings."
                ar="ملاك الاستوديوهات يجب أن يكملوا بيانات الشركة والوثائق قبل تفعيل الحجوزات."
              />
            </p>

            <p className="admin-muted-line">
              <T
                en="Want to sell gear instead?"
                ar="تريد بيع المعدات بدلًا من ذلك؟"
              />{" "}
              <Link href="/join/seller">
                <T en="Apply as a vendor" ar="سجل كتاجر" />
              </Link>
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
              <T en="Confirm password" ar="تأكيد كلمة المرور" />
            </label>
            <input
              className="input"
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              required
              minLength={8}
            />

            <button className="btn" type="submit">
              <T en="Create Account" ar="إنشاء الحساب" />
            </button>
          </form>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/login?account=customer" className="btn btn-secondary">
              <T en="Login as Customer" ar="دخول كمستخدم" />
            </Link>

            <Link href="/login?account=owner" className="btn btn-secondary">
              <T en="Login as Studio Owner" ar="دخول كمالك استوديو" />
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
