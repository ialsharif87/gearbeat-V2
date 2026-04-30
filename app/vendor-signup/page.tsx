"use client";

import React, { useState } from "react";
import T from "../../components/t";
import Link from "next/link";
import { signUpVendor } from "./actions";

export default function VendorSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين. / Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل. / Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const result = await signUpVendor(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="auth-shell">
        <div className="card auth-card">

          {/* Header */}
          <span className="badge" style={{ color: "var(--gb-gold)", borderColor: "var(--gb-gold)" }}>
            <T en="Gear Vendor Program" ar="برنامج تجار المعدات" />
          </span>

          <h1>
            <T en="Become a Vendor" ar="كن تاجراً في GearBeat" />
          </h1>

          <p>
            <T
              en="Sell your music and audio gear to thousands of professional creators across the GearBeat marketplace."
              ar="بع معداتك الموسيقية والصوتية لآلاف المبدعين المحترفين عبر منصة GearBeat."
            />
          </p>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(226, 109, 90, 0.12)",
                border: "1px solid rgba(226, 109, 90, 0.3)",
                color: "var(--gb-danger)",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form className="form" onSubmit={handleSubmit}>

            {/* Full Name */}
            <label>
              <T en="Full Name" ar="الاسم الكامل" />
            </label>
            <input
              className="input"
              name="fullName"
              type="text"
              placeholder="محمد العمري / Mohammed Al-Omari"
              required
              minLength={2}
            />

            {/* Business Name */}
            <label>
              <T en="Business / Store Name" ar="اسم المتجر أو المؤسسة" />
            </label>
            <input
              className="input"
              name="businessName"
              type="text"
              placeholder="متجر الألحان / Al-Alhan Music Store"
              required
              minLength={2}
            />

            {/* Email */}
            <label>
              <T en="Email Address" ar="البريد الإلكتروني" />
            </label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="vendor@example.com"
              required
            />

            {/* Phone */}
            <label>
              <T en="Phone Number" ar="رقم الجوال" />
            </label>
            <input
              className="input"
              name="phone"
              type="tel"
              placeholder="+966 5X XXX XXXX"
              required
              minLength={8}
            />

            {/* Password */}
            <label>
              <T en="Password" ar="كلمة المرور" />
            </label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="8 أحرف على الأقل / Minimum 8 characters"
              required
              minLength={8}
            />

            {/* Confirm Password */}
            <label>
              <T en="Confirm Password" ar="تأكيد كلمة المرور" />
            </label>
            <input
              className="input"
              name="confirm_password"
              type="password"
              placeholder="أعد كتابة كلمة المرور / Re-enter password"
              required
              minLength={8}
            />

            {/* Info Note */}
            <p className="admin-muted-line">
              <T
                en="Your vendor account will be reviewed before approval. You will be notified by email once approved."
                ar="سيتم مراجعة طلبك من قبل فريق GearBeat قبل التفعيل. ستتلقى إشعاراً بالبريد الإلكتروني عند الموافقة."
              />
            </p>

            {/* Submit Button */}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? (
                <T en="Creating account..." ar="جاري إنشاء الحساب..." />
              ) : (
                <T en="Create Vendor Account" ar="إنشاء حساب التاجر" />
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="actions" style={{ marginTop: 18 }}>
            <Link href="/login?account=vendor" className="btn btn-secondary">
              <T en="Already have an account? Login" ar="لديك حساب؟ سجّل دخولك" />
            </Link>

            <Link href="/" className="btn btn-secondary">
              <T en="Back to Home" ar="العودة للرئيسية" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
