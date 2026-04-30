"use client";

import React, { useState } from "react";
import T from "@/components/t";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function VendorRegisterPage() {
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
    const businessName = formData.get("businessName") as string;

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create the vendor profile (In a real app, this might be a trigger or a secondary call)
        // For testing, we'll redirect to the onboarding page where they finish details
        // and ensure the profile is created.
        router.push("/vendor/onboarding");
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
          <h1 style={{ fontSize: '2rem' }}>
            <T en="Open your Gear Store" ar="افتح متجر المعدات الخاص بك" />
          </h1>
          <p style={{ color: 'var(--gb-muted)' }}>
            <T en="Start selling to the GCC music community today." ar="ابدأ البيع لمجتمع الموسيقى في الخليج اليوم." />
          </p>
        </div>

        {error && (
          <div style={{ padding: 15, background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form className="grid gap-20" onSubmit={handleSubmit}>
          <div>
            <label><T en="Full Name" ar="الاسم الكامل" /></label>
            <input name="fullName" className="input" placeholder="John Doe / محمد علي" required />
          </div>
          
          <div>
            <label><T en="Business Name" ar="اسم المتجر / المنشأة" /></label>
            <input name="businessName" className="input" placeholder="My Music Gear" required />
          </div>

          <div>
            <label><T en="Email Address" ar="البريد الإلكتروني" /></label>
            <input name="email" type="email" className="input" placeholder="name@example.com" required />
          </div>

          <div>
            <label><T en="Password" ar="كلمة المرور" /></label>
            <input name="password" type="password" className="input" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-large" disabled={loading}>
            {loading ? <T en="Creating account..." ar="جاري إنشاء الحساب..." /> : <T en="Create Vendor Account" ar="إنشاء حساب تاجر" />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 25, fontSize: '0.9rem' }}>
           <T en="Already have an account?" ar="لديك حساب بالفعل؟" />{' '}
           <Link href="/login" className="text-link"><T en="Login here" ar="سجل دخولك هنا" /></Link>
        </div>
      </div>
    </div>
  );
}
