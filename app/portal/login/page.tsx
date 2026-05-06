"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handlePostLogin(user: any) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    const role = profile?.role;
    const status = profile?.account_status;

    if (status === "pending" || status === "under_review") {
      router.push("/portal/pending");
      return;
    }

    const { data: lead } = await supabase
      .from('provider_leads')
      .select('signed_contract_url, status')
      .eq('email', user.email)
      .maybeSingle();

    if (!lead?.signed_contract_url) {
      router.push('/portal/first-login');
      return;
    }

    if (role === "owner" || role === "studio_owner") {
      router.push("/portal/studio");
    } else if (role === "vendor") {
      router.push("/portal/store");
    } else {
      await supabase.auth.signOut();
      throw new Error(
        "Access denied. This portal is for verified providers only."
      );
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Invalid email or password");

      const user = data.user;
      if (!user) throw new Error("Login failed");

      await handlePostLogin(user);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPRequest(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (authError) throw authError;

      setStep("verify");
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("Verification failed");

      await handlePostLogin(user);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gb-portal-auth-page">
      <section className="gb-portal-auth-card">
        <div className="gb-portal-auth-brand">
          <p className="gb-eyebrow">GearBeat Portal</p>
          <h1>
            <T en="Sign In" ar="تسجيل الدخول" />
          </h1>
          <p className="gb-muted-text">
            {authMode === "password" ? (
              <T 
                en="Enter the studio or store portal to manage your account and orders." 
                ar="ادخل إلى بوابة الاستوديو أو المتجر لإدارة حسابك وطلباتك." 
              />
            ) : step === "request" ? (
              <T en="Enter your business email to receive a code" ar="أدخل بريدك الإلكتروني لاستلام رمز الدخول" />
            ) : (
              <T en="Enter the 6-digit code sent to your email" ar="أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك" />
            )}
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              padding: '12px', 
              background: 'rgba(255, 77, 77, 0.1)', 
              border: '1px solid #ff4d4d', 
              borderRadius: '12px', 
              color: '#ff4d4d', 
              fontSize: '0.85rem', 
              marginBottom: '24px', 
              textAlign: 'center' 
            }}
          >
            {error}
          </div>
        )}

        {authMode === "password" ? (
          <form onSubmit={handleLogin}>
            <label>
              <T en="Email" ar="البريد الإلكتروني" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                required
              />
            </label>
            <label>
              <T en="Password" ar="كلمة المرور" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            
            <button type="submit" disabled={loading} className="gb-button">
              {loading ? (
                <T en="Signing in..." ar="جاري الدخول..." />
              ) : (
                <T en="Sign In" ar="تسجيل الدخول" />
              )}
            </button>

            <button
              type="button"
              className="gb-text-btn"
              style={{ background: 'none', border: 'none', color: '#cfa86e', width: '100%', marginTop: '16px', cursor: 'pointer' }}
              onClick={() => {
                setAuthMode("otp");
                setStep("request");
                setError(null);
              }}
            >
              <T en="Login with code (OTP)" ar="تسجيل الدخول برمز (OTP)" />
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/forgot-password" style={{ color: '#cfa86e', fontSize: '0.85rem', textDecoration: 'none' }}>
                <T en="Forgot password?" ar="نسيت كلمة المرور؟" />
              </a>
            </div>
          </form>
        ) : (
          <div className="otp-container">
            {step === "request" ? (
              <form onSubmit={handleOTPRequest}>
                <label>
                  <T en="Email" ar="البريد الإلكتروني" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    required
                  />
                </label>
                <button type="submit" disabled={loading} className="gb-button">
                  {loading ? <T en="Sending..." ar="جاري الإرسال..." /> : <T en="Send Code" ar="إرسال الرمز" />}
                </button>
                <button
                  type="button"
                  className="gb-text-btn"
                  style={{ background: 'none', border: 'none', color: '#cfa86e', width: '100%', marginTop: '16px', cursor: 'pointer' }}
                  onClick={() => {
                    setAuthMode("password");
                    setError(null);
                  }}
                >
                  <T en="Back to password login" ar="العودة للدخول بكلمة المرور" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerify}>
                <label>
                  <T en="Verification Code" ar="رمز التحقق" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    required
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                  />
                </label>
                <button type="submit" disabled={loading} className="gb-button">
                  {loading ? <T en="Verifying..." ar="جاري التحقق..." /> : <T en="Verify & Login" ar="تحقق ودخول" />}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleOTPRequest}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                      opacity: cooldown > 0 ? 0.5 : 1
                    }}
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
                    style={{ background: 'none', border: 'none', color: '#cfa86e', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => {
                      setStep("request");
                      setError(null);
                    }}
                  >
                    <T en="Change email" ar="تغيير البريد الإلكتروني" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="gb-portal-auth-actions">
          <a href="/login">
            <T en="Customer login" ar="الدخول من صفحة العملاء" />
          </a>
          <a href="/signup">
            <T en="Create new account" ar="إنشاء حساب جديد" />
          </a>
        </div>
      </section>
    </main>
  );
}
