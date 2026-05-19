"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import CountryPhoneFields from "@/components/country-phone-fields";
import { isValidE164 } from "@/lib/phone";
import { CountryOption } from "@/lib/countries";
import { dashboardPathForRole } from "@/lib/role-routing";

export default function ProfileRepairClient({ countries }: { countries: CountryOption[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [countryCode, setCountryCode] = useState("SA");
  const [phoneE164, setPhoneE164] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSessionAndProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login");
          return;
        }

        setUser(user);

        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          // Profile exists, redirect to appropriate page
          router.replace(dashboardPathForRole(profile.role));
          return;
        }

        // Prepopulate from auth metadata if available
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
        if (user.user_metadata?.role) {
          const rawRole = user.user_metadata.role;
          setRole(rawRole === "studio_owner" ? "owner" : rawRole === "owner" ? "owner" : "customer");
        }
      } catch (err) {
        console.error("Error checking session/profile:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    checkSessionAndProfile();
  }, [supabase, router]);

  async function handleRepair(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!fullName || fullName.length < 2) {
        throw new Error("Full name is required.");
      }
      if (!phoneE164 || !isValidE164(phoneE164)) {
        throw new Error("Valid phone number is required.");
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          role: role,
          phone_e164: phoneE164,
        }
      });

      if (authError) throw authError;

      // Insert profile
      const selectedCountry = countries.find(c => c.country_code === countryCode)!;
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          auth_user_id: user.id,
          email: user.email,
          full_name: fullName,
          phone: phoneE164,
          country_code: countryCode,
          phone_e164: phoneE164,
          role: role,
          account_status: role === "owner" ? "pending" : "active",
          preferred_currency: selectedCountry.currency_code,
          preferred_language: "ar",
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error in repair:", profileError);
        throw new Error("Failed to create profile. Please try again.");
      }

      // Redirect
      if (role === "owner") {
        router.replace("/portal/first-login");
      } else {
        router.replace("/customer");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingUser) {
    return (
      <div className="repair-loading-container">
        <span className="loader"></span>
        <style jsx>{`
          .repair-loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #080706;
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(212, 175, 55, 0.1);
            border-top-color: #D4AF37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <span className="badge badge-gold" style={{ marginBottom: 12 }}>
              <T en="Profile Setup Recovery" ar="استعادة إعداد الملف الشخصي" />
            </span>
            <h1>
              <T en="Complete Your Profile" ar="أكمل ملفك الشخصي" />
            </h1>
            <p>
              <T 
                en="We noticed your profile setup was incomplete. Please complete the fields below to activate your account." 
                ar="لقد لاحظنا أن إعداد ملفك الشخصي غير مكتمل. يرجى ملء الحقول أدناه لتفعيل حسابك." 
              />
            </p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleRepair} className="form">
            <div className="field">
              <label><T en="Full Name" ar="الاسم الكامل" /></label>
              <input
                className="gb-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abdullah Ahmed"
                required
                minLength={2}
              />
            </div>

            <div className="field">
              <label><T en="Email" ar="البريد الإلكتروني" /></label>
              <input
                className="gb-input"
                type="email"
                value={user?.email || ""}
                disabled
                readOnly
              />
            </div>

            <CountryPhoneFields
              countries={countries}
              defaultCountryCode="SA"
              countryName="country_code"
              phoneLocalName="phone_local"
              phoneE164Name="phone_e164"
              onCountryChange={(val) => setCountryCode(val)}
              onPhoneE164Change={(val) => setPhoneE164(val)}
            />

            <div className="field">
              <label><T en="Account Type" ar="نوع الحساب" /></label>
              <select
                className="gb-input"
                value={role}
                onChange={(e) => setRole(e.target.value as "customer" | "owner")}
              >
                <option value="customer">Customer / عميل (للحجز)</option>
                <option value="owner">Studio Owner / صاحب استوديو (للشركاء)</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="gb-button">
              {submitting ? <T en="Activating Account..." ar="جاري تفعيل الحساب..." /> : (
                <T en="Complete Setup & Enter Dashboard" ar="إكمال الإعداد ودخول لوحة التحكم" />
              )}
            </button>
          </form>
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
          background: #080706;
          padding: 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 12px;
          color: #fff;
        }
        .auth-header p {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
        }
        .gb-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .gb-input:focus {
          border-color: #D4AF37;
          outline: none;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }
        .gb-button {
          background: #D4AF37;
          color: #000;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gb-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .gb-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 20px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.75rem;
        }
        .badge-gold {
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        /* RTL support */
        :global(html[dir="rtl"]) .auth-page {
          text-align: right;
          direction: rtl;
        }
      `
        }}
      />
    </section>
  );
}
