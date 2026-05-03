"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function StudioSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/portal/login";
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profile);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = () => {
    alert("Settings saved successfully! (Demo Mode)");
  };

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <T en="Loading settings..." ar="جاري تحميل الإعدادات..." />
      </div>
    );
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "40px auto" }}>
      <div className="section-head">
        <span className="badge">
          <T en="Portal" ar="البوابة" />
        </span>
        <h1>
          <T en="Settings" ar="الإعدادات" />
        </h1>
        <p>
          <T 
            en="Manage your account preferences and notification settings." 
            ar="إدارة تفضيلات حسابك وإعدادات التنبيهات." 
          />
        </p>
      </div>

      <div className="settings-container" style={{ display: "grid", gap: 32 }}>
        {/* Section 1 — Account */}
        <section className="card">
          <h2 style={{ marginBottom: 20 }}>
            <T en="Account Information" ar="معلومات الحساب" />
          </h2>
          
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", color: "var(--muted)" }}>
                <T en="Full Name" ar="الاسم الكامل" />
              </label>
              <input 
                className="input" 
                value={profile?.full_name || ""} 
                readOnly 
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", color: "var(--muted)" }}>
                <T en="Email Address" ar="البريد الإلكتروني" />
              </label>
              <input 
                className="input" 
                value={profile?.email || user?.email || ""} 
                readOnly 
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--gb-gold)", marginTop: 8 }}>
              <T 
                en="To update your account details contact support." 
                ar="للتعديل على بيانات حسابك تواصل مع الدعم." 
              />
            </p>
          </div>
        </section>

        {/* Section 2 — Notifications */}
        <section className="card">
          <h2 style={{ marginBottom: 20 }}>
            <T en="Notifications" ar="التنبيهات" />
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
              <span>
                <T en="Email me when I get a new booking" ar="أرسل لي إيميل عند كل حجز جديد" />
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
              <span>
                <T en="Email me when a booking is cancelled" ar="أرسل لي إيميل عند إلغاء حجز" />
              </span>
            </label>

            <div style={{ marginTop: 10 }}>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={handleSave}
              >
                <T en="Save Changes" ar="حفظ التغييرات" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Danger Zone */}
        <section className="card" style={{ borderColor: "rgba(255, 0, 0, 0.1)", background: "rgba(255, 0, 0, 0.02)" }}>
          <h2 style={{ marginBottom: 20, color: "#ff4444" }}>
            <T en="Danger Zone" ar="منطقة الخطر" />
          </h2>
          
          <p style={{ marginBottom: 20 }}>
            <T 
              en="Need to close your account? Contact support." 
              ar="تريد إغلاق حسابك؟ تواصل مع الدعم." 
            />
          </p>

          <Link href="/contact" className="btn btn-secondary" style={{ color: "#ff4444", borderColor: "rgba(255, 0, 0, 0.2)" }}>
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </section>
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <Link href="/portal/studio" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
        </Link>
      </div>
    </main>
  );
}
