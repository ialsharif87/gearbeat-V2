"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { PasswordInput } from "@/components/ui/password-input";

function UpdatePasswordContent() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function handleSession() {
      try {
        // 1. Check if we have an active session already (Supabase might have auto-exchanged hash or code)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsSessionReady(true);
          setCheckingSession(false);
          return;
        }

        // 2. Check for PKCE 'code' in searchParams (Modern Supabase default)
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            setIsSessionReady(true);
            setCheckingSession(false);
            return;
          }
          // If code exchange fails, we can still try hash parsing just in case
        }

        // 3. Fallback: Check if there's a recovery token in the hash (Legacy/Implicit flow)
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (hash && hash.includes("access_token")) {
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
              setErrorMessage("Invalid or expired reset link. Please request a new one.");
            } else {
              setIsSessionReady(true);
            }
          }
        } else if (!code) {
          // No session, no code, and no hash tokens
          setErrorMessage("Recovery link invalid or expired. Please use the link sent to your email.");
        }
      } catch (err) {
        console.error("Session check error:", err);
        setErrorMessage("An error occurred while verifying your session.");
      } finally {
        setCheckingSession(false);
      }
    }

    handleSession();
  }, [supabase, searchParams]);

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

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage("Success");
      // Give user time to see success message before redirect
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="gb-loading-container">
        <div className="gb-spinner"></div>
        <p><T en="Verifying session..." ar="جاري التحقق من الجلسة..." /></p>
      </div>
    );
  }

  return (
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
          <div className="gb-error-content">
            {errorMessage === "Password must be at least 8 characters." ? (
              <T en="Password must be at least 8 characters." ar="يجب أن تكون كلمة المرور 8 أحرف على الأقل." />
            ) : errorMessage === "Passwords do not match." ? (
              <T en="Passwords do not match." ar="كلمتا المرور غير متطابقتين." />
            ) : errorMessage.includes("Recovery link invalid") ? (
              <T en="Recovery link invalid or expired. Please use the link sent to your email." ar="رابط الاستعادة غير صالح أو منتهي الصلاحية. يرجى استخدام الرابط المرسل لبريدك." />
            ) : (
              errorMessage
            )}
          </div>
          {!isSessionReady && (
            <div className="gb-error-actions">
              <Link href="/forgot-password" className="gb-gold-link">
                <T en="Request new link" ar="طلب رابط جديد" />
              </Link>
            </div>
          )}
        </div>
      )}

      {message === "Success" ? (
        <div className="gb-success-msg">
          <div className="gb-success-icon">✓</div>
          <p>
            <T
              en="Password updated successfully! Redirecting to login..."
              ar="تم تحديث كلمة المرور بنجاح! جاري التوجيه لصفحة الدخول..."
            />
          </p>
        </div>
      ) : (
        isSessionReady && (
          <form onSubmit={handleUpdatePassword} className="gb-auth-form">
            <div className="gb-field">
              <label><T en="New Password" ar="كلمة المرور الجديدة" /></label>
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                variant="portal"
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="gb-field">
              <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
              <PasswordInput
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                required
                variant="portal"
                minLength={8}
                autoComplete="new-password"
              />
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
          <T en="← Back to Login" ar="← العودة لتسجيل الدخول" />
        </Link>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <main className="gb-auth-page">
      <Suspense fallback={
        <div className="gb-loading-container">
          <div className="gb-spinner"></div>
        </div>
      }>
        <UpdatePasswordContent />
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
        .gb-auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #0a0a0a 0%, #050505 100%);
          padding: 24px;
          color: white;
          font-family: inherit;
        }

        .gb-auth-card {
          width: 100%;
          max-width: 440px;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          animation: gbFadeUp 0.6s ease-out;
        }

        @keyframes gbFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gb-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .gb-badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }

        .gb-auth-header h1 {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0 0 12px;
          background: linear-gradient(to right, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
          padding-left: 4px;
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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 8px;
        }

        .gb-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
          filter: brightness(1.1);
        }

        .gb-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .gb-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gb-error-msg {
          background: rgba(255, 77, 77, 0.05);
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.2);
          padding: 20px;
          border-radius: 16px;
          font-size: 0.9rem;
          margin-bottom: 24px;
          text-align: center;
        }

        .gb-error-actions {
          margin-top: 12px;
        }

        .gb-gold-link {
          color: #D4AF37;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          transition: all 0.2s;
        }

        .gb-gold-link:hover {
          border-bottom-color: #D4AF37;
        }

        .gb-success-msg {
          background: rgba(34, 197, 94, 0.05);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
          padding: 32px 24px;
          border-radius: 20px;
          text-align: center;
          animation: gbPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes gbPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .gb-success-icon {
          width: 48px;
          height: 48px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px;
        }

        .gb-auth-footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #1a1a1a;
        }

        .gb-auth-footer a {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .gb-auth-footer a:hover {
          color: #D4AF37;
        }

        .gb-loading-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .gb-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.1);
          border-top: 3px solid #D4AF37;
          border-radius: 50%;
          animation: gbSpin 1s linear infinite;
        }

        @keyframes gbSpin {
          to { transform: rotate(360deg); }
        }
      ` }} />
    </main>
  );
}

