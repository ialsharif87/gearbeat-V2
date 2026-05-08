"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

import { approveStudioApplication, requestLeadUpdate, rejectLeadApplication, getLeadOrApplicationDetail, giveFinalApproval, getSignedContractAction } from "../actions";

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);
  const [studioApp, setStudioApp] = useState<any>(null);
  const [contractDraft, setContractDraft] = useState("");
  const [signedContractUrl, setSignedContractUrl] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states for boxes
  const [updateMessage, setUpdateMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const { lead: leadData, studioApp: appData } = await getLeadOrApplicationDetail(id as string);

      if (leadData) {
        setLead(leadData);
        if (appData) {
          setStudioApp(appData);
          setContractDraft(appData.contract_draft || getDefaultContract(appData, leadData));

          // NEW: Fetch signed contract URL if path exists
          if (appData.contract_url) {
            setLinkError(false);
            getSignedContractAction(appData.contract_url).then(res => {
              if (res.success && res.url) {
                setSignedContractUrl(res.url);
              } else {
                setLinkError(true);
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  function getDefaultContract(app: any, lead: any) {
    return `STUDIO MANAGEMENT AGREEMENT

Company: ${app?.company_name_en || lead?.full_name || "N/A"}
Registration: ${app?.commercial_registration || "N/A"}
VAT: ${app?.vat_number || "N/A"}

This agreement is made between GearBeat and the Company to manage studios on the platform.
Commission Rate: 15%
Studio Limit: 1
... [Rest of contract terms]`;
  }

  async function handleApprove() {
    if (!confirm("Are you sure? This will create a user and send the contract email.")) return;
    setActionLoading("approve");
    try {
      if (studioApp) {
        const result = await approveStudioApplication(studioApp.id, 15, 1, contractDraft);
        if (result.success) {
          alert(`Studio Owner Approved!\n\nCredentials sent to client.\nTemporary Password: ${result.tempPassword}`);
          router.refresh();
        } else {
          alert("Error: " + result.error);
        }
      }
      fetchData();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRequestUpdate() {
    if (!updateMessage) return alert("Please enter the missing requirements.");
    setActionLoading("update");
    try {
      await requestLeadUpdate(id as string, updateMessage);
      alert("Modification request sent to client.");
      fetchData();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectionReason) return alert("Please enter a reason.");
    setActionLoading("reject");
    try {
      await rejectLeadApplication(id as string, rejectionReason);
      alert("Application Rejected.");
      fetchData();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("DANGER: This will permanently delete the application. Continue?")) return;
    setActionLoading("delete");
    const supabase = createClient();
    await supabase.from("provider_leads").delete().eq("id", id);
    if (studioApp) await supabase.from("studio_applications").delete().eq("id", studioApp.id);
    router.push("/admin/leads");
  }

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: '#888' }}>Loading...</div>;

  if (!lead) {
    return (
      <main style={{ padding: 100, textAlign: 'center', color: '#fff' }}>
        <h2>Application Not Found</h2>
        <p style={{ color: '#666' }}>The requested application ID does not exist in the database.</p>
        <Link href="/admin/leads" style={{ color: '#cfa86e', marginTop: 20, display: 'inline-block' }}>Return to List</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/leads" style={{ color: '#888', textDecoration: 'none' }}>← Back to List</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{studioApp?.company_name_en || lead?.full_name}</h1>
            <p style={{ color: '#666', marginTop: 8 }}>{lead?.email} • {lead?.phone}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.8rem', color: '#444' }}>Status</div>
             <span style={{ 
               padding: '4px 16px', borderRadius: 99, fontWeight: 900, fontSize: '0.9rem',
               background: lead?.status === 'approved' ? '#22c55e' : '#eab308', color: '#000'
             }}>
               {lead?.status?.toUpperCase()}
             </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>
        {/* Left Column: Data */}
        <div style={{ display: 'grid', gap: 32 }}>
          <section className="admin-section">
            <h3 style={sectionTitleStyle}><T en="General Information" ar="معلومات عامة" /></h3>
            <div style={dataGridStyle}>
              <DataItem label={<T en="Full Name" ar="الاسم الكامل" />} value={lead.full_name} />
              <DataItem label={<T en="Applied At" ar="تاريخ التقديم" />} value={new Date(lead.created_at).toLocaleString()} />
              <DataItem label={<T en="City / Country" ar="المدينة / الدولة" />} value={`${lead.city || '—'} / ${studioApp?.country || '—'}`} />
              <DataItem label={<T en="Planned Studios" ar="الاستوديوهات المخطط لها" />} value={studioApp?.planned_studios_count || 1} />
            </div>
          </section>

          {studioApp && (
            <section className="admin-section">
              <h3 style={sectionTitleStyle}><T en="Business Details" ar="تفاصيل العمل" /></h3>
              <div style={dataGridStyle}>
                <DataItem label={<T en="Company (AR)" ar="اسم الشركة (عربي)" />} value={studioApp.company_name_ar} />
                <DataItem label={<T en="Company (EN)" ar="اسم الشركة (إنجليزي)" />} value={studioApp.company_name_en} />
                <DataItem label={<T en="CR Number" ar="رقم السجل التجاري" />} value={studioApp.commercial_registration} />
                <DataItem label={<T en="VAT Number" ar="الرقم الضريبي" />} value={studioApp.vat_number} />
              </div>
            </section>
          )}

          <section className="admin-section">
            <h3 style={sectionTitleStyle}><T en="Uploaded Documents" ar="المستندات المرفوعة" /></h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DocCard label={<T en="Commercial Reg." ar="السجل التجاري" />} url={studioApp?.cr_document_url} />
              <DocCard label={<T en="VAT Certificate" ar="شهادة ضريبة القيمة المضافة" />} url={studioApp?.vat_certificate_url} />
              <DocCard label={<T en="National Address" ar="العنوان الوطني" />} url={studioApp?.national_address_url} />
              <DocCard label={<T en="Bank Screenshot" ar="إثبات الحساب البنكي" />} url={studioApp?.bank_document_url} />
            </div>
          </section>

          <section className="admin-section">
            <h3 style={sectionTitleStyle}><T en="About the Company" ar="عن الشركة" /></h3>
            <p style={{ color: '#aaa', lineHeight: 1.6, background: '#111', padding: 20, borderRadius: 12 }}>
              {studioApp?.about_company || <T en="No description provided." ar="لا يوجد وصف مقدم." />}
            </p>
          </section>
        </div>

        {/* Right Column: Contract Draft */}
        <div>
          <div style={{ position: 'sticky', top: 40 }}>
            <h3 style={sectionTitleStyle}><T en="Internal Contract Reference" ar="مرجع العقد الداخلي" /></h3>
            <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 12 }}>
              <T en="Review terms for the standard agreement." ar="راجع شروط الاتفاقية القياسية." />
            </p>
            <div 
              style={{ 
                width: '100%', minHeight: 500, background: '#050505', border: '1px solid #222',
                borderRadius: 12, color: '#666', padding: 20, fontSize: '0.85rem', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', overflowY: 'auto'
              }}
            >
              {contractDraft}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#444', marginTop: 12, fontStyle: 'italic' }}>
              * Note: Owners currently sign the standard GearBeat Studio Agreement PDF. Custom term persistence requires a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Action Boxes */}
      <div style={{ marginTop: 60, borderTop: '1px solid #1a1a1a', paddingTop: 60 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 40 }}><T en="Management Actions" ar="إجراءات الإدارة" /></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {/* NEW: Final Activation Box */}
          {studioApp?.contract_url && !studioApp?.final_approved_at && (
            <div style={{ ...boxStyle, border: '1px solid #D4AF37', background: 'rgba(212, 175, 55, 0.08)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ color: '#D4AF37', margin: 0, fontSize: '1.2rem' }}><T en="Final Activation Required" ar="مطلوب التفعيل النهائي" /></h4>
                {signedContractUrl ? (
                  <a href={signedContractUrl} target="_blank" style={{ color: '#fff', fontSize: '0.8rem', textDecoration: 'underline' }}>
                    <T en="View Signed Contract" ar="عرض العقد الموقع" />
                  </a>
                ) : linkError ? (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                    <T 
                      en="Unable to generate a secure contract link. Please re-upload the signed contract." 
                      ar="تعذر إنشاء رابط عقد آمن. يرجى إعادة رفع العقد الموقع." 
                    />
                  </span>
                ) : (
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    <T en="Generating access link..." ar="جاري إنشاء رابط الوصول..." />
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#ccc', margin: '8px 0 16px' }}>
                <T en="The client has uploaded the signed contract. Review it and click below to grant full dashboard access and move to the Approved Partners list." ar="قام العميل برفع العقد الموقع. يرجى مراجعته والضغط أدناه لمنح الوصول الكامل للوحة التحكم والنقل إلى قائمة الشركاء المعتمدين." />
              </p>
              <button 
                onClick={async () => {
                  if(!confirm(lead.language === 'ar' ? "هل أنت متأكد من منح الموافقة النهائية وتفعيل هذا الحساب؟" : "Grant final approval and activate this account?")) return;
                  setActionLoading("final");
                  const res = await giveFinalApproval(studioApp.id);
                  if(res.success) {
                    alert(lead.language === 'ar' ? "تم تفعيل الحساب! الشريك لديه الآن وصول كامل." : "Account Activated! The partner now has full access.");
                    fetchData();
                  }
                  setActionLoading(null);
                }}
                disabled={!!actionLoading}
                style={{ ...btnStyle, background: '#D4AF37', color: '#000', width: '100%' }}
              >
                {actionLoading === 'final' ? (lead.language === 'ar' ? 'جاري التفعيل...' : 'Activating...') : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    ✅ <T en="Confirm & Activate Account" ar="تأكيد وتفعيل الحساب" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Box 1: Approve */}
          <div style={{ ...boxStyle, border: '1px solid #22c55e33', background: '#22c55e05' }}>
            <h4 style={{ color: '#22c55e', margin: '0 0 12px 0' }}><T en="Approve & Send Contract" ar="موافقة وإرسال العقد" /></h4>
            <p style={{ fontSize: '0.85rem', color: '#666', flex: 1 }}>
              <T en="Creates credentials, sends welcome email with temp password, and attaches the modified contract draft." ar="ينشئ بيانات الاعتماد، ويرسل بريد الترحيب مع كلمة مرور مؤقتة، ويرفق مسودة العقد المعدلة." />
            </p>
            <button 
              onClick={handleApprove}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#22c55e', color: '#000' }}
            >
              {actionLoading === 'approve' ? (lead.language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : <T en="Approve & Send" ar="موافقة وإرسال" />}
            </button>
          </div>

          {/* Box 2: Update Request */}
          <div style={{ ...boxStyle, border: '1px solid #eab30833', background: '#eab30805' }}>
            <h4 style={{ color: '#eab308', margin: '0 0 12px 0' }}><T en="Request Modification" ar="طلب تعديل" /></h4>
            <textarea 
              placeholder={lead.language === 'ar' ? "مثال: ملف السجل التجاري غير واضح، يرجى إعادة الرفع..." : "e.g. CR file is blurry, please re-upload..."}
              style={boxInputStyle}
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
            />
            <button 
              onClick={handleRequestUpdate}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#eab308', color: '#000' }}
            >
              {actionLoading === 'update' ? (lead.language === 'ar' ? 'جاري الطلب...' : 'Requesting...') : <T en="Request Update" ar="طلب تعديل" />}
            </button>
          </div>

          {/* Box 3: Reject */}
          <div style={{ ...boxStyle, border: '1px solid #ef444433', background: '#ef444405' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 12px 0' }}><T en="Reject Application" ar="رفض الطلب" /></h4>
            <textarea 
              placeholder={lead.language === 'ar' ? "سبب الرفض..." : "Reason for rejection..."}
              style={boxInputStyle}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <button 
              onClick={handleReject}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}
            >
              {actionLoading === 'reject' ? (lead.language === 'ar' ? 'جاري الرفض...' : 'Rejecting...') : <T en="Reject & Notify" ar="رفض وإبلاغ" />}
            </button>
          </div>

          {/* Box 4: Delete */}
          <div style={{ ...boxStyle, border: '1px solid #333', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ color: '#888', margin: '0 0 12px 0' }}><T en="Delete Application" ar="حذف الطلب" /></h4>
            <p style={{ fontSize: '0.85rem', color: '#555', flex: 1 }}>
              <T en="Removes all traces from the database. Client will not be notified. Use with caution." ar="يزيل كل أثر من قاعدة البيانات. لن يتم إبلاغ العميل. استخدم بحذر." />
            </p>
            <button 
              onClick={handleDelete}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#222', color: '#fff' }}
            >
              <T en="Delete Permanently" ar="حذف نهائي" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function DataItem({ label, value }: any) {
  return (
    <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: 12 }}>
      <div style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}

function DocCard({ label, url }: any) {
  return (
    <div style={{ background: '#111', border: '1px solid #222', padding: 16, borderRadius: 12 }}>
      <div style={{ fontSize: '0.85rem', marginBottom: 12 }}>{label}</div>
      {url ? (
        <a href={url} target="_blank" style={{ fontSize: '0.75rem', color: '#cfa86e', textDecoration: 'underline' }}>View Document</a>
      ) : (
        <span style={{ fontSize: '0.75rem', color: '#444' }}>Not uploaded</span>
      )}
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = { fontSize: '0.9rem', color: '#cfa86e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 };
const dataGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' };
const boxStyle: React.CSSProperties = { padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 };
const boxInputStyle: React.CSSProperties = { width: '100%', minHeight: 100, background: '#000', border: '1px solid #222', borderRadius: 8, padding: 12, color: '#fff', fontSize: '0.85rem', outline: 'none' };
const btnStyle: React.CSSProperties = { height: 44, borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' };
