"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { PasswordInput } from "@/components/ui/password-input";
import CountryPhoneFields from "@/components/country-phone-fields";

import { isValidE164 } from "@/lib/phone";
import { CountryOption } from "@/lib/countries";

export default function SignupClient({ countries }: { countries: CountryOption[] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "studio_owner">("customer");
  const [countryCode, setCountryCode] = useState("SA");
  const [phoneE164, setPhoneE164] = useState("");
  
  const [step, setStep] = useState<"request" | "verification">("request");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password validation state
  const [passRules, setPassRules] = useState({
    length: false,
    variety: false,
    consecutive: false
  });

  useEffect(() => {
    const hasLength = password.length >= 8;
    
    const types = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;
    const hasVariety = types >= 3;

    const hasConsecutive = !/(.)\1\1/.test(password);

    setPassRules({
      length: hasLength,
      variety: hasVariety,
      consecutive: hasConsecutive
    });
  }, [password]);

  const isPasswordValid = passRules.length && passRules.variety && passRules.consecutive;

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const accountParam = searchParams.get("account");
    if (accountParam === "owner" || accountParam === "studio_owner") setRole("studio_owner");
    
    const errorParam = searchParams.get("error");
    if (errorParam) setError(decodeURIComponent(errorParam));
  }, [searchParams]);

  const validateCommonFields = () => {
    if (!fullName || fullName.length < 2) {
      throw new Error("Full name is required.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email is required.");
    }
    const selectedCountry = countries.find(c => c.country_code === countryCode);
    if (!selectedCountry) {
      throw new Error("Selected country is invalid.");
    }
    if (!phoneE164 || !isValidE164(phoneE164)) {
      throw new Error("Phone number is invalid.");
    }
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      validateCommonFields();

      if (!isPasswordValid) {
        throw new Error("Password does not meet the strength requirements.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: role === "studio_owner" ? "owner" : role,
            phone_e164: phoneE164,
          },
        },
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Signup failed.");

      await createProfile(data.user.id);
      setStep("verification");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email_exists")) {
        setError("هذا البريد مسجل مسبقاً / Email already registered");
      } else {
        setError(msg || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(userId: string) {
    const selectedCountry = countries.find(c => c.country_code === countryCode)!;
    
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        auth_user_id: userId,
        email,
        full_name: fullName,
        phone: phoneE164,
        country_code: countryCode,
        phone_e164: phoneE164,
        role: role === "studio_owner" ? "owner" : role,
        account_status: "active",
        preferred_currency: selectedCountry.currency_code,
        preferred_language: "ar",
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error("Account created but profile setup failed. Please contact support.");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <h1>
              <T en="Join GearBeat" ar="انضم إلى GearBeat" />
            </h1>
            <p>
              {step === "request" ? (
                <T en="Create your account with email and password" ar="أنشئ حسابك بالبريد وكلمة المرور" />
              ) : (
                <T en="Complete Verification" ar="أكمل التحقق" />
              )}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {step === "request" ? (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="field">
                <label><T en="Full Name" ar="الاسم الكامل" /></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="gb-input"
                />
              </div>

              <div className="field">
                <label><T en="Email" ar="البريد الإلكتروني" /></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="gb-input"
                />
              </div>

              <CountryPhoneFields
                countries={countries}
                defaultCountryCode="SA"
                countryName="country_code"
                phoneLocalName="phone_local"
                phoneE164Name="phone_e164"
                onCountryChange={(val) => setCountryCode(val)}
                onPhoneE164Change={(val) => setPhoneE164(val)}
              />

              <div className="field">
                <label><T en="I am a..." ar="أنا..." /></label>
                <select
                  className="gb-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "customer" | "studio_owner")}
                >
                  <option value="customer">Customer / مستخدم</option>
                  <option value="studio_owner">Studio Owner / صاحب استوديو</option>
                </select>
              </div>

              <div className="field">
                <label><T en="Password" ar="كلمة المرور" /></label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  variant="portal"
                  autoComplete="new-password"
                />
                
                {password && (
                  <div className="password-checklist animate-up">
                    <p className="checklist-title">
                      <T en="Your password must contain:" ar="يجب أن تحتوي كلمة المرور على:" />
                    </p>
                    <ul>
                      <li className={passRules.length ? "valid" : ""}>
                        {passRules.length ? "✓" : "○"} <T en="At least 8 characters" ar="8 أحرف على الأقل" />
                      </li>
                      <li className={passRules.variety ? "valid" : ""}>
                        {passRules.variety ? "✓" : "○"} <T en="At least 3 of the following:" ar="3 شروط على الأقل من التالي:" />
                        <ul className="sub-list">
                          <li><T en="Lowercase letters a-z" ar="حروف صغيرة a-z" /></li>
                          <li><T en="Uppercase letters A-Z" ar="حروف كبيرة A-Z" /></li>
                          <li><T en="Numbers 0-9" ar="أرقام 0-9" /></li>
                          <li><T en="Special characters like !@#$%^&*" ar="رموز خاصة مثل !@#$%^&*" /></li>
                        </ul>
                      </li>
                      <li className={passRules.consecutive ? "valid" : ""}>
                        {passRules.consecutive ? "✓" : "○"} <T en="No more than 2 identical characters in a row" ar="لا يوجد أكثر من حرفين متطابقين متتاليين" />
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="field">
                <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  variant="portal"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={loading || !isPasswordValid} className="gb-button">
                {loading ? <T en="Creating Account..." ar="جاري إنشاء الحساب..." /> : (
                  <T en="Create Account" ar="إنشاء الحساب" />
                )}
              </button>
            </form>
          ) : (
            <div className="verification-flow animate-fade-in">
              <div className="verification-step">
                <div className="v-icon">📧</div>
                <h3><T en="Verify Email" ar="التحقق من البريد" /></h3>
                <p>
                  <T 
                    en={`We've sent a confirmation link to ${email}. Please check your inbox (and spam) and click the link to activate your account.`}
                    ar={`لقد أرسلنا رابط تأكيد إلى ${email}. يرجى التحقق من بريدك (والمهملات) والنقر على الرابط لتفعيل حسابك.`}
                  />
                </p>
              </div>

              <div className="v-divider" />

              <div className="verification-step">
                <div className="v-icon">📱</div>
                <h3><T en="Phone Verification" ar="التحقق من الجوال" /></h3>
                <p>
                  <T 
                    en="Once you activate your email and log in, you will be prompted to verify your phone number via SMS OTP."
                    ar="بمجرد تفعيل بريدك الإلكتروني وتسجيل الدخول، سيُطلب منك التحقق من رقم جوالك عبر رمز التحقق (SMS OTP)."
                  />
                </p>
                <div className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  <T en="Requires SMS Provider Config" ar="يتطلب إعداد مزود رسائل SMS" />
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <Link href="/login" className="gb-button w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  <T en="Go to Login" ar="الذهاب لتسجيل الدخول" />
                </Link>
              </div>
            </div>
          )}

          <div className="auth-footer">
            <Link href="/login">
              <T en="Already have an account? Login" ar="لديك حساب بالفعل؟ سجل دخولك" />
            </Link>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gb-bg);
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background: var(--gb-card);
          border: 1px solid var(--gb-border);
          border-radius: 24px;
          box-shadow: var(--shadow-premium);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-header h1 {
          font-size: 2rem;
          margin: 0 0 8px;
          color: #fff;
        }
        .auth-header p {
          color: var(--gb-text-muted);
          font-size: 0.95rem;
        }
        .auth-form {
          display: grid;
          gap: 20px;
        }
        .field {
          display: grid;
          gap: 8px;
        }
        .field label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--gb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .gb-input {
          padding: 12px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--gb-border);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s;
          width: 100%;
        }
        .gb-input:focus {
          outline: none;
          border-color: var(--gb-gold);
        }

        .gb-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--gb-gold-light), var(--gb-gold));
          color: #000;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .gb-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-error {
          padding: 12px;
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid #ff4d4d;
          border-radius: 12px;
          color: #ff4d4d;
          font-size: 0.85rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
        }
        .auth-footer a {
          color: var(--gb-gold);
          text-decoration: none;
        }
        .verification-flow {
          display: grid;
          gap: 32px;
          text-align: center;
        }
        .verification-step h3 {
          font-size: 1.25rem;
          margin: 12px 0 8px;
          color: #fff;
        }
        .verification-step p {
          font-size: 0.9rem;
          color: var(--gb-text-muted);
          line-height: 1.6;
        }
        .v-icon {
          font-size: 2.5rem;
        }
        .v-divider {
          height: 1px;
          background: var(--gb-border);
          opacity: 0.5;
        }
        .w-full {
          width: 100%;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .password-checklist {
          margin-top: 12px;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--gb-border);
          border-radius: 12px;
        }
        .checklist-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--gb-gold);
          margin-bottom: 8px;
        }
        .password-checklist ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 6px;
        }
        .password-checklist li {
          font-size: 0.8rem;
          color: var(--gb-text-muted);
          transition: color 0.2s;
        }
        .password-checklist li.valid {
          color: #22c55e;
          font-weight: 600;
        }
        .sub-list {
          margin-top: 4px !important;
          margin-left: 20px !important;
          opacity: 0.8;
          font-size: 0.75rem !important;
        }
        [dir="rtl"] .sub-list {
          margin-left: 0 !important;
          margin-right: 20px !important;
        }
        .animate-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
    </section>
  );
}
