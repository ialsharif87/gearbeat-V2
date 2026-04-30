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
    const result = await signUpVendor(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Redirect is handled by the server action
  };

  return (
    <div className="section-padding" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: '3rem', marginBottom: 15 }}>📦</div>
          <h1><T en="Gear Vendor Signup" ar="تسجيل تاجر معدات" /></h1>
          <p><T en="Join the professional GearBeat marketplace." ar="انضم لسوق GearBeat الاحترافي." /></p>
        </div>

        {error && (
          <div style={{ 
            color: 'var(--gb-danger)', 
            marginBottom: 20, 
            padding: 12, 
            background: 'rgba(226, 109, 90, 0.1)', 
            borderRadius: 8,
            border: '1px solid rgba(226, 109, 90, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form className="grid gap-20" onSubmit={handleSubmit}>
          <div>
            <label><T en="Full Name" ar="الاسم الكامل" /></label>
            <input name="fullName" className="input" required placeholder="John Doe" />
          </div>
          <div>
            <label><T en="Business Name" ar="اسم المؤسسة / الشركة" /></label>
            <input name="businessName" className="input" required placeholder="My Music Gear Store" />
          </div>
          <div>
            <label><T en="Email" ar="البريد الإلكتروني" /></label>
            <input name="email" type="email" className="input" required placeholder="vendor@example.com" />
          </div>
          <div>
            <label><T en="Password" ar="كلمة المرور" /></label>
            <input name="password" type="password" className="input" required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "..." : <T en="Create Vendor Account" ar="إنشاء حساب تاجر" />}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link href="/login" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
              <T en="Already have an account? Login" ar="لديك حساب بالفعل؟ سجل دخولك" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
