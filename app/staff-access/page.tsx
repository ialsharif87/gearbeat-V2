"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function StaffAccessPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error("Invalid email or password");
      }

      const user = data.user;
      if (!user) throw new Error("Login failed");

      // Check admin_users table for active staff status
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        throw new Error("Access denied.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="/brand/logo-horizontal-ai.png"
            alt="GearBeat"
            style={{ height: 32, marginBottom: 24 }}
          />
          <h1>
            <T en="Staff Access" ar="دخول الفريق" />
          </h1>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="field">
            <label>
              <T en="Email" ar="البريد الإلكتروني" />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@gearbeat.com"
              required
              className="gb-input"
            />
          </div>
          <div className="field">
            <label>
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="gb-input"
            />
          </div>
          <button type="submit" disabled={loading} className="gb-button">
            {loading ? (
              <T en="Verifying..." ar="جاري التحقق..." />
            ) : (
              <T en="Sign In" ar="تسجيل الدخول" />
            )}
          </button>
        </form>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 360px;
          padding: 40px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-header h1 {
          font-size: 1.5rem;
          margin: 0;
          color: #fff;
          letter-spacing: -0.5px;
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
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .gb-input {
          padding: 12px 14px;
          background: #000;
          border: 1px solid #222;
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        .gb-input:focus {
          outline: none;
          border-color: #444;
        }
        .gb-button {
          padding: 12px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 8px;
        }
        .gb-button:disabled {
          opacity: 0.5;
        }
        .auth-error {
          padding: 10px;
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid #ff4d4d;
          border-radius: 8px;
          color: #ff4d4d;
          font-size: 0.8rem;
          margin-bottom: 24px;
          text-align: center;
        }
      `,
        }}
      />
    </div>
  );
}
