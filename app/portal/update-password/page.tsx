"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in (session from recovery link)
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Invalid or expired reset session. Please request a new link.");
      }
    }
    checkSession();
  }, [supabase]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/portal/login");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gb-auth-page">
      <div className="gb-auth-card">
        <div className="gb-auth-header">
          <span className="gb-badge">
            <T en="Secure Update" ar="تحديث آمن" />
          </span>
          <h1>
            <T en="New Password" ar="كلمة مرور جديدة" />
          </h1>
          <p>
            <T 
              en="Set a strong password to protect your GearBeat account." 
              ar="عيّن كلمة مرور قوية لحماية حسابك في GearBeat." 
            />
          </p>
        </div>

        {errorMessage && <div className="gb-error-msg">{errorMessage}</div>}
        {message && <div className="gb-success-msg">{message}</div>}

        <form onSubmit={handleUpdatePassword} className="gb-auth-form">
          <div className="gb-field">
            <label><T en="New Password" ar="كلمة المرور الجديدة" /></label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="gb-field">
            <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" disabled={loading || !!message} className="gb-submit-btn">
            {loading ? <T en="Updating..." ar="جاري التحديث..." /> : <T en="Update Password" ar="تحديث كلمة المرور" />}
          </button>
        </form>
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
          border-color: #cfa86e;
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
      ` }} />
    </main>
  );
}
