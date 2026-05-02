"use client";

import T from "@/components/t";
import { submitProviderLead } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function JoinSellerPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitProviderLead(formData, "seller");
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <main className="dashboard-page" style={{ maxWidth: 600, margin: "100px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "60px 40px" }}>
          <div style={{ fontSize: "4rem", marginBottom: 24 }}>✅</div>
          <h1 style={{ marginBottom: 16 }}>
            <T en="Application Received!" ar="تم استلام طلبك!" />
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            <T 
              en="Thank you for your interest in selling on GearBeat. Our team will review your details and reach out to you within 2 business days." 
              ar="شكراً لاهتمامك بالبيع على جيربيت. سيقوم فريقنا بمراجعة بياناتك والتواصل معك خلال يومي عمل." 
            />
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 600, margin: "60px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: 16 }}>
          <T en="Sell on GearBeat" ar="بع على GearBeat" />
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
          <T
            en="Fill in your details and we will be in touch within 2 business days."
            ar="أدخل بياناتك وسنتواصل معك خلال يومي عمل."
          />
        </p>
      </div>

      <div className="card" style={{ padding: 40 }}>
        <form action={handleSubmit} style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              <T en="Full Name" ar="الاسم الكامل" />
            </label>
            <input name="name" type="text" className="input" required placeholder="e.g. Mohammed Khalid" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              <T en="Business Name" ar="اسم المنشأة / المحل" />
            </label>
            <input name="business_name" type="text" className="input" required placeholder="e.g. Pro Audio Store" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              <T en="Email Address" ar="البريد الإلكتروني" />
            </label>
            <input name="email" type="email" className="input" required placeholder="contact@proaudio.com" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              <T en="City" ar="المدينة" />
            </label>
            <select name="city" className="input" required defaultValue="">
              <option value="" disabled>Select city</option>
              <option value="Riyadh">Riyadh</option>
              <option value="Jeddah">Jeddah</option>
              <option value="Dammam">Dammam</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              <T en="Message (Optional)" ar="رسالة إضافية (اختياري)" />
            </label>
            <textarea name="message" className="input" style={{ minHeight: 120, paddingTop: 12 }} placeholder="Tell us about the gear you sell..." />
          </div>

          {result?.error && (
            <p style={{ color: "#ff4d4d", fontSize: "0.9rem" }}>{result.error}</p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: 54, fontSize: "1.1rem" }}
            disabled={isPending}
          >
            {isPending ? "..." : <T en="Submit Application" ar="إرسال الطلب" />}
          </button>
        </form>
      </div>
    </main>
  );
}
