"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminLoginPage() {
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
        throw new Error("Access denied. Admin authorization required.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth-page animate-fade-in">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <img
            src="/brand/logo-horizontal-ai.png"
            alt="GearBeat"
            style={{ height: 32, marginBottom: 24, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.2))' }}
          />
          <h1>
            <T en="Operator Command Center" ar="مركز تحكم العمليات" />
          </h1>
          <p className="admin-auth-subtitle">
            <T en="Secure portal for platform administrators" ar="بوابة آمنة لمديري المنصة" />
          </p>
        </div>

        {error && <div className="admin-auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-auth-form">
          <div className="admin-field">
            <label>
              <T en="Administrative Email" ar="البريد الإلكتروني للإدارة" />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@gearbeat.app"
              required
              className="admin-gb-input"
            />
          </div>
          <div className="admin-field">
            <label>
              <T en="Security Password" ar="كلمة المرور الأمنية" />
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              variant="portal"
              autoComplete="current-password"
            />

            <Link 
              href="/forgot-password" 
              style={{ 
                fontSize: '0.8rem', 
                color: '#D4AF37', 
                textDecoration: 'none',
                marginTop: '4px',
                display: 'inline-block',
                transition: 'opacity 0.2s'
              }}
              className="hover-opacity"
            >
              <T en="Forgot password?" ar="نسيت كلمة المرور؟" />
            </Link>
          </div>
          <button type="submit" disabled={loading} className="admin-gb-button">
            {loading ? (
              <T en="Authenticating..." ar="جاري التحقق..." />
            ) : (
              <T en="Access Console" ar="دخول لوحة التحكم" />
            )}
          </button>
        </form>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .admin-auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #0e0e0e 0%, #020202 100%);
          padding: 20px;
          font-family: var(--font-arabic), var(--font-latin), system-ui;
        }
        .admin-auth-card {
          width: 100%;
          max-width: 400px;
          padding: 48px;
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.03);
          transition: border-color 0.3s;
        }
        .admin-auth-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
        }
        .admin-auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .admin-auth-header h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .admin-auth-subtitle {
          font-size: 0.85rem;
          color: var(--gb-text-muted, #888);
          margin-top: 8px;
          margin-bottom: 0;
        }
        .admin-auth-form {
          display: grid;
          gap: 24px;
        }
        .admin-field {
          display: grid;
          gap: 8px;
        }
        .admin-field label {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .admin-gb-input {
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-gb-input:focus {
          outline: none;
          border-color: #D4AF37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.1);
        }
        .admin-gb-button {
          padding: 14px;
          background: linear-gradient(135deg, #d4af37 0%, #aa8417 100%);
          color: #000;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
          margin-top: 8px;
          letter-spacing: 0.5px;
        }
        .admin-gb-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(212, 175, 55, 0.25);
        }
        .admin-gb-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .admin-auth-error {
          padding: 12px;
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.2);
          border-radius: 10px;
          color: #ff4d4d;
          font-size: 0.8rem;
          margin-bottom: 24px;
          text-align: center;
          line-height: 1.4;
        }
        .hover-opacity:hover {
          opacity: 0.8;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
    </div>
  );
}
