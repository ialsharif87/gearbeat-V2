"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    async function handleHash() {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (type === "recovery" && accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            setErrorMessage("Invalid or expired reset link.");
          } else {
            setIsSessionReady(true);
          }
        }
      } else {
        // Check if user is already logged in (manual access or session persisted)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsSessionReady(true);
        } else {
          setErrorMessage("Recovery token missing. Please use the link from your email.");
        }
      }
    }
    handleHash();
  }, [supabase]);

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Success");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <main className="gb-auth-page">
      <div className="gb-auth-card">
        <div className="gb-auth-header">
          <span className="gb-badge">
            <T en="Security" ar="الأمان" />
          </span>
          <h1>
            <T en="New Password" ar="كلمة مرور جديدة" />
          </h1>
          <p>
            <T
              en="Set a strong password to protect your account."
              ar="عيّن كلمة مرور قوية لحماية حسابك."
            />
          </p>
        </div>

        {errorMessage && (
          <div className="gb-error-msg">
            {errorMessage === "Password must be at least 8 characters." ? (
              <T en="Password must be at least 8 characters." ar="يجب أن تكون كلمة المرور 8 أحرف على الأقل." />
            ) : errorMessage === "Passwords do not match." ? (
              <T en="Passwords do not match." ar="كلمتا المرور غير متطابقتين." />
            ) : errorMessage === "Recovery token missing. Please use the link from your email." ? (
              <T en="Recovery token missing. Please use the link from your email." ar="رابط الاستعادة مفقود. يرجى استخدام الرابط المرسل لبريدك." />
            ) : (
              errorMessage
            )}
            {!isSessionReady && (
              <div style={{ marginTop: '16px' }}>
                <Link href="/forgot-password" style={{ color: '#D4AF37', textDecoration: 'underline' }}>
                  <T en="Go to Forgot Password" ar="انتقل لصفحة استعادة كلمة المرور" />
                </Link>
              </div>
            )}
          </div>
        )}

        {message === "Success" ? (
          <div className="gb-success-msg">
            <T
              en="Password updated successfully. Redirecting to login..."
              ar="تم تغيير كلمة المرور بنجاح. جاري التوجيه لصفحة الدخول..."
            />
          </div>
        ) : (
          isSessionReady && (
            <form onSubmit={handleUpdatePassword} className="gb-auth-form">
              <div className="gb-field">
                <label><T en="New Password" ar="كلمة المرور الجديدة" /></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="gb-field">
                <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button className="gb-submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <T en="Updating..." ar="جاري التحديث..." />
                ) : (
                  <T en="Update Password" ar="تحديث كلمة المرور" />
                )}
              </button>
            </form>
          )
        )}

        <div className="gb-auth-footer">
          <Link href="/login">
            <T en="Back to Login" ar="العودة إلى تسجيل الدخول" />
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gb-auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050505;
          padding: 24px;
          color: white;
        }
        .gb-auth-card {
          width: 100%;
          max-width: 440px;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
        }
        .gb-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .gb-badge {
          display: inline-block;
          background: rgba(207, 168, 110, 0.1);
          color: #D4AF37;
          border: 1px solid #D4AF37;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .gb-auth-header h1 {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0 0 12px;
        }
        .gb-auth-header p {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .gb-auth-form {
          display: grid;
          gap: 24px;
        }
        .gb-field {
          display: grid;
          gap: 8px;
        }
        .gb-field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
        }
        .gb-field input {
          background: #000;
          border: 1px solid #222;
          padding: 14px 16px;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .gb-field input:focus {
          outline: none;
          border-color: #D4AF37;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          padding-right: 48px;
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #D4AF37;
        }

        .password-toggle svg {
          width: 20px;
          height: 20px;
        }

        :global(html[dir="rtl"]) .password-input-wrapper input {
          padding-right: 16px;
          padding-left: 48px;
        }

        :global(html[dir="rtl"]) .password-toggle {
          right: auto;
          left: 12px;
        }
        .gb-submit-btn {
          background: linear-gradient(135deg, #D4AF37, #B8923A);
          color: black;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
        }
        .gb-error-msg {
          background: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
          border: 1px solid #ff4d4d;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .gb-success-msg {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid #22c55e;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .gb-auth-footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #1a1a1a;
        }
        .gb-auth-footer a {
          color: #888;
          text-decoration: none;
          font-size: 0.9rem;
        }
      ` }} />
    </main>
  );
}
