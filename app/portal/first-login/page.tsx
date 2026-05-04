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
        .eq("auth_user_id", user.id)
        .single();
      
      setRole(profile?.role || "vendor");
    }
    getUser();
  }, [router, supabase]);

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

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(filePath, contractFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("provider-documents")
        .getPublicUrl(filePath);
      
      const uploadedUrl = urlData.publicUrl;

      // 2. Update provider_leads
      const { error: leadError } = await supabase
        .from("provider_leads")
        .update({
          signed_contract_url: uploadedUrl,
          status: "approved",
          approved_at: new Date().toISOString()
        })
        .eq("email", user.email);

      if (leadError) throw leadError;

      // 3. Update profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ account_status: "active" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 4. Redirect
      router.push(role === "vendor" ? "/portal/store" : "/portal/studio");
    } catch (err: any) {
      setError(err.message || "Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        {/* Progress Bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 1 ? "#cfa86e" : "#222" }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? "#cfa86e" : "#222" }} />
        </div>

        <div className="card" style={{ background: "#111", borderRadius: 24, border: "1px solid #1e1e1e", padding: 40 }}>
          {step === 1 ? (
            <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "1.8rem", marginBottom: 12 }}>
                  <T en="Set Your Password" ar="تعيين كلمة المرور" />
                </h1>
                <p style={{ color: "#888", fontSize: "0.95rem" }}>
                  <T en="Please set a new password to secure your account." ar="يرجى تعيين كلمة مرور جديدة لحماية حسابك." />
                </p>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#666" }}><T en="New Password" ar="كلمة المرور الجديدة" /></label>
                <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#666" }}><T en="Confirm Password" ar="تأكيد كلمة المرور" /></label>
                <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
              </div>

              {error && <p style={{ color: "#ff4d4d", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}

              <button className="btn btn-primary" style={{ height: 54, borderRadius: 12, fontWeight: 700 }} disabled={loading}>
                {loading ? "..." : <T en="Continue" ar="متابعة" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleContractUpload} style={{ display: "grid", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "1.8rem", marginBottom: 12 }}>
                  <T en="Sign & Upload Contract" ar="وقّع وارفع العقد" />
                </h1>
                <p style={{ color: "#888", fontSize: "0.95rem" }}>
                  <T en="Download the contract, sign it, and upload the signed copy." ar="حمّل العقد ووقّعه وارفع النسخة الموقعة." />
                </p>
              </div>

              <a 
                href={role === "vendor" ? "/contracts/seller-agreement.pdf" : "/contracts/studio-agreement.pdf"} 
                download 
                className="btn btn-secondary" 
                style={{ height: 50, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.9rem" }}
              >
                <T en="Download Contract Template" ar="تحميل نموذج العقد" />
              </a>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#666" }}><T en="Upload Signed Contract" ar="ارفع العقد الموقع" /></label>
                <div style={{ border: "2px dashed #333", borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer", position: "relative" }}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={(e) => setContractFile(e.target.files?.[0] || null)} required />
                  <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📎</div>
                  <div style={{ fontSize: "0.85rem", color: contractFile ? "#22c55e" : "#888", fontWeight: contractFile ? 700 : 400 }}>
                    {contractFile ? contractFile.name : <T en="Click to upload signed contract" ar="اضغط لرفع العقد الموقع" />}
                  </div>
                </div>
              </div>

              {error && <p style={{ color: "#ff4d4d", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}

              <button className="btn btn-primary" style={{ height: 54, borderRadius: 12, fontWeight: 700 }} disabled={loading}>
                {loading ? "..." : <T en="Submit & Enter Portal" ar="إرسال والدخول للبوابة" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
