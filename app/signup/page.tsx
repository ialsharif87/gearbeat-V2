"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import CountryPhoneFields from "@/components/country-phone-fields";
import { getActiveCountries } from "@/lib/countries";
import { isValidE164, normalizePhoneToE164 } from "@/lib/phone";

type Country = {
  country_code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
};

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [countryCode, setCountryCode] = useState("SA");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  
  const [authMode, setAuthMode] = useState<"password" | "otp">("otp");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function fetchCountries() {
      const data = await getActiveCountries();
      setCountries(data);
    }
    fetchCountries();
    
    const accountParam = searchParams.get("account");
    if (accountParam === "owner") setRole("owner");
    
    const errorParam = searchParams.get("error");
    if (errorParam) setError(decodeURIComponent(errorParam));
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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

      if (authMode === "password") {
        if (!password || password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (authError) throw authError;
        if (!data.user) throw new Error("Signup failed.");

        // Profile is usually created via trigger or manual call
        // In this project, it seems it was done in the server action
        await createProfile(data.user.id);
        router.push(`/login?account=${role}&created=1`);
      } else {
        // OTP Mode - Request
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            data: {
              full_name: fullName,
              role,
            }
          },
        });

        if (authError) throw authError;

        setStep("verify");
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup", // Use 'signup' or 'email' depending on flow
      });

      // Try 'email' type if 'signup' fails, or vice versa
      let verifyResult = { data, error: authError };
      if (authError) {
        verifyResult = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: "email",
        });
      }

      if (verifyResult.error) throw verifyResult.error;

      const user = verifyResult.data.user;
      if (!user) throw new Error("Verification failed");

      await createProfile(user.id);
      router.push(role === "owner" ? "/portal/studio" : "/customer");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(userId: string) {
    const selectedCountry = countries.find(c => c.country_code === countryCode)!;
    
    // Check if profile already exists (e.g. if signUp already triggered it)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId, // Using id instead of auth_user_id as per profiles schema check
        auth_user_id: userId,
        email,
        full_name: fullName,
        phone: phoneE164,
        country_code: countryCode,
        phone_e164: phoneE164,
        role,
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
                <T en="Create your account to get started" ar="أنشئ حسابك للبدء" />
              ) : (
                <T en="Verify your email" ar="تحقق من بريدك الإلكتروني" />
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
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="customer">Customer / مستخدم</option>
                  <option value="owner">Studio Owner / مالك استوديو</option>
                </select>
              </div>

              {authMode === "password" && (
                <>
                  <div className="field">
                    <label><T en="Password" ar="كلمة المرور" /></label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="gb-input"
                    />
                  </div>
                  <div className="field">
                    <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="gb-input"
                    />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="gb-button">
                {loading ? <T en="Processing..." ar="جاري المعالجة..." /> : (
                  authMode === "password" ? <T en="Create Account" ar="إنشاء الحساب" /> : <T en="Send Verification Code" ar="إرسال رمز التحقق" />
                )}
              </button>

              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setAuthMode(authMode === "password" ? "otp" : "password");
                  setError(null);
                }}
              >
                {authMode === "password" ? (
                  <T en="Signup with code (OTP) instead" ar="التسجيل عبر رمز (OTP) بدلاً من ذلك" />
                ) : (
                  <T en="Signup with password instead" ar="التسجيل بكلمة مرور بدلاً من ذلك" />
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="field">
                <label><T en="Verification Code" ar="رمز التحقق" /></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  required
                  className="gb-input"
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                />
              </div>
              <button type="submit" disabled={loading} className="gb-button">
                {loading ? <T en="Verifying..." ar="جاري التحقق..." /> : <T en="Verify & Complete" ar="تحقق وإكمال" />}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  className="resend-btn"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSignup}
                >
                  {cooldown > 0 ? (
                    <T
                      en={`Resend in ${cooldown}s`}
                      ar={`أعد الإرسال بعد ${cooldown} ثانية`}
                    />
                  ) : (
                    <T en="Resend Code" ar="أعد إرسال الرمز" />
                  )}
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setStep("request");
                    setError(null);
                  }}
                >
                  <T en="Back to details" ar="العودة للبيانات" />
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <Link href="/login">
              <T en="Already have an account? Login" ar="لديك حساب بالفعل؟ سجل دخولك" />
            </Link>
          </div>
        </div>
      </div>

      {/* 
        TODO: SMS OTP — add when ready
        Requires: Twilio or Vonage setup in Supabase dashboard
      */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
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
          color: #64748b;
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
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }
        .gb-input {
          padding: 12px 16px;
          background: #000;
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s;
          width: 100%;
        }
        .gb-input:focus {
          outline: none;
          border-color: #D4AF37;
        }
        .gb-button {
          padding: 14px;
          background: #D4AF37;
          color: #000;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 900;
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
          color: #D4AF37;
          text-decoration: none;
        }
        .text-btn {
          background: none;
          border: none;
          color: #D4AF37;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 8px;
          transition: opacity 0.2s;
        }
        .text-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .otp-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        .resend-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .resend-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: #D4AF37;
        }
        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #64748b;
        }
      `,
        }}
      />
    </section>
  );
}
