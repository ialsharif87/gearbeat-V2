"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

export default function StoreOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    city: "Riyadh",
    website: "",
    phone: "",
    crNumber: "",
    vatNumber: "",
    iban: "",
    bankName: "",
    categories: [] as string[],
    warrantyPolicy: "",
    returnPolicy: "",
    shippingPolicy: "",
    agreed: false
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Fetch existing data to pre-fill
        supabase.from("vendor_profiles").select("*").eq("id", data.user.id).maybeSingle().then(({ data: profile }) => {
          if (profile) {
            setFormData(prev => ({
              ...prev,
              nameEn: profile.business_name_en || "",
              nameAr: profile.business_name_ar || "",
              phone: profile.contact_phone || "",
              website: profile.website_url || "",
              crNumber: profile.cr_number || "",
              vatNumber: profile.vat_number || "",
              iban: profile.metadata?.iban || "",
              bankName: profile.metadata?.bank_name || "",
              categories: profile.metadata?.categories || [],
              warrantyPolicy: profile.metadata?.warranty_policy || "",
              returnPolicy: profile.metadata?.return_policy || "",
              shippingPolicy: profile.metadata?.shipping_policy || "",
              agreed: profile.agreement_status === "signed"
            }));
          }
        });
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "agreed") {
        setFormData(prev => ({ ...prev, agreed: checkbox.checked }));
      } else {
        setFormData(prev => {
          const cats = checkbox.checked 
            ? [...prev.categories, value]
            : prev.categories.filter(c => c !== value);
          return { ...prev, categories: cats };
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("vendor_profiles").upsert({
        id: userId,
        business_name_en: formData.nameEn,
        business_name_ar: formData.nameAr,
        slug: formData.nameEn ? `${formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}` : `vendor-${Date.now()}`,
        contact_email: "", 
        contact_phone: formData.phone,
        website_url: formData.website,
        vat_number: formData.vatNumber,
        cr_number: formData.crNumber,
        status: "pending",
        compliance_status: "pending",
        agreement_status: "signed",
        // Metadata fields for custom policies
        metadata: {
          categories: formData.categories,
          warranty_policy: formData.warrantyPolicy,
          return_policy: formData.returnPolicy,
          shipping_policy: formData.shippingPolicy,
          iban: formData.iban,
          bank_name: formData.bankName
        }
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Store onboarding error:", err);
      alert("Failed to submit onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoriesList = [
    "Microphones", "Headphones", "Audio Interfaces", 
    "Studio Monitors", "Musical Instruments", "Podcast Equipment",
    "Cables & Accessories", "Lighting & Creator Gear"
  ];

  if (submitted) {
    return (
      <main className="dashboard-page" style={{ maxWidth: 800, margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 60 }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>🏪</div>
          <h2>
            <T en="Store Submitted!" ar="تم إرسال طلب المتجر!" />
          </h2>
          <p style={{ color: "var(--muted)", marginTop: 16, fontSize: "1.1rem" }}>
            <T 
              en="Your store has been submitted. We will review and approve within 2 business days." 
              ar="تم إرسال متجرك. سنراجع ونوافق خلال يومي عمل." 
            />
          </p>
          <div style={{ marginTop: 30 }}>
            <a href="/portal/store" className="btn btn-primary">
              <T en="Go to Dashboard" ar="الذهاب للوحة التحكم" />
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 800, margin: "40px auto" }}>
      <div className="section-head" style={{ textAlign: "center" }}>
        <h1><T en="Seller Onboarding" ar="انضمام البائع" /></h1>
        <p><T en="Register your store and start selling on GearBeat." ar="سجل متجرك وابدأ البيع على GearBeat." /></p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "0.9rem", fontWeight: 600 }}>
          <span><T en={`Step ${step} of 4`} ar={`الخطوة ${step} من 4`} /></span>
          <span>{Math.round((step / 4) * 100)}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ width: `${(step / 4) * 100}%`, height: "100%", background: "var(--gb-gold)", transition: "0.3s ease" }} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="card form">
            <h2 style={{ marginBottom: 20 }}><T en="Basic Information" ar="المعلومات الأساسية" /></h2>
            
            <label><T en="Store Name (English)" ar="اسم المتجر (إنجليزي)" /> *</label>
            <input className="input" name="nameEn" value={formData.nameEn} onChange={handleChange} required />

            <label><T en="Store Name (Arabic)" ar="اسم المتجر (عربي)" /> *</label>
            <input className="input" name="nameAr" value={formData.nameAr} onChange={handleChange} required />

            <label><T en="City" ar="المدينة" /></label>
            <select className="input" name="city" value={formData.city} onChange={handleChange}>
              <option>Riyadh</option>
              <option>Jeddah</option>
              <option>Dammam</option>
              <option>Other</option>
            </select>

            <label><T en="Website URL (Optional)" ar="رابط الموقع (اختياري)" /></label>
            <input className="input" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />

            <label><T en="Contact Phone" ar="رقم التواصل" /> *</label>
            <input className="input" name="phone" value={formData.phone} onChange={handleChange} required />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={nextStep} disabled={!formData.nameEn || !formData.nameAr || !formData.phone}>
                <T en="Next" ar="التالي" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card form">
            <h2 style={{ marginBottom: 20 }}><T en="Business Documents" ar="مستندات العمل" /></h2>

            <label><T en="Commercial Registration Number" ar="رقم السجل التجاري" /> *</label>
            <input className="input" name="crNumber" value={formData.crNumber} onChange={handleChange} required />

            <label><T en="VAT Number (Optional)" ar="الرقم الضريبي (اختياري)" /></label>
            <input className="input" name="vatNumber" value={formData.vatNumber} onChange={handleChange} />

            <label><T en="IBAN" ar="رقم الآيبان" /> *</label>
            <input className="input" name="iban" value={formData.iban} onChange={handleChange} placeholder="SA..." required />

            <label><T en="Bank Name" ar="اسم البنك" /> *</label>
            <input className="input" name="bankName" value={formData.bankName} onChange={handleChange} required />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="button" className="btn btn-primary" onClick={nextStep} disabled={!formData.crNumber || !formData.iban}>
                <T en="Next" ar="التالي" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card form">
            <h2 style={{ marginBottom: 20 }}><T en="Store Details" ar="تفاصيل المتجر" /></h2>

            <label><T en="Product Categories" ar="فئات المنتجات" /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {categoriesList.map(cat => (
                <label key={cat} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" value={cat} checked={formData.categories.includes(cat)} onChange={handleChange} style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: "0.9rem" }}>{cat}</span>
                </label>
              ))}
            </div>

            <label><T en="Warranty Policy" ar="سياسة الضمان" /> *</label>
            <textarea className="input" name="warrantyPolicy" rows={3} value={formData.warrantyPolicy} onChange={handleChange} required />

            <label><T en="Return Policy" ar="سياسة الاسترجاع" /> *</label>
            <textarea className="input" name="returnPolicy" rows={3} value={formData.returnPolicy} onChange={handleChange} required />

            <label><T en="Shipping Policy" ar="سياسة الشحن" /> *</label>
            <textarea className="input" name="shippingPolicy" rows={3} value={formData.shippingPolicy} onChange={handleChange} required />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="button" className="btn btn-primary" onClick={nextStep} disabled={!formData.warrantyPolicy || !formData.returnPolicy || !formData.shippingPolicy}>
                <T en="Next" ar="التالي" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <h2 style={{ marginBottom: 20 }}><T en="Review & Submit" ar="المراجعة والإرسال" /></h2>
            
            <div style={{ display: "grid", gap: 16, background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 12, marginBottom: 24 }}>
              <div><strong><T en="Store:" ar="المتجر:" /></strong> {formData.nameEn} / {formData.nameAr}</div>
              <div><strong><T en="Categories:" ar="الفئات:" /></strong> {formData.categories.join(", ") || "None"}</div>
              <div><strong><T en="Phone:" ar="الهاتف:" /></strong> {formData.phone}</div>
              <div><strong><T en="IBAN:" ar="الآيبان:" /></strong> {formData.iban}</div>
            </div>

            <label style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "10px 0" }}>
              <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} style={{ width: 20, height: 20 }} />
              <span><T en="I agree to GearBeat Seller Agreement" ar="أوافق على اتفاقية بائع GearBeat" /></span>
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 30 }}>
              <button type="button" className="btn btn-secondary" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="submit" className="btn btn-primary btn-large" disabled={!formData.agreed || loading}>
                {loading ? <T en="Submitting..." ar="جاري الإرسال..." /> : <T en="Submit for Review" ar="إرسال للمراجعة" />}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
