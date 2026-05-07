"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

    if (profileError) console.error("Profile fetch error:", profileError);

    const role = profile?.role;
    const status = profile?.account_status;

    if (status === "pending" || status === "under_review") {
      router.push("/portal/pending");
      return;
    }

    const { data: lead } = await supabase
      .from('provider_leads')
      .select('signed_contract_url')
      .eq('email', user.email)
      .maybeSingle();

    const { data: studioApp } = await supabase
      .from('studio_applications')
      .select('contract_url')
      .eq('email', user.email)
      .maybeSingle();

    const hasContract = !!(lead?.signed_contract_url || studioApp?.contract_url);

    if (!hasContract) {
      router.push('/portal/first-login');
      return;
    }

    if (role === "owner" || role === "studio_owner") {
      router.push("/portal/studio");
    } else if (role === "vendor") {
      router.push("/portal/store");
    } else {
      await supabase.auth.signOut();
      throw new Error("Access denied. This portal is for verified providers only.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error("Invalid email or password");
      if (!data.user) throw new Error("Login failed");
      await handlePostLogin(data.user);
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
        options: { shouldCreateUser: false },
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
      if (!data.user) throw new Error("Verification failed");
      await handlePostLogin(data.user);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-login-root">
      <div className="login-overlay"></div>
      
      <div className="login-container">
        <header className="login-header">
          <div className="brand-logo">GearBeat</div>
          <div className="portal-badge">
            <T en="PROVIDER PORTAL" ar="بوابة المزودين" />
          </div>
        </header>

        <section className="login-card">
          <div className="card-top">
            <h1>
              <T en="Welcome Back" ar="مرحباً بعودتك" />
            </h1>
            <p className="subtitle">
              {authMode === "password" ? (
                <T 
                  en="Access your studio management dashboard" 
                  ar="ادخل إلى لوحة التحكم الخاصة باستوديو الخاص بك" 
                />
              ) : step === "request" ? (
                <T en="Login securely with a one-time code" ar="سجل دخولك بأمان عبر رمز لمرة واحدة" />
              ) : (
                <T en="Enter the 6-digit code sent to your email" ar="أدخل الرمز المكون من 6 أرقام المرسل لبريدك" />
              )}
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">!</span>
              {error}
            </div>
          )}

          <div className="auth-form-wrapper">
            {authMode === "password" ? (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="input-group">
                  <label><T en="Business Email" ar="البريد الإلكتروني" /></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="input-group">
                  <div className="label-row">
                    <label><T en="Password" ar="كلمة المرور" /></label>
                    <Link href="/forgot-password" title="Forgot password?" className="forgot-link">
                      <T en="Forgot?" ar="نسيت؟" />
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <button type="submit" disabled={loading} className="submit-btn primary">
                  {loading ? <span className="loader"></span> : <T en="Sign In" ar="تسجيل الدخول" />}
                </button>

                <div className="divider">
                  <span><T en="OR" ar="أو" /></span>
                </div>

                <button
                  type="button"
                  className="submit-btn secondary"
                  onClick={() => {
                    setAuthMode("otp");
                    setStep("request");
                    setError(null);
                  }}
                >
                  <T en="Login with OTP" ar="تسجيل الدخول برمز مؤقت" />
                </button>
              </form>
            ) : (
              <div className="otp-flow">
                {step === "request" ? (
                  <form onSubmit={handleOTPRequest} className="auth-form">
                    <div className="input-group">
                      <label><T en="Business Email" ar="البريد الإلكتروني" /></label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@business.com"
                        required
                      />
                    </div>
                    <button type="submit" disabled={loading} className="submit-btn primary">
                      {loading ? <span className="loader"></span> : <T en="Send Secure Code" ar="إرسال رمز الأمان" />}
                    </button>
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => { setAuthMode("password"); setError(null); }}
                    >
                      ← <T en="Back to password" ar="العودة لكلمة المرور" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPVerify} className="auth-form">
                    <div className="input-group centered">
                      <label><T en="Verification Code" ar="رمز التحقق" /></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000 000"
                        required
                        className="otp-input"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="submit-btn primary">
                      {loading ? <span className="loader"></span> : <T en="Verify & Access" ar="تحقق ودخول" />}
                    </button>

                    <div className="otp-actions">
                      <button
                        type="button"
                        disabled={cooldown > 0 || loading}
                        onClick={handleOTPRequest}
                        className="resend-btn"
                      >
                        {cooldown > 0 ? (
                          <T en={`Resend in ${cooldown}s`} ar={`إعادة بعد ${cooldown} ثانية`} />
                        ) : (
                          <T en="Resend Code" ar="إعادة إرسال الرمز" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="change-email-btn"
                        onClick={() => { setStep("request"); setError(null); }}
                      >
                        <T en="Change email" ar="تغيير البريد" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="login-footer">
          <Link href="/login" className="footer-link">
            <T en="Customer Portal" ar="بوابة العملاء" />
          </Link>
          <div className="footer-dot"></div>
          <Link href="/join/studio" className="footer-link highlighted">
            <T en="Become a Partner" ar="كن شريكاً معنا" />
          </Link>
        </footer>
      </div>

      <style jsx global>{`
        .portal-login-root {
          min-height: 100vh;
          background: #080706;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 70% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 10% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 30%);
          pointer-events: none;
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .brand-logo {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -1.5px;
          color: #D4AF37;
          margin-bottom: 12px;
        }

        .portal-badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .login-card {
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .card-top {
          text-align: center;
          margin-bottom: 32px;
        }

        .card-top h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .error-alert {
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.2);
          color: #ff6b6b;
          padding: 14px;
          border-radius: 16px;
          font-size: 0.85rem;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-icon {
          background: #ff4d4d;
          color: #fff;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.7rem;
        }

        .auth-form {
          display: grid;
          gap: 24px;
        }

        .input-group {
          display: grid;
          gap: 10px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #aaa;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 1rem;
          transition: all 0.2s ease;
          width: 100%;
          outline: none;
        }

        .input-group input:focus {
          border-color: #D4AF37;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
        }

        .forgot-link {
          color: #D4AF37;
          font-size: 0.8rem;
          text-decoration: none;
          font-weight: 600;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .forgot-link:hover { opacity: 1; }

        .submit-btn {
          height: 56px;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .submit-btn.primary {
          background: #D4AF37;
          color: #000;
        }

        .submit-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(212, 175, 55, 0.4);
        }

        .submit-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .submit-btn.secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 8px 0;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider span {
          color: #444;
          font-size: 0.75rem;
          font-weight: 900;
        }

        .back-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
          transition: color 0.2s;
        }

        .back-btn:hover { color: #fff; }

        .otp-input {
          text-align: center;
          letter-spacing: 12px;
          font-size: 1.5rem !important;
          font-weight: 800;
        }

        .otp-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }

        .resend-btn, .change-email-btn {
          background: none;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .resend-btn { color: #888; }
        .resend-btn:not(:disabled):hover { color: #fff; }
        .change-email-btn { color: #D4AF37; opacity: 0.8; }
        .change-email-btn:hover { opacity: 1; }

        .login-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .footer-link {
          color: #666;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .footer-link:hover { color: #aaa; }
        .footer-link.highlighted { color: #D4AF37; }

        .footer-dot {
          width: 4px;
          height: 4px;
          background: #333;
          border-radius: 50%;
        }

        .loader {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* RTL Handling */
        :global(html[dir="rtl"]) .portal-login-root {
          text-align: right;
          direction: rtl;
        }

        :global(html[dir="rtl"]) .input-group input {
          text-align: right;
        }
        
        :global(html[dir="rtl"]) .otp-input {
          text-align: center;
          direction: ltr;
        }
      `}</style>
    </main>
  );
}
