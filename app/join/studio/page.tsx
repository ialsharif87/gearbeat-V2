"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

const STUDIO_TYPES = [
  { id: "recording", en: "Recording Studio", ar: "استوديو تسجيل" },
  { id: "podcast", en: "Podcast Studio", ar: "استوديو بودكاست" },
  { id: "voiceover", en: "Voiceover Studio", ar: "استوديو تعليق صوتي" },
  { id: "dubbing", en: "Dubbing Studio", ar: "استوديو دوبلاج" },
  { id: "training", en: "Music Training", ar: "تدريب موسيقي" },
  { id: "rehearsal", en: "Rehearsal Space", ar: "غرف بروفة" },
  { id: "post_prod", en: "Animation/Post Production", ar: "تحريك وإنتاج مرئي" },
  { id: "creative", en: "Creative Space", ar: "مساحة إبداعية" },
];

export default function JoinStudioPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [studioNameAr, setStudioNameAr] = useState("");
  const [studioNameEn, setStudioNameEn] = useState("");
  const [city, setCity] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [rooms, setRooms] = useState("1");
  const [hourlyPrice, setHourlyPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Files State
  const [crFile, setCrFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  async function uploadFile(file: File) {
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `studio-applications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("provider-documents")
      .upload(filePath, file);

    if (uploadError) throw new Error("File upload failed");

    const { data: urlData } = supabase.storage
      .from("provider-documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!crFile || !licenseFile || !addressFile || !bankFile) {
        throw new Error("Please upload all required documents.");
      }
      if (selectedTypes.length === 0) {
        throw new Error("Please select at least one studio type.");
      }

      // Step 1: Upload Files
      const [crUrl, licenseUrl, addressUrl, bankUrl] = await Promise.all([
        uploadFile(crFile),
        uploadFile(licenseFile),
        uploadFile(addressFile),
        uploadFile(bankFile),
      ]);

      // Step 2: Insert into DB
      const supabase = createClient();
      const { error: insertError } = await supabase.from("provider_leads").insert({
        name: fullName,
        business_name: studioNameEn,
        business_name_ar: studioNameAr,
        email,
        phone: mobile,
        city,
        product_categories: selectedTypes, // Reusing field for studio types
        message: `${notes}\n\nRooms: ${rooms}\nPrice: ${hourlyPrice} SAR/hr`,
        type: "studio",
        status: "new",
        cr_document_url: crUrl,
        vat_document_url: licenseUrl, // Reusing VAT field for Location License
        national_address_url: addressUrl,
        bank_document_url: bankUrl,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw new Error("Database insertion failed");

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
        <div style={{ display: "inline-block", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 12px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, marginBottom: 16 }}>
          <T en="List Your Studio" ar="سجّل استوديوك" />
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 16 }}>
          <T en="Join GearBeat as a Studio" ar="انضم لـ GearBeat كاستوديو" />
        </h1>
        <p style={{ color: "#888", fontSize: "1.1rem" }}>
          <T en="Fill in your details and we will review your application within 2 business days." ar="أدخل بياناتك وسنراجع طلبك خلال يومي عمل." />
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 40 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 32 }}>
          {/* Section 1: Personal Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#3b82f6" }}>
              <T en="Personal Information" ar="المعلومات الشخصية" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Full Name" ar="الاسم الكامل" /></label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Mobile Number" ar="رقم الجوال" /></label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ background: "#222", borderRadius: 8, padding: "0 12px", display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#fff", border: "1px solid #1e1e1e" }}>🇸🇦 +966</div>
                  <input className="input" style={{ flex: 1 }} placeholder="5XXXXXXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Email" ar="البريد الإلكتروني" /></label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
          </section>

          {/* Section 2: Studio Info */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 20, color: "#3b82f6" }}>
              <T en="Studio Information" ar="معلومات الاستوديو" />
            </h3>
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Studio Name (Arabic)" ar="اسم الاستوديو بالعربي" /></label>
                <input className="input" value={studioNameAr} onChange={(e) => setStudioNameAr(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Studio Name (English)" ar="اسم الاستوديو بالإنجليزي" /></label>
                <input className="input" value={studioNameEn} onChange={(e) => setStudioNameEn(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="City" ar="المدينة" /></label>
                  <select className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
                    <option value="">Select City</option>
                    <option value="Riyadh">الرياض / Riyadh</option>
                    <option value="Jeddah">جدة / Jeddah</option>
                    <option value="Dammam">الدمام / Dammam</option>
                    <option value="Makkah">مكة / Makkah</option>
                    <option value="Madinah">المدينة / Madinah</option>
                    <option value="Other">أخرى / Other</option>
                  </select>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Number of Rooms" ar="عدد الغرف" /></label>
                  <select className="input" value={rooms} onChange={(e) => setRooms(e.target.value)} required>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Starting Price per Hour (SAR)" ar="سعر الساعة يبدأ من (ريال)" /></label>
                <input className="input" type="number" value={hourlyPrice} onChange={(e) => setHourlyPrice(e.target.value)} required />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Studio Type" ar="نوع الاستوديو" /></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {STUDIO_TYPES.map((type) => (
                    <label key={type.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.85rem", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: 8, border: selectedTypes.includes(type.id) ? "1px solid #3b82f6" : "1px solid transparent" }}>
                      <input type="checkbox" checked={selectedTypes.includes(type.id)} onChange={() => toggleType(type.id)} style={{ width: 16, height: 16 }} />
                      <T en={type.en} ar={type.ar} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Documents */}
          <section>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 4, color: "#3b82f6" }}>
              <T en="Required Documents" ar="الوثائق المطلوبة" />
            </h3>
            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 20 }}>
              <T en="Upload clear photos or PDF files" ar="ارفع صوراً واضحة أو ملفات PDF" />
            </p>
            
            <div style={{ display: "grid", gap: 16 }}>
              <UploadField labelEn="Commercial Registration" labelAr="السجل التجاري" file={crFile} onChange={setCrFile} required />
              <UploadField labelEn="Location/Municipality License" labelAr="رخصة الموقع/البلدية" file={licenseFile} onChange={setLicenseFile} required />
              <UploadField labelEn="National Address Certificate" labelAr="العنوان الوطني" file={addressFile} onChange={setAddressFile} required />
              <UploadField labelEn="Bank Account / IBAN Document" labelAr="وثيقة الحساب البنكي / الآيبان" file={bankFile} onChange={setBankFile} required />
            </div>
          </section>

          {/* Section 4: Additional Info */}
          <section>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Tell us about your studio..." ar="أخبرنا عن استوديوك..." /></label>
              <textarea className="input" style={{ minHeight: 100, paddingTop: 12 }} maxLength={500} placeholder="..." value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
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

function UploadField({ labelEn, labelAr, file, onChange, required, optional }: any) {
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
