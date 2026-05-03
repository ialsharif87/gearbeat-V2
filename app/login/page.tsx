"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function LoginPage() {
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

      // Check profiles table for user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", user.id)
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            <T en="Welcome back" ar="مرحباً بعودتك" />
          </h1>
          <p>
            <T en="Sign in to your GearBeat account" ar="سجّل دخولك إلى حسابك" />
          </p>
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
              placeholder="email@example.com"
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
              <T en="Signing in..." ar="جاري الدخول..." />
            ) : (
              <T en="Sign In" ar="تسجيل الدخول" />
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/forgot-password">
            <T en="Forgot password?" ar="نسيت كلمة المرور؟" />
          </Link>
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
          background: var(--gb-bg, #0a0a0a);
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background: var(--gb-surface, #111);
          border: 1px solid var(--gb-border, #222);
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
          color: var(--gb-text, #fff);
        }
        .auth-header p {
          color: var(--gb-muted, #888);
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
          color: var(--gb-muted, #888);
        }
        .gb-input {
          padding: 12px 16px;
          background: #000;
          border: 1px solid #333;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .gb-input:focus {
          outline: none;
          border-color: var(--gb-gold, #cfa86e);
        }
        .gb-button {
          padding: 14px;
          background: var(--gb-gold, #cfa86e);
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
          border: 1px solid var(--gb-danger, #ff4d4d);
          border-radius: 12px;
          color: var(--gb-danger, #ff4d4d);
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
          color: var(--gb-gold, #cfa86e);
          text-decoration: none;
        }
        .auth-switcher {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #222;
          text-align: center;
        }
        .muted-link {
          color: var(--gb-muted, #888);
          text-decoration: none;
          font-size: 0.85rem;
        }
        .muted-link:hover {
          color: var(--gb-text, #fff);
        }
      `,
        }}
      />
    </div>
  );
}
