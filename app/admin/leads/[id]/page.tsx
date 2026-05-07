"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";

import { approveStudioApplication, requestLeadUpdate, rejectLeadApplication } from "../actions";

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);
  const [studioApp, setStudioApp] = useState<any>(null);
  const [contractDraft, setContractDraft] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states for boxes
  const [updateMessage, setUpdateMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const supabase = createClient();
    
    // 1. Fetch Lead
    const { data: leadData } = await supabase
      .from("provider_leads")
      .select("*")
      .eq("id", id)
      .single();

    if (!leadData) return;
    setLead(leadData);

    // 2. Fetch Studio App (if studio)
    if (leadData.type === "studio") {
      const { data: appData } = await supabase
        .from("studio_applications")
        .select("*")
        .eq("email", leadData.email)
        .single();
      
      setStudioApp(appData);
      
      // Default Contract Draft
      setContractDraft(appData?.contract_draft || `STUDIO MANAGEMENT AGREEMENT

Company: ${appData?.company_name_en || leadData.full_name}
Registration: ${appData?.commercial_registration || "N/A"}
VAT: ${appData?.vat_number || "N/A"}

This agreement is made between GearBeat and the Company to manage studios on the platform.
Commission Rate: 15%
Studio Limit: 1
... [Rest of contract terms]`);
    }

    setLoading(false);
  }

  async function handleApprove() {
    if (!confirm("Are you sure? This will create a user and send the contract email.")) return;
    setActionLoading("approve");
    try {
      if (studioApp) {
        await approveStudioApplication(studioApp.id, 15, 1, contractDraft);
        alert("Studio Owner Approved! Credentials and Contract sent.");
      }
      router.refresh();
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

  return (
    <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/leads" style={{ color: '#888', textDecoration: 'none' }}>← Back to List</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{studioApp?.company_name_en || lead.full_name}</h1>
            <p style={{ color: '#666', marginTop: 8 }}>{lead.email} • {lead.phone}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.8rem', color: '#444' }}>Status</div>
             <span style={{ 
               padding: '4px 16px', borderRadius: 99, fontWeight: 900, fontSize: '0.9rem',
               background: lead.status === 'approved' ? '#22c55e' : '#eab308', color: '#000'
             }}>
               {lead.status.toUpperCase()}
             </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>
        {/* Left Column: Data */}
        <div style={{ display: 'grid', gap: 32 }}>
          <section className="admin-section">
            <h3 style={sectionTitleStyle}>General Information</h3>
            <div style={dataGridStyle}>
              <DataItem label="Full Name" value={lead.full_name} />
              <DataItem label="Applied At" value={new Date(lead.created_at).toLocaleString()} />
              <DataItem label="City / Country" value={`${lead.city || '—'} / ${studioApp?.country || '—'}`} />
              <DataItem label="Planned Studios" value={studioApp?.planned_studios_count || 1} />
            </div>
          </section>

          {studioApp && (
            <section className="admin-section">
              <h3 style={sectionTitleStyle}>Business Details</h3>
              <div style={dataGridStyle}>
                <DataItem label="Company (AR)" value={studioApp.company_name_ar} />
                <DataItem label="Company (EN)" value={studioApp.company_name_en} />
                <DataItem label="CR Number" value={studioApp.commercial_registration} />
                <DataItem label="VAT Number" value={studioApp.vat_number} />
              </div>
            </section>
          )}

          <section className="admin-section">
            <h3 style={sectionTitleStyle}>Uploaded Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DocCard label="Commercial Reg." url={studioApp?.cr_document_url} />
              <DocCard label="VAT Certificate" url={studioApp?.vat_certificate_url} />
              <DocCard label="National Address" url={studioApp?.national_address_url} />
              <DocCard label="Bank Screenshot" url={studioApp?.bank_document_url} />
            </div>
          </section>

          <section className="admin-section">
            <h3 style={sectionTitleStyle}>About the Company</h3>
            <p style={{ color: '#aaa', lineHeight: 1.6, background: '#111', padding: 20, borderRadius: 12 }}>
              {studioApp?.about_company || "No description provided."}
            </p>
          </section>
        </div>

        {/* Right Column: Contract Draft */}
        <div>
          <div style={{ position: 'sticky', top: 40 }}>
            <h3 style={sectionTitleStyle}>Contract Draft</h3>
            <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 12 }}>
              Edit the contract before sending it to the client.
            </p>
            <textarea 
              style={{ 
                width: '100%', minHeight: 500, background: '#111', border: '1px solid #222',
                borderRadius: 12, color: '#ccc', padding: 20, fontSize: '0.9rem', lineHeight: 1.5,
                outline: 'none'
              }}
              value={contractDraft}
              onChange={(e) => setContractDraft(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Boxes */}
      <div style={{ marginTop: 60, borderTop: '1px solid #1a1a1a', paddingTop: 60 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 40 }}>Management Actions</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {/* Box 1: Approve */}
          <div style={{ ...boxStyle, border: '1px solid #22c55e33', background: '#22c55e05' }}>
            <h4 style={{ color: '#22c55e', margin: '0 0 12px 0' }}>Approve & Send Contract</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', flex: 1 }}>
              Creates credentials, sends welcome email with temp password, and attaches the modified contract draft.
            </p>
            <button 
              onClick={handleApprove}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#22c55e', color: '#000' }}
            >
              {actionLoading === 'approve' ? 'Sending...' : 'Approve & Send'}
            </button>
          </div>

          {/* Box 2: Update Request */}
          <div style={{ ...boxStyle, border: '1px solid #eab30833', background: '#eab30805' }}>
            <h4 style={{ color: '#eab308', margin: '0 0 12px 0' }}>Request Modification</h4>
            <textarea 
              placeholder="e.g. CR file is blurry, please re-upload..."
              style={boxInputStyle}
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
            />
            <button 
              onClick={handleRequestUpdate}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#eab308', color: '#000' }}
            >
              Request Update
            </button>
          </div>

          {/* Box 3: Reject */}
          <div style={{ ...boxStyle, border: '1px solid #ef444433', background: '#ef444405' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 12px 0' }}>Reject Application</h4>
            <textarea 
              placeholder="Reason for rejection..."
              style={boxInputStyle}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <button 
              onClick={handleReject}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}
            >
              Reject & Notify
            </button>
          </div>

          {/* Box 4: Delete */}
          <div style={{ ...boxStyle, border: '1px solid #333', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ color: '#888', margin: '0 0 12px 0' }}>Delete Application</h4>
            <p style={{ fontSize: '0.85rem', color: '#555', flex: 1 }}>
              Removes all traces from the database. Client will not be notified. Use with caution.
            </p>
            <button 
              onClick={handleDelete}
              disabled={!!actionLoading}
              style={{ ...btnStyle, background: '#222', color: '#fff' }}
            >
              Delete Permanently
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
