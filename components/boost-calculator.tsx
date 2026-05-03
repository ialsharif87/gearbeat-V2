"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import T from "./t";

type Props = {
  studioId: string;
  baseRate: number;
  userId: string;
};

export default function BoostCalculator({ studioId, baseRate, userId }: Props) {
  const router = useRouter();
  const [boostAddition, setBoostAddition] = useState(5);
  const [duration, setDuration] = useState(7);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [message, setMessage] = useState("");

  const totalCommission = baseRate + boostAddition;

  async function handleActivate() {
    if (!termsAccepted) return;
    setIsActivating(true);
    setMessage("");

    try {
      const response = await fetch("/api/portal/studios/boost/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId,
          boostAddition,
          duration,
          baseRate,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate boost");
      }

      router.refresh();
    } catch (err) {
      setMessage("Error activating boost. Please try again.");
      setIsActivating(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">
              <T en="Boost Calculator" ar="حاسبة التعزيز" />
            </p>
            <h2>
              <T en="Increase Your Visibility" ar="زد من ظهورك" />
            </h2>
          </div>
        </div>

        <div className="gb-detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
          <div>
            <label className="gb-detail-label" style={{ marginBottom: '12px', display: 'block' }}>
              <T en="Select Boost Addition" ar="اختر إضافة التعزيز" />
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[5, 10, 15].map((val) => (
                <button
                  key={val}
                  onClick={() => setBoostAddition(val)}
                  className={`gb-button ${boostAddition === val ? "" : "gb-button-secondary"}`}
                  style={{ flex: 1 }}
                >
                  +{val}%
                </button>
              ))}
            </div>

            <label className="gb-detail-label" style={{ margin: '24px 0 12px', display: 'block' }}>
              <T en="Duration" ar="المدة" />
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[7, 14, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setDuration(val)}
                  className={`gb-button ${duration === val ? "" : "gb-button-secondary"}`}
                  style={{ flex: 1 }}
                >
                  {val} <T en="Days" ar="أيام" />
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(207, 168, 110, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(207, 168, 110, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="gb-muted-text"><T en="Base Commission" ar="العمولة الأساسية" /></span>
              <strong>{baseRate}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="gb-muted-text"><T en="Boost Addition" ar="إضافة التعزيز" /></span>
              <strong style={{ color: 'var(--gb-gold)' }}>+{boostAddition}%</strong>
            </div>
            <div className="gb-section-divider" style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700 }}><T en="Total Commission" ar="إجمالي العمولة" /></span>
              <strong style={{ fontSize: '2rem', color: 'var(--gb-gold)' }}>{totalCommission}%</strong>
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '16px', color: 'var(--gb-gold)', fontWeight: 600 }}>
              <T en="Higher commission = higher visibility in search results" ar="عمولة أعلى = ظهور أعلى في نتائج البحث" />
            </p>
          </div>
        </div>
      </section>

      <section className="gb-card" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="gb-card-header">
          <h3><T en="Terms and Activation" ar="الشروط والتفعيل" /></h3>
        </div>
        <p className="gb-muted-text" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          <T 
            en="By activating this boost, you agree that the selected commission rate will apply to all bookings made during the boost period. The boost cannot be cancelled once activated. After the period ends, commission returns to the base rate automatically."
            ar="بتفعيل هذا التعزيز، توافق على تطبيق نسبة العمولة المختارة على جميع الحجوزات خلال فترة التعزيز. لا يمكن إلغاء التعزيز بعد التفعيل. بعد انتهاء الفترة، تعود العمولة تلقائياً للنسبة الأساسية."
          />
        </p>
        
        <label style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '20px 0', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={termsAccepted} 
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--gb-gold)' }}
          />
          <span style={{ fontWeight: 600 }}>
            <T en="I agree to the boost terms" ar="أوافق على شروط التعزيز" />
          </span>
        </label>

        <button 
          className="gb-button" 
          style={{ width: '100%', height: '52px' }}
          disabled={!termsAccepted || isActivating}
          onClick={handleActivate}
        >
          {isActivating ? <T en="Activating..." ar="جاري التفعيل..." /> : <T en="Activate Boost" ar="تفعيل التعزيز" />}
        </button>
        {message && <p className="gb-error-text" style={{ marginTop: '12px' }}>{message}</p>}
      </section>
    </div>
  );
}
