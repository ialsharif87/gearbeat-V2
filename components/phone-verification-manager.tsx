"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "./t";

interface PhoneVerificationManagerProps {
  phone: string;
  isVerified: boolean;
}

export default function PhoneVerificationManager({ phone, isVerified }: PhoneVerificationManagerProps) {
  const [step, setStep] = useState<"idle" | "requesting" | "verifying" | "success">("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = async () => {
    setError(null);
    setStep("requesting");
    try {
      const { error } = await supabase.auth.updateUser({ phone });
      if (error) throw error;
      setStep("verifying");
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. SMS provider may not be configured.");
      setStep("idle");
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    setStep("requesting"); // Reuse requesting for loading state
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "phone_change",
      });
      if (error) throw error;
      setStep("success");
      window.location.reload(); // Refresh to update server-side state
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
      setStep("verifying");
    }
  };

  if (isVerified) return null;

  return (
    <div className="phone-verification-box animate-fade-in" style={{ 
      marginTop: '12px', 
      padding: '16px', 
      background: 'rgba(212, 175, 55, 0.05)', 
      border: '1px solid rgba(212, 175, 55, 0.2)', 
      borderRadius: '12px' 
    }}>
      {step === "idle" && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gb-gold)' }}>
            <T en="Your phone is not verified. Verify now to secure your account." ar="رقم جوالك غير موثق. وثقه الآن لتأمين حسابك." />
          </p>
          <button 
            type="button"
            className="btn btn-sm btn-gold" 
            onClick={handleSendOTP}
          >
            <T en="Send OTP" ar="إرسال الرمز" />
          </button>
        </div>
      )}

      {(step === "requesting" || step === "verifying") && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gb-gold)' }}>
            <T en="Enter the 6-digit code sent to your phone" ar="أدخل الرمز المكون من 6 أرقام المرسل لجوالك" />
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="gb-input" 
              placeholder="000000" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ textAlign: 'center', letterSpacing: '4px', flex: 1 }}
            />
            <button 
              type="button"
              className="btn btn-gold" 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || step === "requesting"}
            >
              <T en="Verify" ar="تحقق" />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="button"
              className="text-btn" 
              style={{ fontSize: '0.75rem' }}
              onClick={handleSendOTP}
              disabled={cooldown > 0 || step === "requesting"}
            >
              {cooldown > 0 ? (
                <T en={`Resend in ${cooldown}s`} ar={`إعادة الإرسال خلال ${cooldown}ث`} />
              ) : (
                <T en="Resend Code" ar="إعادة إرسال الرمز" />
              )}
            </button>
            <button 
              type="button"
              className="text-btn" 
              style={{ fontSize: '0.75rem' }}
              onClick={() => setStep("idle")}
            >
              <T en="Cancel" ar="إلغاء" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#ff4d4d', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {step === "success" && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#4caf50', textAlign: 'center' }}>
          ✓ <T en="Phone verified successfully!" ar="تم توثيق الجوال بنجاح!" />
        </p>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .btn-gold {
          background: var(--gb-gold);
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .btn-gold:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 0.75rem;
        }
        .gb-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--gb-border);
          border-radius: 8px;
          color: #fff;
          padding: 8px;
        }
        .text-btn {
          background: none;
          border: none;
          color: var(--gb-gold);
          cursor: pointer;
          font-size: 0.85rem;
        }
        .text-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,
        }}
      />
    </div>
  );
}
