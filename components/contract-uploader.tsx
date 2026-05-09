"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import { uploadProviderDocumentAction, getSignedDocumentUrlAction } from "@/lib/storage/provider-documents";

export default function ContractUploader({ appId, currentUrl }: { appId: string, currentUrl?: string }) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(currentUrl);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      getSignedDocumentUrlAction(url).then(res => {
        if (res.success) setSignedUrl(res.url);
      });
    }
  }, [url]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Use secure server action
      const uploadRes = await uploadProviderDocumentAction(formData, "contracts");
      if (!uploadRes.success || !uploadRes.path) {
        throw new Error(uploadRes.error || "Upload failed");
      }

      const relativePath = uploadRes.path;

      // Update database
      // Update studio_applications
      const { error: updateError } = await supabase
        .from("studio_applications")
        .update({ 
          contract_url: relativePath,
          updated_at: new Date().toISOString()
        })
        .eq("id", appId);

      if (updateError) throw updateError;

      // Also update provider_leads for compatibility
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("provider_leads")
          .update({ 
            signed_contract_url: relativePath,
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .eq("email", user.email);
      }

      setUrl(relativePath);
      alert("Contract uploaded successfully! Our team will review it and activate your account.");
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {url ? (
        <div style={{ background: '#22c55e11', border: '1px solid #22c55e33', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 700 }}>
            ✓ <T en="Contract Uploaded" ar="تم رفع العقد بنجاح" />
          </span>
          {signedUrl && (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '0.8rem', textDecoration: 'underline' }}>
              <T en="View File" ar="عرض الملف" />
            </a>
          )}
        </div>
      ) : (
        <label style={{ 
          display: 'block', padding: '40px', border: '2px dashed #333', borderRadius: 16,
          textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s'
        }}>
          <input type="file" onChange={handleUpload} style={{ display: 'none' }} accept=".pdf,image/*" />
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📤</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {uploading ? <T en="Uploading..." ar="جاري الرفع..." /> : <T en="Click to Upload Signed Contract" ar="اضغط لرفع العقد الموقع" />}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#555' }}>PDF, PNG, or JPG (Max 5MB)</div>
        </label>
      )}
    </div>
  );
}

