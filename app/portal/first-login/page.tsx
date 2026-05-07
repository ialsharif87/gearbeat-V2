"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { useRouter } from "next/navigation";

export default function FirstLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // Step 1: Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Contract
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/portal/login");
        return;
      }
      setUser(user);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      
      setRole(profile?.role || "owner");
    }
    getUser();
  }, [router, supabase]);

  async function downloadContract() {
    try {
      setContractLoading(true);
      setContractError(null);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .maybeSingle();
  
      const { data: lead } = await supabase
        .from('provider_leads')
        .select('business_name, business_name_ar, phone, city, commission_percent')
        .eq('email', user.email)
        .maybeSingle();
  
      const contractData = {
        type: profile?.role === 'owner' ? 'studio' : 'seller',
        sellerNameAr: profile?.full_name || 'المزود',
        sellerNameEn: profile?.full_name || 'Provider',
        companyNameAr: lead?.business_name_ar || lead?.business_name || 'الشركة',
        companyNameEn: lead?.business_name || 'Company',
        email: user.email || '',
        phone: lead?.phone || '',
        city: lead?.city || 'الرياض',
        commissionPercent: lead?.commission_percent || 15,
        contractDate: new Date().toLocaleDateString('ar-SA'),
      };
  
      const response = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      });
  
      if (!response.ok) throw new Error('API error: ' + response.status);
  
      const html = await response.text();
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write(html);
        newTab.document.close();
      } else {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'GearBeat-Contract.html';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Contract download error:', error);
      setContractError('فشل تحميل العقد. حاول مجدداً.');
    } finally {
      setContractLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContractUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!contractFile) {
      setError("Please upload the signed contract.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const ext = contractFile.name.split('.').pop();
      const filePath = `contracts/${user.id}-signed-contract-${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(filePath, contractFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("provider-documents")
        .getPublicUrl(filePath);
      
      const uploadedUrl = urlData.publicUrl;

      await supabase
        .from("provider_leads")
        .update({
          signed_contract_url: uploadedUrl,
          status: "approved",
          approved_at: new Date().toISOString()
        })
        .eq("email", user.email);

      await supabase
        .from("profiles")
        .update({ account_status: "active" })
        .eq("id", user.id);

      router.push(role === "vendor" ? "/portal/store" : "/portal/studio");
    } catch (err: any) {
      setError(err.message || "Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="onboarding-root">
      <div className="onboarding-overlay"></div>
      
      <div className="onboarding-container">
        <header className="onboarding-header">
          <div className="brand-logo">GearBeat</div>
          <div className="progress-container">
            <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
          </div>
          <div className="step-label">
            {step === 1 ? (
              <T en="STEP 1: SECURE ACCOUNT" ar="الخطوة 1: تأمين الحساب" />
            ) : (
              <T en="STEP 2: SIGN CONTRACT" ar="الخطوة 2: توقيع العقد" />
            )}
          </div>
        </header>

        <section className="onboarding-card">
          {step === 1 ? (
            <form onSubmit={handlePasswordChange} className="onboarding-form">
              <div className="card-intro">
                <h1><T en="Set Password" ar="تعيين كلمة المرور" /></h1>
                <p><T en="Secure your dashboard with a strong password." ar="قم بتأمين لوحة التحكم الخاصة بك بكلمة مرور قوية." /></p>
              </div>

              <div className="input-group">
                <label><T en="New Password" ar="كلمة المرور الجديدة" /></label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="••••••••" />
              </div>

              <div className="input-group">
                <label><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} placeholder="••••••••" />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="submit-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : <T en="Next Step" ar="الخطوة التالية" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleContractUpload} className="onboarding-form">
              <div className="card-intro">
                <h1><T en="Partnership Agreement" ar="اتفاقية الشراكة" /></h1>
                <p><T en="Review, sign, and upload your contract to activate your account." ar="راجع، وقّع، وارفع عقدك لتفعيل حسابك." /></p>
              </div>

              <button 
                type="button"
                onClick={downloadContract}
                disabled={contractLoading}
                className="action-btn-secondary"
              >
                {contractLoading ? "..." : <><span className="icon">📄</span> <T en="Download Contract" ar="تحميل العقد" /></>}
              </button>
              
              {contractError && <p className="error-small">{contractError}</p>}

              <div className="upload-zone">
                <label><T en="Upload Signed Copy" ar="ارفع النسخة الموقعة" /></label>
                <div className={`drop-box ${contractFile ? 'has-file' : ''}`}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setContractFile(e.target.files?.[0] || null)} required />
                  <div className="box-content">
                    <span className="box-icon">{contractFile ? '✅' : '📤'}</span>
                    <p>{contractFile ? contractFile.name : <T en="Drag or click to upload PDF/Image" ar="اسحب أو اضغط لرفع ملف PDF أو صورة" />}</p>
                  </div>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="submit-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : <T en="Complete & Enter Portal" ar="إكمال والدخول للبوابة" />}
              </button>
            </form>
          )}
        </section>
      </div>

      <style jsx global>{`
        .onboarding-root {
          min-height: 100vh;
          background: #080706;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .onboarding-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 80% 10%, rgba(212, 175, 55, 0.05) 0%, transparent 40%);
          pointer-events: none;
        }

        .onboarding-container {
          width: 100%;
          max-width: 520px;
          z-index: 10;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .brand-logo {
          font-size: 1.8rem;
          font-weight: 900;
          color: #D4AF37;
          margin-bottom: 32px;
          letter-spacing: -1px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #222;
          transition: all 0.4s;
        }

        .progress-dot.active {
          background: #D4AF37;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
        }

        .progress-line {
          width: 60px;
          height: 2px;
          background: #222;
          transition: all 0.4s;
        }

        .progress-line.active {
          background: #D4AF37;
        }

        .step-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #666;
          letter-spacing: 1px;
        }

        .onboarding-card {
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
        }

        .card-intro {
          text-align: center;
          margin-bottom: 40px;
        }

        .card-intro h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .card-intro p {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .onboarding-form {
          display: grid;
          gap: 28px;
        }

        .input-group {
          display: grid;
          gap: 10px;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 16px 20px;
          border-radius: 16px;
          font-size: 1rem;
          width: 100%;
          outline: none;
          transition: all 0.2s;
        }

        .input-group input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
        }

        .submit-btn {
          height: 60px;
          background: #D4AF37;
          color: #000;
          border: none;
          border-radius: 18px;
          font-size: 1.05rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(212, 175, 55, 0.4);
        }

        .action-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .action-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-zone {
          display: grid;
          gap: 12px;
        }

        .upload-zone label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
        }

        .drop-box {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px 20px;
          text-align: center;
          position: relative;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.02);
        }

        .drop-box:hover {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.05);
        }

        .drop-box.has-file {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .drop-box input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .box-icon {
          font-size: 2rem;
          margin-bottom: 12px;
          display: block;
        }

        .box-content p {
          font-size: 0.9rem;
          color: #888;
        }

        .error-msg {
          color: #ff6b6b;
          font-size: 0.85rem;
          text-align: center;
          background: rgba(255, 107, 107, 0.1);
          padding: 10px;
          border-radius: 12px;
        }

        .loader {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(0,0,0,0.1);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* RTL Handling */
        :global(html[dir="rtl"]) .onboarding-root {
          text-align: right;
          direction: rtl;
        }
      `}</style>
    </main>
  );
}
