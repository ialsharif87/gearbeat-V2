"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function PortalLoginPage() {
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

      // Fetch user role and status from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, account_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      const role = profile?.role;
      const status = profile?.account_status;

      if (status === "pending" || status === "under_review") {
        router.push("/portal/pending");
        return;
      }

      if (role === "owner" || role === "studio_owner") {
        router.push("/portal/studio");
      } else if (role === "vendor") {
        router.push("/portal/store");
      } else {
        // Access denied for non-providers
        await supabase.auth.signOut();
        throw new Error(
          "Access denied. This portal is for verified providers only."
        );
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gb-portal-auth-page">
      <section className="gb-portal-auth-card">
        <div className="gb-portal-auth-brand">
          <p className="gb-eyebrow">GearBeat Portal</p>
          <h1>
            <T en="Sign In" ar="تسجيل الدخول" />
          </h1>
          <p className="gb-muted-text">
            <T 
              en="Enter the studio or store portal to manage your account and orders." 
              ar="ادخل إلى بوابة الاستوديو أو المتجر لإدارة حسابك وطلباتك." 
            />
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              padding: '12px', 
              background: 'rgba(255, 77, 77, 0.1)', 
              border: '1px solid #ff4d4d', 
              borderRadius: '12px', 
              color: '#ff4d4d', 
              fontSize: '0.85rem', 
              marginBottom: '24px', 
              textAlign: 'center' 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label>
            <T en="Email" ar="البريد الإلكتروني" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@business.com"
              required
            />
          </label>
          <label>
            <T en="Password" ar="كلمة المرور" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          
          <button type="submit" disabled={loading} className="gb-button">
            {loading ? (
              <T en="Signing in..." ar="جاري الدخول..." />
            ) : (
              <T en="Sign In" ar="تسجيل الدخول" />
            )}
          </button>
        </form>

        <div className="gb-portal-auth-actions">
          <a href="/login">
            <T en="Customer login" ar="الدخول من صفحة العملاء" />
          </a>
          <a href="/signup">
            <T en="Create new account" ar="إنشاء حساب جديد" />
          </a>
        </div>
      </section>
    </main>
  );
}
