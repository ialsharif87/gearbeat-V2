"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="gb-auth-root">
      <div className="gb-auth-container">
        <div className="gb-auth-card">
          <div className="gb-auth-header">
            <span className="gb-badge"><T en="Welcome Back" ar="مرحباً بعودتك" /></span>
            <h1><T en="Sign In" ar="تسجيل الدخول" /></h1>
            <p><T en="Enter your credentials to access your GearBeat account." ar="أدخل بياناتك للوصول إلى حسابك في جير بيت." /></p>
          </div>

          {error && <div className="gb-auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="gb-auth-form">
            <div className="gb-field">
              <label><T en="Email Address" ar="البريد الإلكتروني" /></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="gb-input"
              />
            </div>
            <div className="gb-field">
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
            <button type="submit" disabled={loading} className="gb-button-gold">
              {loading ? <T en="Signing in..." ar="جاري الدخول..." /> : <T en="Sign In" ar="تسجيل الدخول" />}
            </button>
          </form>

          <div className="gb-auth-footer">
            <Link href="/forgot-password"><T en="Forgot password?" ar="نسيت كلمة المرور؟" /></Link>
            <div className="gb-divider" />
            <Link href="/signup"><T en="New to GearBeat? Create account" ar="جديد؟ أنشئ حساباً" /></Link>
          </div>

          <div className="gb-portal-link">
            <Link href="/portal/login"><T en="Are you a studio or seller? Portal login" ar="هل أنت استوديو أو تاجر؟ دخول البوابة" /></Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gb-auth-root {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(212, 175, 55, 0.05), transparent 70%);
        }
        .gb-auth-card {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          background: var(--gb-surface);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }
        .gb-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .gb-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(212, 175, 55, 0.1);
          color: var(--gb-gold);
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .gb-auth-header h1 {
          font-size: 2.25rem;
          margin: 0 0 12px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .gb-auth-header p {
          color: var(--gb-text-steel);
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
          font-weight: 700;
          color: var(--gb-text-ivory);
          opacity: 0.8;
        }
        .gb-input {
          padding: 14px 18px;
          background: #000;
          border: 1px solid #222;
          border-radius: 14px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .gb-input:focus {
          outline: none;
          border-color: var(--gb-gold);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        }
        .gb-button-gold {
          padding: 16px;
          background: var(--gb-gold);
          color: #000;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }
        .gb-button-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
        }
        .gb-auth-error {
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 14px;
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .gb-auth-footer {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          font-size: 0.9rem;
        }
        .gb-auth-footer a {
          color: var(--gb-gold);
          text-decoration: none;
          font-weight: 600;
        }
        .gb-divider {
          width: 40px;
          height: 1px;
          background: #222;
        }
        .gb-portal-link {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #222;
          text-align: center;
        }
        .gb-portal-link a {
          color: var(--gb-text-steel);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s;
        }
        .gb-portal-link a:hover {
          color: var(--gb-gold);
        }
      `}</style>
    </div>
  );
}
