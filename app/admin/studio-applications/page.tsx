"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import T from "@/components/t";
import Link from "next/link";

import { approveStudioApplication, updateStudioApplicationStatus, giveFinalApproval } from "./actions";

export default function AdminStudioApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  
  // Modal State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [modalType, setModalType] = useState<"approve" | "update" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for modals
  const [commissionRate, setCommissionRate] = useState("15");
  const [studioLimit, setStudioLimit] = useState("1");
  const [adminNote, setAdminNote] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  async function fetchApplications() {
    setLoading(true);
    let query = supabase.from("studio_applications").select("*").order("submitted_at", { ascending: false });
    
      { filter === "contracts" ? (
        query = query.not("contract_uploaded_at", "is", null).is("final_approved_at", null)
      ) : filter !== "all" ? (
        query = query.eq("status", filter)
      ) : null }

    const { data, error } = await query;
    if (!error) setApplications(data || []);
    setLoading(false);
  }

  async function handleApprove() {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const result = await approveStudioApplication(
        selectedApp.id, 
        parseFloat(commissionRate), 
        parseInt(studioLimit)
      );

      if (result.success) {
        closeModal();
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus: "rejected" | "needs_update") {
    if (!selectedApp || !adminNote) return;
    setActionLoading(true);
    try {
      const result = await updateStudioApplicationStatus(selectedApp.id, newStatus, adminNote);
      if (result.success) {
        closeModal();
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  }

  function closeModal() {
    setSelectedApp(null);
    setModalType(null);
    setAdminNote("");
  }

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: { bg: "rgba(234, 179, 8, 0.1)", color: "#eab308" },
      approved: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
      rejected: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
      needs_update: { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ padding: "4px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, background: s.bg, color: s.color }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <main style={{ padding: 40, background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <div style={{ marginBottom: 40 }}>
        <Link href="/admin" style={{ color: "#D4AF37", textDecoration: "none", fontSize: "0.9rem", display: "inline-block", marginBottom: 16 }}>← Back to Admin</Link>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 8 }}>
          <T en="Studio Applications" ar="طلبات الاستوديوهات" />
        </h1>
        <p style={{ color: "#888" }}>
          <T en="Review and manage company registrations for GearBeat V2." ar="مراجعة وإدارة تسجيلات الشركات لمنصة GearBeat V2." />
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {["pending", "approved", "contracts", "rejected", "needs_update", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #1e1e1e",
              background: filter === s ? "#D4AF37" : "#111",
              color: filter === s ? "#000" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            <T 
              en={s === "contracts" ? "AWAITING FINAL" : s.replace("_", " ").toUpperCase()} 
              ar={s === "pending" ? "معلق" : s === "approved" ? "معتمد" : s === "contracts" ? "بانتظار التفعيل" : s === "rejected" ? "مرفوض" : s === "needs_update" ? "طلب تحديث" : "الكل"} 
            />
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1e1e1e", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#1a1a1a", borderBottom: "1px solid #1e1e1e" }}>
              <th style={{ padding: 20 }}><T en="Company / Authorized" ar="الشركة / المفوض" /></th>
              <th style={{ padding: 20 }}><T en="City" ar="المدينة" /></th>
              <th style={{ padding: 20 }}><T en="Docs" ar="الوثائق" /></th>
              <th style={{ padding: 20 }}><T en="Studios" ar="العدد" /></th>
              <th style={{ padding: 20 }}><T en="Status" ar="الحالة" /></th>
              <th style={{ padding: 20 }}><T en="Submitted" ar="تاريخ التقديم" /></th>
              <th style={{ padding: 20 }}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }}>Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }}>No applications found.</td></tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700 }}>{app.company_name_en}</div>
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>{app.full_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#D4AF37" }}>{app.email}</div>
                  </td>
                  <td style={{ padding: 20 }}>{app.city}</td>
                  <td style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <a href={app.cr_document_url} target="_blank" style={{ color: "#D4AF37", textDecoration: "none", fontSize: "0.8rem" }} title="Commercial Registration">📄 CR</a>
                      {app.vat_certificate_url && <a href={app.vat_certificate_url} target="_blank" style={{ color: "#D4AF37", textDecoration: "none", fontSize: "0.8rem" }} title="VAT Certificate">📄 VAT</a>}
                      {app.contract_url && <a href={app.contract_url} target="_blank" style={{ color: "#22c55e", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700 }} title="Signed Contract">📜 CONTRACT</a>}
                    </div>
                  </td>
                  <td style={{ padding: 20 }}>{app.planned_studios_count}</td>
                  <td style={{ padding: 20 }}>{getStatusBadge(app.status)}</td>
                  <td style={{ padding: 20, fontSize: "0.85rem" }}>
                    {new Date(app.submitted_at).toLocaleDateString()}
                    <div style={{ color: "#555" }}>{new Date(app.submitted_at).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {app.status === "pending" && (
                        <>
                          <button 
                            onClick={() => { setSelectedApp(app); setModalType("approve"); }}
                            style={{ background: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => { setSelectedApp(app); setModalType("update"); }}
                            style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                          >
                            Update
                          </button>
                        </>
                      )}
                      {app.contract_uploaded_at && !app.final_approved_at && (
                        <button 
                          onClick={async () => {
                            if (confirm("Give Final Approval and activate this company?")) {
                              await giveFinalApproval(app.id);
                              fetchApplications();
                            }
                          }}
                          style={{ background: "#D4AF37", color: "#000", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                        >
                          Final Approve
                        </button>
                      )}
                      <button 
                        onClick={() => { setSelectedApp(app); setModalType("reject"); }}
                        style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {modalType && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 24, padding: 40, maxWidth: 500, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: 24, fontWeight: 900 }}>
              {modalType === "approve" && <T en="Approve Application" ar="اعتماد الطلب" />}
              {modalType === "update" && <T en="Request Update" ar="طلب تحديث بيانات" />}
              {modalType === "reject" && <T en="Reject Application" ar="رفض الطلب" />}
            </h2>

            {modalType === "approve" && (
              <div style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Commission Rate (%)" ar="نسبة العمولة (%)" /></label>
                  <input className="input" type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: "0.85rem", color: "#888" }}><T en="Studio Limit" ar="حد الاستوديوهات" /></label>
                  <input className="input" type="number" value={studioLimit} onChange={(e) => setStudioLimit(e.target.value)} />
                </div>
              </div>
            )}

            {(modalType === "update" || modalType === "reject") && (
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}>{modalType === "update" ? "Message to Applicant" : "Reason for Rejection"}</label>
                <textarea className="input" style={{ minHeight: 120, paddingTop: 12 }} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="..." />
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              <button 
                onClick={closeModal}
                style={{ flex: 1, background: "transparent", border: "1px solid #333", color: "#fff", padding: "14px", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={
                  modalType === "approve" ? handleApprove : 
                  modalType === "update" ? () => handleStatusUpdate("needs_update") : 
                  () => handleStatusUpdate("rejected")
                }
                style={{ 
                  flex: 1, 
                  background: modalType === "reject" ? "#ef4444" : "#D4AF37", 
                  color: modalType === "reject" ? "#fff" : "#000", 
                  border: "none", 
                  padding: "14px", 
                  borderRadius: 12, 
                  fontWeight: 800, 
                  cursor: "pointer" 
                }}
              >
                {actionLoading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
