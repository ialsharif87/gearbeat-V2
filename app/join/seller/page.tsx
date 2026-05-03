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
      <main className="dashboard-page" style={{ maxWidth: 700, margin: "100px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "60px 40px" }}>
          <div style={{ fontSize: "4rem", marginBottom: 24 }}>✅</div>
          <h1 style={{ marginBottom: 16 }}>
            <T en="Application Received!" ar="تم استلام طلبك!" />
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            <T 
              en="Thank you for your interest. Our team will review your documents and reach out to you within 2 business days to proceed with the account setup." 
              ar="شكراً لاهتمامك. سيقوم فريقنا بمراجعة مستنداتك والتواصل معك خلال يومي عمل لإتمام إعداد الحساب." 
            />
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "60px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>
          <T en="Partner with GearBeat" ar="انضم كشريك في جيربيت" />
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
          <T
            en="Apply to become a verified vendor. Please provide your business documents for review."
            ar="قدم طلبك لتصبح تاجراً معتمداً. يرجى تزويدنا بمستندات العمل للمراجعة."
          />
        </p>
      </div>

      <div className="card" style={{ padding: 40, background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e' }}>
        <form action={handleSubmit} style={{ display: "grid", gap: 32 }}>
          <div>
            <h3 style={{ marginBottom: 20, color: '#cfa86e', fontSize: '1.2rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
              <T en="Business Information" ar="معلومات المنشأة" />
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Business Name" ar="اسم المنشأة / المحل" /> *
                </label>
                <input name="business_name" type="text" className="input" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="City" ar="المدينة" /> *
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
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Official Email" ar="البريد الإلكتروني الرسمي" /> *
                </label>
                <input name="email" type="email" className="input" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Website / Social Media" ar="الموقع / وسائل التواصل" />
                </label>
                <input name="website" type="text" className="input" />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 20, color: '#cfa86e', fontSize: '1.2rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
              <T en="Account Manager Details" ar="بيانات المسؤول عن الحساب" />
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Full Name" ar="الاسم الكامل" /> *
                </label>
                <input name="manager_name" type="text" className="input" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Phone Number" ar="رقم الهاتف" /> *
                </label>
                <input name="manager_phone" type="tel" className="input" required />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 20, color: '#cfa86e', fontSize: '1.2rem', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
              <T en="Required Documents" ar="المستندات المطلوبة" />
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Commercial Registration" ar="السجل التجاري" /> *
                </label>
                <input name="cr_file" type="file" className="input" accept=".pdf,.jpg,.png" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="VAT Certificate" ar="شهادة ضريبة القيمة المضافة" /> *
                </label>
                <input name="vat_file" type="file" className="input" accept=".pdf,.jpg,.png" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="National Address" ar="العنوان الوطني" /> *
                </label>
                <input name="address_file" type="file" className="input" accept=".pdf,.jpg,.png" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Certified IBAN Letter" ar="خطاب الحساب البنكي (الآيبان) المعتمد" /> *
                </label>
                <input name="iban_file" type="file" className="input" accept=".pdf,.jpg,.png" required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: '#888' }}>
                  <T en="Signed Contract / Declaration" ar="نسخة من العقد أو الإقرار" /> *
                </label>
                <input name="contract_file" type="file" className="input" accept=".pdf,.jpg,.png" required />
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
            <label style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <input name="acknowledged" type="checkbox" required style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
                <T 
                  en="I declare that all provided information and documents are correct and I agree to GearBeat terms." 
                  ar="أقر بأن جميع المعلومات والمستندات المقدمة صحيحة وأوافق على شروط جيربيت." 
                />
              </span>
            </label>
          </div>

          {result?.error && (
            <p style={{ color: "#ff4d4d", fontSize: "0.9rem", textAlign: 'center' }}>{result.error}</p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: 60, fontSize: "1.2rem", fontWeight: 800, borderRadius: '12px' }}
            disabled={isPending}
          >
            {isPending ? "..." : <T en="Submit Application" ar="إرسال طلب الانضمام" />}
          </button>
        </form>
      </div>
    </main>
  );
}
