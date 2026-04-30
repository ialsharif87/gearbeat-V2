import Link from "next/link";
import T from "@/components/t";
import CountryPhoneFields from "@/components/country-phone-fields";
import { getActiveCountries } from "@/lib/countries";
import { signUpVendor } from "./actions";

export default async function VendorSignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const countries = await getActiveCountries();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="badge badge-gold">
            <T en="Vendor Program" ar="برنامج التجار" />
          </span>

          <h1>
            <T en="Sell on GearBeat" ar="بع معداتك على GearBeat" />
          </h1>

          <p>
            <T
              en="Create your vendor account and submit your store for admin approval."
              ar="أنشئ حساب التاجر وأرسل متجرك لموافقة الإدارة."
            />
          </p>
        </div>

        {params?.error ? (
          <div
            className="card"
            style={{
              marginBottom: 20,
              borderColor: "rgba(255,77,77,0.4)",
              background: "rgba(255,77,77,0.08)",
            }}
          >
            {params.error}
          </div>
        ) : null}

        <form action={signUpVendor} className="auth-form">
          <div>
            <label>
              <T en="Full Name" ar="الاسم الكامل" />
            </label>
            <input
              name="fullName"
              className="input"
              required
              minLength={2}
              placeholder="Your name"
            />
          </div>

          <div>
            <label>
              <T en="Business / Store Name" ar="اسم المتجر أو الشركة" />
            </label>
            <input
              name="businessName"
              className="input"
              required
              minLength={2}
              placeholder="Gear Store"
            />
          </div>

          <CountryPhoneFields
            countries={countries}
            defaultCountryCode="SA"
            countryName="country_code"
            phoneCountryCodeName="phone_country_code"
            phoneLocalName="phone_local"
            phoneE164Name="phone_e164"
          />

          <div>
            <label>
              <T en="Email" ar="البريد الإلكتروني" />
            </label>
            <input
              name="email"
              type="email"
              className="input"
              required
              placeholder="vendor@example.com"
            />
          </div>

          <div>
            <label>
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              name="password"
              type="password"
              className="input"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large w-full">
            <T en="Create Vendor Account" ar="إنشاء حساب تاجر" />
          </button>
        </form>

        <p className="auth-switch">
          <T en="Already have an account?" ar="لديك حساب بالفعل؟" />{" "}
          <Link href="/login?account=vendor">
            <T en="Login" ar="تسجيل الدخول" />
          </Link>
        </p>
      </section>
    </main>
  );
}
