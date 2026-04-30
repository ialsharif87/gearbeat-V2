"use client";

import React, { useState } from "react";
import T from "../components/t";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function VendorSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'vendor'
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        router.push("/login?created=true&account=vendor");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: '3rem', marginBottom: 15 }}>📦</div>
          <h1><T en="Gear Vendor Signup" ar="تسجيل تاجر معدات" /></h1>
          <p><T en="Join the professional GearBeat marketplace." ar="انضم لسوق GearBeat الاحترافي." /></p>
        </div>

        {error && <div style={{ color: '#ff4d4d', marginBottom: 20 }}>{error}</div>}

        <form className="grid gap-20" onSubmit={handleSubmit}>
          <div>
            <label><T en="Full Name" ar="الاسم الكامل" /></label>
            <input name="fullName" className="input" required />
          </div>
          <div>
            <label><T en="Email" ar="البريد الإلكتروني" /></label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label><T en="Password" ar="كلمة المرور" /></label>
            <input name="password" type="password" className="input" required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "..." : <T en="Create Vendor Account" ar="إنشاء حساب تاجر" />}
          </button>
        </form>
      </div>
    </div>
  );
}
