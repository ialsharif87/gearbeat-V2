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

export default function StudioOwnerSignupClient({ countries }: { countries: CountryOption[] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role = "owner"; // Hardcoded to owner (canonical DB role for studio_owner)
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
    if (!phoneE164 || !isValidE164(phoneE164)) {
      throw new Error("Valid phone number is required.");
    }
    if (!isPasswordValid) {
      throw new Error("Password does not meet requirements.");
    }
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      validateCommonFields();

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
            role: role,
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
        role: role,
        account_status: "pending", // Studio owners start as pending review or first-login
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
              <T en="Join as a Studio Partner" ar="انضم كشريك استوديو" />
            </h1>
            <p>
              {step === "request" ? (
                <T 
                  en="Create an account to list and manage your music studios" 
                  ar="أنشئ حسابك لإدراج وإدارة استوديوهاتك الموسيقية" 
                />
              ) : (
                <T en="Verify your account" ar="التحقق من حسابك" />
              )}
            </p>
          </div>

          {error && <div className="error-box animate-shake">{error}</div>}

          {step === "request" ? (
            <form onSubmit={handleSignup} className="form">
              <div className="field">
                <label><T en="Full Name" ar="الاسم الكامل" /></label>
                <input
                  className="gb-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Abdullah Ahmed"
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label><T en="Business Email" ar="البريد الإلكتروني للعمل" /></label>
                <input
                  className="gb-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.com"
                  required
                  autoComplete="email"
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
                  <T en="Register as Partner" ar="التسجيل كشريك" />
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
                    en={`We've sent a confirmation link to ${email}. Please check your inbox (and spam) and click the link to activate your partner account.`}
                    ar={`لقد أرسلنا رابط تأكيد إلى ${email}. يرجى التحقق من بريدك (والمهملات) والنقر على الرابط لتفعيل حساب الشريك الخاص بك.`}
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
                <Link href="/portal/login" className="gb-button w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  <T en="Go to Partner Login" ar="الذهاب لتسجيل دخول الشركاء" />
                </Link>
              </div>
            </div>
          )}

          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <Link href="/portal/login">
              <T en="Already have a partner account? Login" ar="لديك حساب شريك بالفعل؟ سجل دخولك" />
            </Link>
            <div style={{ fontSize: '0.9rem', borderTop: '1px solid var(--gb-border)', width: '100%', paddingTop: 12, textAlign: 'center' }}>
              <Link href="/signup" style={{ color: '#D4AF37' }}>
                <T en="Looking to book studios? Create a customer account" ar="تبحث عن حجز استوديو؟ أنشئ حساب عميل" />
              </Link>
            </div>
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
        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gb-text-muted);
        }
        .gb-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--gb-border);
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .gb-input:focus {
          border-color: #D4AF37;
          outline: none;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }
        .gb-button {
          background: #D4AF37;
          color: #000;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gb-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .gb-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 20px;
        }
        .password-checklist {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--gb-border);
          padding: 12px 16px;
          border-radius: 12px;
          margin-top: 8px;
        }
        .checklist-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--gb-text-muted);
          margin: 0 0 8px;
        }
        .password-checklist ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .password-checklist li {
          font-size: 0.75rem;
          color: #555;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        .password-checklist li.valid {
          color: #22c55e;
        }
        .sub-list {
          padding-inline-start: 14px !important;
          margin-top: 4px !important;
          gap: 4px !important;
        }
        .sub-list li {
          color: #666 !important;
          list-style-type: disc !important;
          display: list-item !important;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
        }
        .auth-footer a {
          color: var(--gb-text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer a:hover {
          color: #fff;
        }
        .verification-flow {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 10px 0;
        }
        .verification-step {
          text-align: center;
        }
        .v-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }
        .verification-step h3 {
          font-size: 1.2rem;
          color: #fff;
          margin: 0 0 8px;
        }
        .verification-step p {
          color: var(--gb-text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
        .v-divider {
          height: 1px;
          background: var(--gb-border);
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 99px;
          font-weight: 700;
        }
        .badge-gold {
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.2);
          margin-top: 8px;
        }
        .w-full {
          width: 100%;
        }
        
        /* Animations */
        .animate-up {
          animation: slideUp 0.2s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(4px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* RTL support */
        :global(html[dir="rtl"]) .auth-page {
          text-align: right;
          direction: rtl;
        }
      `
        }}
      />
    </section>
  );
}
