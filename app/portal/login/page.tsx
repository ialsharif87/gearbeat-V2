import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const hasError = params.error === "invalid_login";

  async function login(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      redirect("/portal/login?error=missing_fields");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Use generic error to not reveal account existence
      redirect("/portal/login?error=invalid_login");
    }

    // Success: redirect to /portal hub
    redirect("/portal");
  }

  return (
    <div className="portal-login-page">
      <div className="portal-login-card">
        <div className="portal-login-header">
          <Link href="/">
            <img
              src="/brand/logo-horizontal-ai.png"
              alt="GearBeat"
              className="portal-login-logo"
            />
          </Link>
          <h1>
            <T en="Partner Portal" ar="بوابة الشركاء" />
          </h1>
          <p className="gb-muted-text">
            <T
              en="Secure access for studio owners and gear vendors."
              ar="دخول آمن لأصحاب الاستوديوهات وتجار المعدات."
            />
          </p>
        </div>

        {hasError && (
          <div className="portal-login-error">
            <T
              en="Invalid email or password. Please try again."
              ar="البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى."
            />
          </div>
        )}

        <form action={login} className="portal-login-form">
          <div className="portal-field">
            <label htmlFor="email">
              <T en="Work Email" ar="البريد الإلكتروني للعمل" />
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@business.com"
              required
              className="gb-input"
            />
          </div>

          <div className="portal-field">
            <label htmlFor="password">
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className="gb-input"
            />
          </div>

          <button type="submit" className="gb-button">
            <T en="Sign In to Portal" ar="تسجيل الدخول إلى البوابة" />
          </button>
        </form>

        <div className="portal-login-footer">
          <Link href="/" className="gb-muted-text">
            <T en="← Back to GearBeat" ar="← العودة إلى جير بيت" />
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gb-bg);
          padding: 20px;
        }
        .portal-login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: var(--gb-surface);
          border: 1px solid var(--gb-border);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .portal-login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .portal-login-logo {
          height: 48px;
          margin-bottom: 24px;
        }
        .portal-login-header h1 {
          font-size: 1.8rem;
          margin: 0 0 8px;
          color: var(--gb-text);
        }
        .portal-login-form {
          display: grid;
          gap: 20px;
        }
        .portal-field {
          display: grid;
          gap: 8px;
        }
        .portal-field label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--gb-muted);
        }
        .portal-login-error {
          padding: 12px;
          background: rgba(255, 121, 121, 0.1);
          border: 1px solid var(--gb-danger);
          border-radius: 12px;
          color: var(--gb-danger);
          font-size: 0.85rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .portal-login-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 0.9rem;
        }
        .portal-login-footer a {
          text-decoration: none;
        }
        .portal-login-footer a:hover {
          color: var(--gb-text);
        }
      `}} />
    </div>
  );
}
