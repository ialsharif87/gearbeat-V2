"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { createNotification } from "@/lib/notifications";
import { uploadProviderDocumentAction } from "@/lib/storage/provider-documents";

import { CountryOption } from "@/lib/countries";
import { CityOption } from "@/lib/locations";

export default function JoinStudioPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Data State
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+966");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [commercialRegistration, setCommercialRegistration] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("SA");
  const [city, setCity] = useState("");
  const [plannedStudios, setPlannedStudios] = useState("1");
  const [aboutCompany, setAboutCompany] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch Countries
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("/api/countries");
        if (!res.ok) throw new Error("Failed to load countries");
        const data = await res.json();
        setCountries(data);
        
        // Update phone code if SA exists
        const sa = data.find((c: CountryOption) => c.country_code === "SA");
        if (sa) setPhoneCode(sa.phone_code);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingData(false);
      }
    }
    fetchCountries();
  }, []);

  // Fetch Cities when country changes
  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }

    async function fetchCities() {
      try {
        const res = await fetch(`/api/cities?country=${country}`);
        if (!res.ok) throw new Error("Failed to load cities");
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error(err);
        setCities([]);
      }
    }
    fetchCities();
  }, [country]);

  // Files State
  const [crFile, setCrFile] = useState<File | null>(null);
  const [vatFile, setVatFile] = useState<File | null>(null);
  const [nationalAddressFile, setNationalAddressFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadProviderDocumentAction(formData, "studio-applications");

    if (!res.success || !res.path) {
      throw new Error(res.error || "File upload failed");
    }

    return res.path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedOnce(true);
    
    if (!termsAccepted) return;

    // Validate Required Documents
    if (!crFile || !vatFile || !nationalAddressFile || !bankFile) {
      setError("Please upload all required documents.");
      return;
    }

    // Validate VAT Number (15 digits for Saudi Arabia)
    if (country === "SA" && (vatNumber.length !== 15 || !/^\d+$/.test(vatNumber))) {
      setError("VAT Number must be exactly 15 digits for Saudi Arabia.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload Files
      const [crUrl, vatUrl, nationalAddressUrl, bankUrl] = await Promise.all([
        uploadFile(crFile),
        uploadFile(vatFile),
        uploadFile(nationalAddressFile),
        uploadFile(bankFile),
      ]);

      // Step 2: Insert into DB
      const supabase = createClient();
      const fullMobile = `${phoneCode}${mobile}`;
      
      const { error: insertError } = await supabase.from("studio_applications").insert({
        full_name: fullName,
        email,
        phone: fullMobile,
        company_name_ar: companyNameAr,
        company_name_en: companyNameEn,
        commercial_registration: commercialRegistration,
        vat_number: vatNumber,
        vat_certificate_url: vatUrl,
        cr_document_url: crUrl,
        national_address_url: nationalAddressUrl,
        bank_document_url: bankUrl,
        country: countries.find(c => c.country_code === country)?.name_en || country,
        city: cities.find(c => c.id === city)?.name_en || city,
        planned_studios_count: parseInt(plannedStudios),
        about_company: aboutCompany,
        terms_accepted: termsAccepted,
        terms_accepted_at: new Date().toISOString(),
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw new Error("Database submission failed: " + insertError.message);

      // Step 3: Notify Admin
      try {
        await createNotification(supabase, {
          audience: "admin",
          title: `New Studio Application: ${companyNameEn}`,
          body: `${fullName} has applied for ${companyNameEn}.`,
          actionUrl: `/admin/leads`, // Redirect to leads list or specific lead detail if we have ID
          entityType: "studio_application",
          metadata: {
            email: email,
            company: companyNameEn
          }
        });
      } catch (notifyErr) {
        console.warn("Notification failed, but application was saved.", notifyErr);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 640, width: "100%", background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", color: "#D4AF37", marginBottom: 24 }}>✓</div>
          <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>
            <T en="Application Submitted!" ar="تم إرسال طلبك!" />
          </h1>
          <p style={{ color: "#888", fontSize: "1.1rem", marginBottom: 40, lineHeight: 1.6 }}>
            <T en="We will review your company details and contact you within 2 business days." ar="سنراجع بيانات شركتك ونتواصل معك خلال يومي عمل." />
          </p>
          <Link href="/" className="btn btn-primary" style={{ height: 54, fontSize: "1.1rem", fontWeight: 700, padding: "0 40px" }}>
            <T en="Back to Home" ar="العودة للرئيسية" />
          </Link>
        </div>
      </main>
    );
  }

  if (fetchingData) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <T en="Loading..." ar="جاري التحميل..." />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", padding: "60px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-1px", marginBottom: 24, color: "#D4AF37" }}>GearBeat</div>
        <div style={{ display: "inline-block", background: "rgba(212, 175, 55, 0.1)", color: "#D4AF37", padding: "4px 12px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, marginBottom: 16 }}>
          <T en="Studio Owner Program" ar="برنامج ملاك الاستوديوهات" />
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>
          <T en="Join GearBeat as a Provider" ar="انضم لـ GearBeat كمزود خدمة" />
        </h1>
        <p style={{ color: "#888", fontSize: "1.1rem" }}>
          <T en="Register your company to manage one or more studios on our premium marketplace." ar="سجل شركتك لإدارة استوديو واحد أو أكثر على منصتنا الفاخرة." />
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 40 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 32 }}>
          {/* Section 1: Authorized Person Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#D4AF37" }}>
              <T en="Authorized Person" ar="الشخص المفوض" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Full Name" ar="الاسم الكامل" /> *</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Mobile Number" ar="رقم الجوال" /> *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select 
                    className="input" 
                    style={{ width: "auto", minWidth: 120, padding: "0 8px" }} 
                    value={phoneCode} 
                    onChange={(e) => setPhoneCode(e.target.value)}
                  >
                    {countries.map(c => (
                      <option key={c.country_code} value={c.phone_code}>{c.phone_code}</option>
                    ))}
                  </select>
                  <input className="input" style={{ flex: 1 }} placeholder="5XXXXXXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Email" ar="البريد الإلكتروني" /> *</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
          </section>

          {/* Section 2: Company Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#D4AF37" }}>
              <T en="Company Information" ar="معلومات الشركة" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Company Name (Arabic)" ar="اسم الشركة (بالعربي)" /> *</label>
                <input className="input" value={companyNameAr} onChange={(e) => setCompanyNameAr(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Company Name (English)" ar="اسم الشركة (بالإنجليزي)" /> *</label>
                <input className="input" value={companyNameEn} onChange={(e) => setCompanyNameEn(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Commercial Registration Number" ar="رقم السجل التجاري" /> *</label>
                <input className="input" value={commercialRegistration} onChange={(e) => setCommercialRegistration(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="VAT Number" ar="الرقم الضريبي" /> *</label>
                <input className="input" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} required placeholder={country === "SA" ? "15 digits" : ""} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Studios Planned" ar="عدد الاستوديوهات المخططة" /> *</label>
                <input className="input" type="number" min="1" value={plannedStudios} onChange={(e) => setPlannedStudios(e.target.value)} required />
              </div>
            </div>
          </section>

          {/* Section 3: Documents */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 4, color: "#D4AF37" }}>
              <T en="Required Documents" ar="الوثائق المطلوبة" />
            </h3>
            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 20 }}>
              <T en="All documents are mandatory for verification." ar="كافة الوثائق إلزامية لغرض التحقق." />
            </p>
            
            <div style={{ display: "grid", gap: 24 }}>
              <UploadField 
                labelEn="Commercial Registration" labelAr="السجل التجاري" 
                file={crFile} onChange={setCrFile} required 
                showError={submittedOnce && !crFile}
              />
              <UploadField 
                labelEn="VAT Certificate" labelAr="شهادة الضريبة" 
                file={vatFile} onChange={setVatFile} required 
                showError={submittedOnce && !vatFile}
              />
              <UploadField 
                labelEn="National Address" labelAr="العنوان الوطني" 
                file={nationalAddressFile} onChange={setNationalAddressFile} required 
                showError={submittedOnce && !nationalAddressFile}
              />
              <UploadField 
                labelEn="Bank Account Screenshot" labelAr="صورة الحساب البنكي" 
                file={bankFile} onChange={setBankFile} required 
                showError={submittedOnce && !bankFile}
              />
            </div>
          </section>

          {/* Section 4: About */}
          <section>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="About the company" ar="نبذة عن الشركة" /> *</label>
              <textarea className="input" style={{ minHeight: 100, paddingTop: 12 }} maxLength={1000} placeholder="..." value={aboutCompany} onChange={(e) => setAboutCompany(e.target.value)} required />
            </div>
          </section>

          {/* Section 5: Terms */}
          <section>
            <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ width: 20, height: 20, marginTop: 4 }} />
              <div style={{ fontSize: "0.9rem", color: "#aaa", lineHeight: 1.6 }}>
                <T 
                  en="I agree to the Terms & Conditions and allow GearBeat to review my data for verification and contracting purposes. I understand my data is protected under our Privacy Policy and Saudi PDPL." 
                  ar="أوافق على الشروط والأحكام وأتيح لـ GearBeat الاطلاع على بياناتي لأغراض التحقق والتعاقد. أفهم أن بياناتي محفوظة ومحمية وفقاً لسياسة الخصوصية ونظام PDPL السعودي." 
                />
                <div style={{ marginTop: 8 }}>
                  <Link 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="terms-link"
                  >
                    <T en="Terms & Conditions" ar="الشروط والأحكام" />
                  </Link>
                  <Link 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="terms-link"
                    style={{ marginLeft: 16 }}
                  >
                    <T en="Privacy Policy" ar="سياسة الخصوصية" />
                  </Link>
                </div>
              </div>
            </label>
          </section>

          {error && (
            <div style={{ color: "#ff4d4d", background: "rgba(255,77,77,0.1)", padding: 12, borderRadius: 8, fontSize: "0.9rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ height: 60, fontSize: "1.2rem", fontWeight: 800, borderRadius: 12 }} disabled={loading || !termsAccepted}>
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
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.05);
        }
        .upload-area.error {
          border-color: #ff4d4d;
        }
        .upload-area input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .terms-link {
          color: #D4AF37;
          text-decoration: underline;
          font-weight: 500;
          transition: color 0.2s;
        }
        .terms-link:hover {
          color: #f0c94d;
        }
      `}} />
    </main>
  );
}

function UploadField({ labelEn, labelAr, file, onChange, required, showError }: any) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600 }}><T en={labelEn} ar={labelAr} /> {required && "*"}</label>
      </div>
      <div className={`upload-area ${showError ? 'error' : ''}`}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] || null)} required={required} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.5rem" }}>📎</span>
          <div style={{ fontSize: "0.85rem", color: file ? "#22c55e" : "#888", fontWeight: file ? 700 : 400 }}>
            {file ? file.name : <T en="Click to upload" ar="اضغط للرفع" />}
          </div>
        </div>
      </div>
      {showError && (
        <div style={{ color: "#ff4d4d", fontSize: "0.75rem", fontWeight: 600 }}>
          <T en="This document is required" ar="هذا المستند مطلوب" />
        </div>
      )}
    </div>
  );
}
