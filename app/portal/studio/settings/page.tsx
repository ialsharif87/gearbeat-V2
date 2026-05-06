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
    <main className="gb-dashboard-page container" style={{ maxWidth: 800, margin: "40px auto" }}>
      <section className="gb-dashboard-header" style={{ textAlign: "center", marginBottom: '40px' }}>
        <div>
          <span className="gb-dash-badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
            <T en="Portal" ar="البوابة" />
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: '8px 0 0' }}>
            <T en="Settings" ar="الإعدادات" />
          </h1>
          <p className="gb-muted-text">
            <T 
              en="Manage your account preferences and notification settings." 
              ar="إدارة تفضيلات حسابك وإعدادات التنبيهات." 
            />
          </p>
        </div>
      </section>

      <div className="settings-container" style={{ display: "grid", gap: 32 }}>
        {/* Section 1 — Account */}
        <section className="gb-card" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: 24, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            <T en="Account Information" ar="معلومات الحساب" />
          </h2>
          
          <div style={{ display: "grid", gap: 20 }}>
            <div className="gb-input-group">
              <label className="gb-detail-label">
                <T en="Full Name" ar="الاسم الكامل" />
              </label>
              <input 
                className="gb-input" 
                value={profile?.full_name || ""} 
                readOnly 
                style={{ opacity: 0.6, cursor: "not-allowed", borderStyle: 'dashed' }}
              />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label">
                <T en="Email Address" ar="البريد الإلكتروني" />
              </label>
              <input 
                className="gb-input" 
                value={profile?.email || user?.email || ""} 
                readOnly 
                style={{ opacity: 0.6, cursor: "not-allowed", borderStyle: 'dashed' }}
              />
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--gb-gold)", marginTop: 8, fontWeight: 700 }}>
              <T 
                en="To update your account details contact support." 
                ar="للتعديل على بيانات حسابك تواصل مع الدعم." 
              />
            </p>
          </div>
        </section>

        {/* Section 2 — Notifications */}
        <section className="gb-card" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: 24, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            <T en="Notifications" ar="التنبيهات" />
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: 'white' }}>
              <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--gb-gold)' }} />
              <span style={{ fontWeight: 600 }}>
                <T en="Email me when I get a new booking" ar="أرسل لي إيميل عند كل حجز جديد" />
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: 'white' }}>
              <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--gb-gold)' }} />
              <span style={{ fontWeight: 600 }}>
                <T en="Email me when a booking is cancelled" ar="أرسل لي إيميل عند إلغاء حجز" />
              </span>
            </label>

            <div style={{ marginTop: 12 }}>
              <button 
                type="button"
                className="gb-button gb-button-primary" 
                onClick={handleSave}
                style={{ minWidth: '160px', justifyContent: 'center' }}
              >
                <T en="Save Changes" ar="حفظ التغييرات" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Danger Zone */}
        <section className="gb-card" style={{ borderColor: "rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.05)", padding: '32px' }}>
          <h2 style={{ marginBottom: 20, color: "#ef4444", fontSize: '1.25rem', fontWeight: 800 }}>
            <T en="Danger Zone" ar="منطقة الخطر" />
          </h2>
          
          <p className="gb-muted-text" style={{ marginBottom: 24 }}>
            <T 
              en="Need to close your account? Contact support." 
              ar="تريد إغلاق حسابك؟ تواصل مع الدعم." 
            />
          </p>

          <Link href="/contact" className="gb-button gb-button-outline" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", justifyContent: 'center' }}>
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </section>
      </div>

      <div style={{ marginTop: 48, textAlign: "center" }}>
        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
        </Link>
      </div>
    </main>
  );
}
