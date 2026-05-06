"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      if (method === "email") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://gearbeat.app/portal/update-password'
        });
        if (error) throw error;
        setMessage("A reset link has been sent to your email.");
      } else {
        // Phone reset via OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });
        if (error) throw error;
        setStep("verify");
        setMessage("A verification code has been sent to your mobile.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      if (error) throw error;
      
      // Once verified, they are logged in. Redirect to update password.
      window.location.href = "/portal/update-password";
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gb-auth-page">
      <div className="gb-auth-card">
        <div className="gb-auth-header">
          <span className="gb-badge">
            <T en="Security" ar="الأمان" />
          </span>
          <h1>
            <T en="Forgot Password" ar="نسيت كلمة المرور" />
          </h1>
          <p>
            <T 
              en="No worries, we'll help you get back into your account." 
              ar="لا تقلق، سنساعدك على استعادة الوصول لحسابك." 
            />
          </p>
        </div>

        <div className="gb-method-toggle">
          <button 
            className={method === "email" ? "active" : ""} 
            onClick={() => { setMethod("email"); setStep("request"); setMessage(""); setErrorMessage(""); }}
          >
            <T en="Email" ar="البريد الإلكتروني" />
          </button>
          <button 
            className={method === "phone" ? "active" : ""} 
            onClick={() => { setMethod("phone"); setStep("request"); setMessage(""); setErrorMessage(""); }}
          >
            <T en="Mobile" ar="الجوال" />
          </button>
        </div>

        {errorMessage && <div className="gb-error-msg">{errorMessage}</div>}
        {message && <div className="gb-success-msg">{message}</div>}

        {step === "request" ? (
          <form onSubmit={handleResetRequest} className="gb-auth-form">
            {method === "email" ? (
              <div className="gb-field">
                <label><T en="Email Address" ar="البريد الإلكتروني" /></label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                  required 
                />
              </div>
            ) : (
              <div className="gb-field">
                <label><T en="Mobile Number" ar="رقم الجوال" /></label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+966XXXXXXXXX"
                  required 
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="gb-submit-btn">
              {loading ? <T en="Processing..." ar="جاري المعالجة..." /> : <T en="Send Recovery Code" ar="إرسال كود الاستعادة" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="gb-auth-form">
            <div className="gb-field">
              <label><T en="Verification Code" ar="كود التحقق" /></label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="000000"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="gb-submit-btn">
              {loading ? <T en="Verifying..." ar="جاري التحقق..." /> : <T en="Verify & Continue" ar="تحقق ومتابعة" />}
            </button>
            <button type="button" className="gb-link-btn" onClick={() => setStep("request")}>
              <T en="Resend code" ar="إعادة إرسال الكود" />
            </button>
          </form>
        )}

        <div className="gb-auth-footer">
          <Link href="/login">
            ← <T en="Back to login" ar="العودة لتسجيل الدخول" />
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
        }

        .gb-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .gb-badge {
          display: inline-block;
          background: rgba(207, 168, 110, 0.1);
          color: #cfa86e;
          border: 1px solid #cfa86e;
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

        .gb-method-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #111;
          padding: 6px;
          border-radius: 14px;
          margin-bottom: 32px;
          border: 1px solid #222;
        }

        .gb-method-toggle button {
          background: transparent;
          border: none;
          color: #666;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gb-method-toggle button.active {
          background: #cfa86e;
          color: black;
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
          border-color: #cfa86e;
          box-shadow: 0 0 0 4px rgba(207, 168, 110, 0.1);
        }

        .gb-submit-btn {
          background: linear-gradient(135deg, #cfa86e, #b8923a);
          color: black;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .gb-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(207, 168, 110, 0.2);
        }

        .gb-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gb-link-btn {
          background: none;
          border: none;
          color: #cfa86e;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0;
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
          transition: color 0.2s;
        }

        .gb-auth-footer a:hover {
          color: #cfa86e;
        }
      ` }} />
    </main>
  );
}
