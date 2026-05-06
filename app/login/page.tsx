"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function LoginPage() {
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

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        const role = profile?.role;
        if (role === "owner" || role === "studio_owner") {
          router.replace("/portal/studio");
        } else if (role === "vendor") {
          router.replace("/portal/store");
        } else {
          router.replace("/customer");
        }
      }
    }
    checkUser();
  }, [supabase, router]);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role;
      if (role === "owner" || role === "studio_owner") {
        router.push("/portal/studio");
      } else if (role === "vendor") {
        router.push("/portal/store");
      } else {
        router.push("/customer");
      }
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
          shouldCreateUser: false, // Ensure they already have an account
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role;
      if (role === "owner" || role === "studio_owner") {
        router.push("/portal/studio");
      } else if (role === "vendor") {
        router.push("/portal/store");
      } else {
        router.push("/customer");
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            <T en="Welcome back" ar="مرحباً بعودتك" />
          </h1>
          <p>
            {authMode === "password" ? (
              <T en="Sign in to your GearBeat account" ar="سجّل دخولك إلى حسابك" />
            ) : step === "request" ? (
              <T en="Enter your email to receive a code" ar="أدخل بريدك الإلكتروني لاستلام رمز الدخول" />
            ) : (
              <T en="Enter the 6-digit code sent to your email" ar="أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك" />
            )}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {authMode === "password" ? (
          <form onSubmit={handleLogin} className="auth-form">
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
              <Link 
                href="/forgot-password" 
                style={{ 
                  fontSize: '0.8rem', 
                  color: '#D4AF37', 
                  textDecoration: 'none',
                  marginTop: '4px',
                  display: 'inline-block'
                }}
              >
                <T en="Forgot password?" ar="نسيت كلمة المرور؟" />
              </Link>
            </div>
            <button type="submit" disabled={loading} className="gb-button">
              {loading ? <T en="Signing in..." ar="جاري الدخول..." /> : <T en="Sign In" ar="تسجيل الدخول" />}
            </button>
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setAuthMode("otp");
                setStep("request");
                setError(null);
              }}
            >
              <T en="Login with code (OTP)" ar="تسجيل الدخول برمز (OTP)" />
            </button>
          </form>
        ) : (
          <div className="otp-container">
            {step === "request" ? (
              <form onSubmit={handleOTPRequest} className="auth-form">
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
                <button type="submit" disabled={loading} className="gb-button">
                  {loading ? <T en="Sending..." ar="جاري الإرسال..." /> : <T en="Send Code" ar="إرسال الرمز" />}
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setAuthMode("password");
                    setError(null);
                  }}
                >
                  <T en="Back to password login" ar="العودة للدخول بكلمة المرور" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerify} className="auth-form">
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
                  {loading ? <T en="Verifying..." ar="جاري التحقق..." /> : <T en="Verify & Login" ar="تحقق ودخول" />}
                </button>

                <div className="otp-actions">
                  <button
                    type="button"
                    className="resend-btn"
                    disabled={cooldown > 0 || loading}
                    onClick={handleOTPRequest}
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
                    <T en="Change email" ar="تغيير البريد الإلكتروني" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 
          TODO: SMS OTP — add when ready
          Replace signInWithOtp email with phone:
          supabase.auth.signInWithOtp({ phone: '+966XXXXXXXXX' })
          Requires: Twilio or Vonage setup in Supabase dashboard
          + SMS provider account
        */}

        <div className="auth-footer">
          <Link href="/signup">
            <T en="New to GearBeat? Create account" ar="جديد؟ أنشئ حساباً" />
          </Link>
        </div>

        <div className="auth-switcher">
          <Link href="/portal/login" className="muted-link">
            <T en="Are you a studio or seller?" ar="هل أنت استوديو أو تاجر؟" />
          </Link>
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
          background: #020617;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }
        .auth-footer a {
          color: #D4AF37;
          text-decoration: none;
        }
        .auth-switcher {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #1a1a1a;
          text-align: center;
        }
        .muted-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
        }
        .muted-link:hover {
          color: #fff;
        }
        .text-btn {
          background: none;
          border: none;
          color: #D4AF37;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 8px;
          margin-top: 8px;
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
    </div>
  );
}
