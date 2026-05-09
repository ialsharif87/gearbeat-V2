"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { uploadProviderDocumentAction } from "@/lib/storage/provider-documents";
import { CountryOption } from "@/lib/countries";
import { CityOption } from "@/lib/locations";

const CATEGORIES = [
  { id: "mic", en: "Microphones", ar: "ميكروفونات" },
  { id: "interface", en: "Audio Interfaces", ar: "كرت صوت" },
  { id: "instruments", en: "Musical Instruments", ar: "آلات موسيقية" },
  { id: "monitors", en: "Studio Monitors", ar: "سماعات ستوديو" },
  { id: "headphones", en: "Headphones", ar: "سماعات رأس" },
  { id: "podcast", en: "Podcast Equipment", ar: "معدات بودكاست" },
  { id: "cables", en: "Cables & Accessories", ar: "كابلات وإكسسوارات" },
  { id: "lighting", en: "Lighting & Creator Gear", ar: "إضاءة ومعدات صناع المحتوى" },
];

export default function JoinSellerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [country, setCountry] = useState("SA");
  const [city, setCity] = useState("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/countries")
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(err => {
        console.error("Failed to fetch countries:", err);
      });
  }, []);

  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }
    fetch(`/api/cities?country=${country}`)
      .then(res => res.json())
      .then(data => {
        setCities(data);
      })
      .catch(err => {
        console.error("Failed to fetch cities:", err);
      });
  }, [country]);

  // Files State
  const [crFile, setCrFile] = useState<File | null>(null);
  const [vatFile, setVatFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadProviderDocumentAction(formData, "seller-applications");

    if (!res.success || !res.path) {
      throw new Error(res.error || "File upload failed");
    }

    return res.path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!crFile || !addressFile || !bankFile) {
        throw new Error("Please upload all required documents.");
      }

      // Step 1: Upload Files
      const [crUrl, vatUrl, addressUrl, bankUrl] = await Promise.all([
        uploadFile(crFile),
        vatFile ? uploadFile(vatFile) : Promise.resolve(null),
        uploadFile(addressFile),
        uploadFile(bankFile),
      ]);

      // Step 2: Insert into DB
      const supabase = createClient();
      const { error: insertError } = await supabase.from("provider_leads").insert({
        name: fullName,
        business_name: companyNameEn,
        business_name_ar: companyNameAr,
        email,
        phone: mobile,
        country: countries.find(c => c.country_code === country)?.name_en || country,
        city: cities.find(c => c.id === city)?.name_en || city,
        product_categories: selectedCategories,
        message: notes,
        type: "seller",
        status: "new",
        cr_document_url: crUrl,
        vat_document_url: vatUrl,
        national_address_url: addressUrl,
        bank_document_url: bankUrl,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw new Error("Database insertion failed");

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Submission Error:", err);
      const message = err instanceof Error ? err.message : "Failed to submit application. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 640, width: "100%", background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", color: "#22c55e", marginBottom: 24 }}>✓</div>
          <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>
            <T en="Application Submitted!" ar="تم إرسال طلبك!" />
          </h1>
          <p style={{ color: "#888", fontSize: "1.1rem", marginBottom: 40, lineHeight: 1.6 }}>
            <T en="We will review your documents and contact you within 2 business days." ar="سنراجع وثائقك ونتواصل معك خلال يومي عمل." />
          </p>
          <Link href="/" className="btn btn-primary" style={{ height: 54, fontSize: "1.1rem", fontWeight: 700, padding: "0 40px" }}>
            <T en="Back to Home" ar="العودة للرئيسية" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", padding: "60px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-1px", marginBottom: 24 }}>GearBeat</div>
        <div style={{ display: "inline-block", background: "rgba(207, 168, 110, 0.1)", color: "#cfa86e", padding: "4px 12px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, marginBottom: 16 }}>
          <T en="Become a Seller" ar="سجّل كتاجر" />
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>
          <T en="Join GearBeat Marketplace" ar="انضم لسوق GearBeat" />
        </h1>
        <p style={{ color: "#888", fontSize: "1.1rem" }}>
          <T en="Fill in your details and we will review your application within 2 business days." ar="أدخل بياناتك وسنراجع طلبك خلال يومي عمل." />
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 40 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 32 }}>
          {/* Section 1: Personal Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#cfa86e" }}>
              <T en="Personal Information" ar="المعلومات الشخصية" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Full Name" ar="الاسم الكامل" /></label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Mobile Number" ar="رقم الجوال" /></label>
                <input className="input" placeholder="05XXXXXXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Email" ar="البريد الإلكتروني" /></label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
          </section>

          {/* Section 2: Business Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#cfa86e" }}>
              <T en="Business Information" ar="معلومات المنشأة" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Company Name (Arabic)" ar="اسم الشركة بالعربي" /></label>
                <input className="input" value={companyNameAr} onChange={(e) => setCompanyNameAr(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Company Name (English)" ar="اسم الشركة بالإنجليزي" /></label>
                <input className="input" value={companyNameEn} onChange={(e) => setCompanyNameEn(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Country" ar="الدولة" /> *</label>
                <select className="input" value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }} required>
                  {countries.map(c => (
                    <option key={c.country_code} value={c.country_code}>
                      <T en={c.name_en} ar={c.name_ar} />
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="City" ar="المدينة" /> *</label>
                {cities.length > 0 ? (
                  <select className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
                    <option value=""><T en="Select City" ar="اختر المدينة" /></option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        <T en={c.name_en} ar={c.name_ar} />
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    className="input" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    required 
                    placeholder={country === "SA" ? "أدخل اسم المدينة" : "Enter city name"}
                  />
                )}
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Product Categories" ar="فئات المنتجات" /></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.85rem", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: 8, border: selectedCategories.includes(cat.id) ? "1px solid #cfa86e" : "1px solid transparent" }}>
                      <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} style={{ width: 16, height: 16 }} />
                      <T en={cat.en} ar={cat.ar} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Documents */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 4, color: "#cfa86e" }}>
              <T en="Required Documents" ar="الوثائق المطلوبة" />
            </h3>
            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 20 }}>
              <T en="Upload clear photos or PDF files" ar="ارفع صوراً واضحة أو ملفات PDF" />
            </p>
            
            <div style={{ display: "grid", gap: 16 }}>
              <UploadField labelEn="Commercial Registration" labelAr="السجل التجاري" file={crFile} onChange={setCrFile} required />
              <UploadField labelEn="VAT Certificate" labelAr="شهادة ضريبة القيمة المضافة" file={vatFile} onChange={setVatFile} optional />
              <UploadField labelEn="National Address Certificate" labelAr="العنوان الوطني" file={addressFile} onChange={setAddressFile} required />
              <UploadField labelEn="Bank Account / IBAN Document" labelAr="وثيقة الحساب البنكي / الآيبان" file={bankFile} onChange={setBankFile} required />
            </div>
          </section>

          {/* Section 4: Additional Info */}
          <section>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Additional Notes" ar="ملاحظات إضافية" /></label>
              <textarea className="input" style={{ minHeight: 100, paddingTop: 12 }} maxLength={500} placeholder={notes || "Tell us about your business..."} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </section>

          {error && (
            <div style={{ color: "#ff4d4d", background: "rgba(255,77,77,0.1)", padding: 12, borderRadius: 8, fontSize: "0.9rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ height: 60, fontSize: "1.2rem", fontWeight: 800, borderRadius: 12 }} disabled={loading}>
            {loading ? "..." : <T en="Submit Application" ar="إرسال الطلب" />}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .upload-area {
          border: 2px dashed #333;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.01);
          position: relative;
        }
        .upload-area:hover {
          border-color: #cfa86e;
          background: rgba(207, 168, 110, 0.05);
        }
        .upload-area input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}} />
    </main>
  );
}

function UploadField({ labelEn, labelAr, file, onChange, required, optional }: { 
  labelEn: string; 
  labelAr: string; 
  file: File | null; 
  onChange: (file: File | null) => void; 
  required?: boolean; 
  optional?: boolean; 
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600 }}><T en={labelEn} ar={labelAr} /> {required && "*"}</label>
        {optional && <span style={{ fontSize: "0.7rem", color: "#666", background: "#222", padding: "2px 8px", borderRadius: 4 }}>Optional</span>}
      </div>
      <div className="upload-area">
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] || null)} required={required} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.5rem" }}>📎</span>
          <div style={{ fontSize: "0.85rem", color: file ? "#22c55e" : "#888", fontWeight: file ? 700 : 400 }}>
            {file ? file.name : <T en="Click to upload" ar="اضغط للرفع" />}
          </div>
        </div>
      </div>
    </div>
  );
}
