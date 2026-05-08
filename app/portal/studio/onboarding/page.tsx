"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { CountryOption } from "@/lib/countries";
import { CityOption } from "@/lib/locations";

export default function StudioOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    type: "Recording Studio",
    city: "",
    district: "",
    address: "",
    crNumber: "",
    vatNumber: "",
    nationalAddress: "",
    iban: "",
    bankName: "",
    hourlyRate: "",
    minHours: "1",
    capacity: "",
    descriptionEn: "",
    descriptionAr: "",
    cancellationPolicy: "",
    agreed: false
  });

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [country, setCountry] = useState("SA");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });

    fetch("/api/countries")
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        setFetchingLocations(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!country) return;
    setFetchingLocations(true);
    fetch(`/api/cities?country=${country}`)
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setFetchingLocations(false);
      });
  }, [country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("studios").insert({
        owner_auth_user_id: userId,
        name_en: formData.nameEn,
        name_ar: formData.nameAr,
        name: formData.nameEn, // Fallback
        type: formData.type,
        country: countries.find(c => c.country_code === country)?.name_en || country,
        city: cities.find(c => c.id === formData.city)?.name_en || formData.city,
        city_name: cities.find(c => c.id === formData.city)?.name_en || formData.city,
        district: formData.district,
        address_line: formData.address,
        description_en: formData.descriptionEn,
        description_ar: formData.descriptionAr,
        price_from: Number(formData.hourlyRate),
        hourly_rate: Number(formData.hourlyRate),
        min_booking_hours: Number(formData.minHours),
        capacity: Number(formData.capacity),
        cancellation_policy: formData.cancellationPolicy,
        cr_number: formData.crNumber,
        vat_number: formData.vatNumber,
        iban: formData.iban,
        bank_name: formData.bankName,
        status: "pending",
        verified: false,
        booking_enabled: false
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Onboarding error:", err);
      alert("Failed to submit onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="gb-dashboard-page container" style={{ maxWidth: 800, margin: "60px auto", textAlign: "center" }}>
        <div className="gb-card" style={{ padding: 60 }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
            <T en="Onboarding Submitted!" ar="تم إرسال طلب الانضمام!" />
          </h2>
          <p className="gb-muted-text" style={{ marginTop: 16, fontSize: "1.1rem" }}>
            <T 
              en="Your studio has been submitted. We will review and approve within 2 business days." 
              ar="تم إرسال استوديوك. سنراجع ونوافق خلال يومي عمل." 
            />
          </p>
          <div style={{ marginTop: 40 }}>
            <a href="/portal/studio" className="gb-button gb-button-primary">
              <T en="Go to Dashboard" ar="الذهاب للوحة التحكم" />
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="gb-dashboard-page container" style={{ maxWidth: 800, margin: "40px auto" }}>
      <section className="gb-dashboard-header" style={{ textAlign: "center", marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}><T en="Studio Onboarding" ar="انضمام الاستوديو" /></h1>
          <p className="gb-muted-text"><T en="Complete your profile to start receiving bookings." ar="أكمل ملفك الشخصي للبدء في استقبال الحجوزات." /></p>
        </div>
      </section>

      {/* Progress Bar */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: "0.9rem", fontWeight: 800, color: 'white' }}>
          <span><T en={`Step ${step} of 4`} ar={`الخطوة ${step} من 4`} /></span>
          <span style={{ color: 'var(--gb-gold)' }}>{Math.round((step / 4) * 100)}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", border: '1px solid var(--gb-border)' }}>
          <div style={{ width: `${(step / 4) * 100}%`, height: "100%", background: "var(--gb-gold)", transition: "0.5s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: '0 0 15px var(--gb-gold-glow)' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="gb-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 800 }}><T en="Basic Information" ar="المعلومات الأساسية" /></h2>
            
            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Studio Name (English)" ar="اسم الاستوديو (إنجليزي)" /> *</label>
              <input className="gb-input" name="nameEn" value={formData.nameEn} onChange={handleChange} required />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Studio Name (Arabic)" ar="اسم الاستوديو (عربي)" /> *</label>
              <input className="gb-input" name="nameAr" value={formData.nameAr} onChange={handleChange} required />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Studio Type" ar="نوع الاستوديو" /></label>
              <select className="gb-input" name="type" value={formData.type} onChange={handleChange}>
                <option>Recording Studio</option>
                <option>Podcast Studio</option>
                <option>Voiceover Studio</option>
                <option>Music Training Room</option>
                <option>Creative Space</option>
              </select>
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Country" ar="الدولة" /></label>
              <select className="gb-input" value={country} onChange={(e) => { setCountry(e.target.value); setFormData(prev => ({ ...prev, city: "" })); }}>
                {countries.map(c => (
                  <option key={c.country_code} value={c.country_code}>{c.name_en} / {c.name_ar}</option>
                ))}
              </select>
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="City" ar="المدينة" /></label>
              {fetchingLocations ? (
                <div className="gb-input" style={{ opacity: 0.5 }}>Loading...</div>
              ) : cities.length > 0 ? (
                <select className="gb-input" name="city" value={formData.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name_en} / {c.name_ar}</option>
                  ))}
                </select>
              ) : (
                <input className="gb-input" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city name" />
              )}
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="District" ar="الحي" /></label>
              <input className="gb-input" name="district" value={formData.district} onChange={handleChange} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Address" ar="العنوان" /></label>
              <input className="gb-input" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
              <button type="button" className="gb-button gb-button-primary" onClick={nextStep} disabled={!formData.nameEn || !formData.nameAr}>
                <T en="Next Step" ar="الخطوة التالية" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="gb-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 800 }}><T en="Business Documents" ar="مستندات العمل" /></h2>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Commercial Registration Number" ar="رقم السجل التجاري" /> *</label>
              <input className="gb-input" name="crNumber" value={formData.crNumber} onChange={handleChange} required />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="VAT Number (Optional)" ar="الرقم الضريبي (اختياري)" /></label>
              <input className="gb-input" name="vatNumber" value={formData.vatNumber} onChange={handleChange} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="National Address" ar="العنوان الوطني" /></label>
              <input className="gb-input" name="nationalAddress" value={formData.nationalAddress} onChange={handleChange} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="IBAN" ar="رقم الآيبان" /> *</label>
              <input className="gb-input" name="iban" value={formData.iban} onChange={handleChange} placeholder="SA..." required />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Bank Name" ar="اسم البنك" /> *</label>
              <input className="gb-input" name="bankName" value={formData.bankName} onChange={handleChange} required />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
              <button type="button" className="gb-button gb-button-outline" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="button" className="gb-button gb-button-primary" onClick={nextStep} disabled={!formData.crNumber || !formData.iban || !formData.bankName}>
                <T en="Next Step" ar="الخطوة التالية" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="gb-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 800 }}><T en="Studio Details" ar="تفاصيل الاستوديو" /></h2>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Hourly Rate (SAR)" ar="سعر الساعة (ريال)" /> *</label>
              <input className="gb-input" type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} required />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Minimum Booking Hours" ar="الحد الأدنى لساعات الحجز" /></label>
              <input className="gb-input" type="number" name="minHours" value={formData.minHours} onChange={handleChange} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Capacity (Persons)" ar="السعة (أشخاص)" /></label>
              <input className="gb-input" type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Description (English)" ar="الوصف (إنجليزي)" /></label>
              <textarea className="gb-input" name="descriptionEn" rows={4} value={formData.descriptionEn} onChange={handleChange} style={{ height: 'auto' }} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Description (Arabic)" ar="الوصف (عربي)" /></label>
              <textarea className="gb-input" name="descriptionAr" rows={4} value={formData.descriptionAr} onChange={handleChange} style={{ height: 'auto' }} />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Cancellation Policy" ar="سياسة الإلغاء" /></label>
              <textarea className="gb-input" name="cancellationPolicy" rows={3} value={formData.cancellationPolicy} onChange={handleChange} style={{ height: 'auto' }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
              <button type="button" className="gb-button gb-button-outline" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="button" className="gb-button gb-button-primary" onClick={nextStep} disabled={!formData.hourlyRate}>
                <T en="Next Step" ar="الخطوة التالية" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="gb-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 800 }}><T en="Review & Submit" ar="المراجعة والإرسال" /></h2>
            
            <div style={{ display: "grid", gap: 20, background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, marginBottom: 32, border: '1px solid var(--gb-border)' }}>
              <div><strong className="gb-detail-label"><T en="Studio:" ar="الاستوديو:" /></strong> <span style={{ color: 'white' }}>{formData.nameEn} / {formData.nameAr}</span></div>
              <div><strong className="gb-detail-label"><T en="Type:" ar="النوع:" /></strong> <span style={{ color: 'white' }}>{formData.type}</span></div>
              <div><strong className="gb-detail-label"><T en="Location:" ar="الموقع:" /></strong> <span style={{ color: 'white' }}>{formData.district}, {formData.city}</span></div>
              <div><strong className="gb-detail-label"><T en="Price:" ar="السعر:" /></strong> <span style={{ color: 'white' }}>{formData.hourlyRate} SAR / <T en="hour" ar="ساعة" /></span></div>
              <div><strong className="gb-detail-label"><T en="IBAN:" ar="الآيبان:" /></strong> <span style={{ color: 'white' }}>{formData.iban}</span></div>
            </div>

            <label style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "12px 0", color: 'white' }}>
              <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} style={{ width: 20, height: 20, accentColor: 'var(--gb-gold)' }} />
              <span style={{ fontWeight: 700 }}><T en="I agree to GearBeat Studio Agreement" ar="أوافق على اتفاقية استوديو GearBeat" /></span>
            </label>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40 }}>
              <button type="button" className="gb-button gb-button-outline" onClick={prevStep}><T en="Back" ar="السابق" /></button>
              <button type="submit" className="gb-button gb-button-primary" style={{ minWidth: '200px', justifyContent: 'center' }} disabled={!formData.agreed || loading}>
                {loading ? <T en="Submitting..." ar="جاري الإرسال..." /> : <T en="Submit for Review" ar="إرسال للمراجعة" />}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
