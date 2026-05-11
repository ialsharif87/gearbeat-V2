"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { uploadProviderDocumentAction, getSignedDocumentUrlAction } from "@/lib/storage/provider-documents";

export default function StudioContractPage() {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchApplication();
  }, []);

  async function fetchApplication() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("studio_applications")
      .select("*")
      .eq("linked_user_id", user.id)
      .maybeSingle();

    if (!error) {
      setApp(data);
      if (data?.contract_url) {
        setSigning(true);
        setSignError(null);
        getSignedDocumentUrlAction(data.contract_url, data.id).then(res => {
          if (res.success) {
            setSignedUrl(res.url);
          } else {
            setSignError(res.error || "Could not generate secure view link.");
          }
          setSigning(false);
        });
      }
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!file || !app) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProviderDocumentAction(formData, "contracts");
      if (!res.success || !res.path) {
        throw new Error(res.error || "Upload failed");
      }

      const relativePath = res.path;

      const { error: updateError } = await supabase
        .from("studio_applications")
        .update({
          contract_url: relativePath,
          contract_uploaded_at: new Date().toISOString(),
          status: "approved"
        })
        .eq("id", app.id);

      if (updateError) throw updateError;
      
      alert("Contract uploaded successfully. Admin will review it shortly.");
      fetchApplication();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!app) return <div style={{ padding: 40 }}>Application not found.</div>;

  const isFinalApproved = !!app.final_approved_at;
  const isUploaded = !!app.contract_uploaded_at;

  return (
    <main style={{ padding: 40, maxWidth: 800 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 8, color: "#fff" }}>
          <T en="Contract & Activation" ar="العقد والتفعيل" />
        </h1>
        <p style={{ color: "#888" }}>
          <T en="Sign your studio agreement to activate your account." ar="وقع اتفاقية الاستوديو لتفعيل حسابك." />
        </p>
      </div>

      <div className="gb-card" style={{ padding: 40 }}>
        {/* Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid var(--gb-border)" }}>
          <div style={{ fontSize: "2rem" }}>
            {isFinalApproved ? "✅" : isUploaded ? "⏳" : "📜"}
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
              {isFinalApproved ? <T en="Final Approval Granted" ar="تمت الموافقة النهائية" /> :
               isUploaded ? <T en="Contract Under Review" ar="العقد تحت المراجعة" /> :
               <T en="Signature Pending" ar="بانتظار التوقيع" />}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>
              {isFinalApproved ? <T en="You can now add studios to your profile." ar="يمكنك الآن إضافة استوديوهات لملفك." /> :
               isUploaded ? <T en="Admin is verifying your signed contract." ar="الإدارة تقوم بالتحقق من عقدك الموقع." /> :
               <T en="Please download, sign, and upload the standard agreement below." ar="يرجى تحميل العقد القياسي، توقيعه، ورفعه أدناه." />}
            </div>
            {isUploaded && (
              <div style={{ marginTop: 12 }}>
                {signing ? (
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    <T en="Generating secure link..." ar="جاري إنشاء الرابط الآمن..." />
                  </span>
                ) : signedUrl ? (
                  <a 
                    href={signedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '0.85rem', color: 'var(--gb-teal)', textDecoration: 'underline', fontWeight: 700 }}
                  >
                    <T en="View Uploaded Contract" ar="عرض العقد المرفوع" />
                  </a>
                ) : signError ? (
                  <span style={{ fontSize: '0.8rem', color: '#ef444499' }}>
                    {signError}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {!isFinalApproved && (
          <div style={{ display: "grid", gap: 32 }}>
            <section>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--gb-gold)" }}>
                <T en="1. Download Contract" ar="١. تحميل العقد" />
              </h3>
              <a 
                href="/legal/terms" 
                target="_blank" 
                className="gb-button gb-button-outline"
                style={{ display: "inline-flex", gap: 12, alignItems: "center" }}
              >
                <span>📥</span> <T en="Download Standard Studio Agreement" ar="تحميل اتفاقية الاستوديو القياسية" />
              </a>
            </section>

            <section>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--gb-gold)" }}>
                <T en="2. Upload Signed Copy" ar="٢. رفع النسخة الموقعة" />
              </h3>
              <div style={{ 
                border: "2px dashed #333", 
                borderRadius: 16, 
                padding: 40, 
                textAlign: "center",
                position: "relative",
                background: "rgba(255,255,255,0.01)"
              }}>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} 
                />
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📤</div>
                <div style={{ fontWeight: 700, color: file ? "var(--gb-teal)" : "#fff" }}>
                  {file ? file.name : <T en="Click to select file" ar="اضغط لاختيار الملف" />}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#555", marginTop: 8 }}>PDF, PNG or JPG (Max 5MB)</div>
              </div>

              <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className="gb-button gb-button-primary" 
                style={{ width: "100%", marginTop: 24, justifyContent: "center", height: 54 }}
              >
                {uploading ? "..." : <T en="Upload Signed Contract" ar="رفع العقد الموقع" />}
              </button>
            </section>
          </div>
        )}

        {isFinalApproved && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Link href="/portal/studio/studios" className="gb-button gb-button-primary" style={{ padding: "0 40px" }}>
              <T en="Go to My Studios" ar="انتقل لاستوديوهاتي" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
