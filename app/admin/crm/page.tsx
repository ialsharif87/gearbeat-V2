import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  role?: string;
  status?: string;
  search?: string;
}

export default async function AdminCrmConsolePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  // Ensure the user has active admin rights before proceeding
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // 1. Safe Database Queries with Try/Catch
  let leads: any[] = [];
  let contacts: any[] = [];
  let profiles: any[] = [];
  let accounts: any[] = [];
  let dbError = null;

  try {
    const [leadsRes, contactsRes, profilesRes, accountsRes] = await Promise.all([
      supabaseAdmin.from("crm_leads").select("*"),
      supabaseAdmin.from("crm_contacts").select("*"),
      supabaseAdmin.from("profiles").select("id, role, full_name, email, phone"),
      supabaseAdmin.from("crm_accounts").select("*"),
    ]);

    leads = leadsRes.data || [];
    contacts = contactsRes.data || [];
    profiles = profilesRes.data || [];
    accounts = accountsRes.data || [];
  } catch (error: any) {
    console.error("Failsafe warning: CRM database fetch caught safe error:", error);
    dbError = error?.message || String(error);
  }

  // 2. Map and Enrich Data in Memory
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const enrichedLeads = leads.map((lead) => {
    const contact = contactMap.get(lead.contact_id);
    const profile = lead.auth_user_id ? profileMap.get(lead.auth_user_id) : null;
    const account = contact?.account_id ? accountMap.get(contact.account_id) : null;

    // Resolve structural roles
    let role = "customer";
    if (profile?.role) {
      role = profile.role;
    } else if (contact?.job_title) {
      const jt = contact.job_title.toLowerCase();
      if (jt.includes("owner") || jt.includes("studio")) role = "studio_owner";
      else if (jt.includes("vendor") || jt.includes("seller")) role = "vendor";
      else if (jt.includes("admin")) role = "admin";
      else if (jt.includes("ticket") || jt.includes("event") || jt.includes("organizer")) role = "ticket_organizer";
    }

    return {
      ...lead,
      contact,
      profile,
      account,
      resolvedRole: role,
      resolvedName: contact ? `${contact.first_name} ${contact.last_name}` : (profile?.full_name || "Unknown Lead"),
      resolvedEmail: contact?.email || profile?.email || "No Email",
      resolvedPhone: contact?.phone || profile?.phone || "No Phone",
    };
  });

  // UX Status mapping configuration to align database table constraints with founder self-test stages
  const mapStatusToUX = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "pending" || s === "draft" || s === "new") return "new";
    if (s === "contacted" || s === "under_review" || s === "submitted") return "contacted";
    if (s === "qualified" || s === "approved" || s === "active") return "qualified";
    if (s === "blocked" || s === "rejected" || s === "cancelled" || s === "failed") return "blocked";
    if (s === "ready_for_test") return "ready_for_test";
    if (s === "completed") return "completed";
    return "new"; // default fallback
  };

  // 3. Apply Server-Side Filters from Search Params
  const activeRole = resolvedSearchParams.role || "all";
  const activeStatus = resolvedSearchParams.status || "all";
  const searchQuery = (resolvedSearchParams.search || "").toLowerCase();

  const filteredLeads = enrichedLeads.filter((lead) => {
    const roleMatch = activeRole === "all" || lead.resolvedRole.toLowerCase() === activeRole.toLowerCase();
    
    const uxStatus = mapStatusToUX(lead.status);
    const statusMatch = activeStatus === "all" || uxStatus === activeStatus.toLowerCase();
    
    const searchMatch =
      !searchQuery ||
      lead.resolvedName.toLowerCase().includes(searchQuery) ||
      lead.resolvedEmail.toLowerCase().includes(searchQuery) ||
      lead.title.toLowerCase().includes(searchQuery) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchQuery));

    return roleMatch && statusMatch && searchMatch;
  });

  // 4. Calculate Aggregate Metrics dynamically based on current filtered state
  const totalCount = enrichedLeads.length;
  const newCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "new").length;
  const contactedCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "contacted").length;
  const qualifiedCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "qualified").length;
  const blockedCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "blocked").length;
  const readyCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "ready_for_test").length;
  const completedCount = enrichedLeads.filter((l) => mapStatusToUX(l.status) === "completed").length;

  // Configuration values for UI mapping
  const rolesList = [
    { id: "all", labelEn: "All Roles", labelAr: "جميع الأدوار" },
    { id: "customer", labelEn: "Customer", labelAr: "عميل" },
    { id: "studio_owner", labelEn: "Studio Owner", labelAr: "صاحب استوديو" },
    { id: "vendor", labelEn: "Vendor", labelAr: "تاجر" },
    { id: "ticket_organizer", labelEn: "Ticket Organizer", labelAr: "منظم تذاكر" },
    { id: "admin", labelEn: "Admin", labelAr: "مدير" },
  ];

  const statusesList = [
    { id: "all", labelEn: "All Statuses", labelAr: "جميع الحالات" },
    { id: "new", labelEn: "New", labelAr: "جديد" },
    { id: "contacted", labelEn: "Contacted", labelAr: "تم التواصل" },
    { id: "qualified", labelEn: "Qualified", labelAr: "مؤهل" },
    { id: "blocked", labelEn: "Blocked", labelAr: "محظور" },
    { id: "ready_for_test", labelEn: "Ready for Test", labelAr: "جاهز للاختبار" },
    { id: "completed", labelEn: "Completed", labelAr: "مكتمل" },
  ];

  const roleStyles: any = {
    customer: { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6", ar: "عميل" },
    studio_owner: { bg: "rgba(207, 168, 110, 0.12)", text: "#cfa86e", ar: "صاحب استوديو" },
    vendor: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", ar: "تاجر" },
    ticket_organizer: { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899", ar: "منظم تذاكر" },
    admin: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", ar: "مدير" },
  };

  const pipelineColumns = [
    { id: "new", labelEn: "New", labelAr: "جديد", color: "#3b82f6", count: newCount },
    { id: "contacted", labelEn: "Contacted", labelAr: "تم التواصل", color: "#eab308", count: contactedCount },
    { id: "qualified", labelEn: "Qualified", labelAr: "مؤهل", color: "#10b981", count: qualifiedCount },
    { id: "blocked", labelEn: "Blocked", labelAr: "محظور", color: "#ef4444", count: blockedCount },
    { id: "ready_for_test", labelEn: "Ready for Test", labelAr: "جاهز للاختبار", color: "#8b5cf6", count: readyCount },
    { id: "completed", labelEn: "Completed", labelAr: "مكتمل", color: "#10b981", count: completedCount },
  ];

  // Render a clean URL with search parameters helper
  const makeFilterUrl = (params: Partial<SearchParams>) => {
    const base = "/admin/crm";
    const current = { role: activeRole, status: activeStatus, search: resolvedSearchParams.search || "" };
    const merged = { ...current, ...params };
    const queryParts = [];
    if (merged.role && merged.role !== "all") queryParts.push(`role=${merged.role}`);
    if (merged.status && merged.status !== "all") queryParts.push(`status=${merged.status}`);
    if (merged.search) queryParts.push(`search=${encodeURIComponent(merged.search)}`);
    return queryParts.length ? `${base}?${queryParts.join("&")}` : base;
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "??";
  };

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", padding: "32px", color: "white", fontFamily: "inherit" }}>
      {/* 1. HEADER SECTION WITH PRE-LAUNCH BADGES */}
      <section style={{ marginBottom: "40px", borderBottom: "1px solid #1a1a1a", paddingBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ color: "#cfa86e", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1.5px", fontWeight: 800, margin: "0 0 8px 0" }}>
              <T en="Internal Team Sandbox Console" ar="منصة تجربة العلاقات الداخلية" />
            </p>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, color: "white", letterSpacing: "-1px" }}>
              <T en="Founder CRM Console" ar="لوحة تجارب علاقات العملاء" />
            </h1>
            <p style={{ color: "#888", marginTop: "8px", fontSize: "0.95rem" }}>
              <T 
                en="Sandbox audit dashboard constructed for Founder self-test procedures and database record verification." 
                ar="لوحة تدقيق تجريبية تم إنشاؤها لعمليات الفحص الذاتي للمؤسسين والتحقق من سجلات قواعد البيانات." 
              />
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ background: "rgba(207, 168, 110, 0.1)", border: "1px solid rgba(207, 168, 110, 0.3)", color: "#cfa86e", padding: "6px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
              FOUNDER_SANDBOX
            </span>
            <span style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#22c55e", padding: "6px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
              <T en="Saudi-First Ready" ar="جاهز للمملكة أولاً" />
            </span>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC CRM OVERVIEW METRICS CARDS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {[
          { labelEn: "Total CRM Contacts", labelAr: "إجمالي جهات الاتصال", value: totalCount, color: "#cfa86e", icon: "👥" },
          { labelEn: "New & Contacted Leads", labelAr: "جهات الاتصال الجديدة والمجدولة", value: newCount + contactedCount, color: "#3b82f6", icon: "📥" },
          { labelEn: "Qualified & Ready", labelAr: "مؤهل وجاهز للاختبار", value: qualifiedCount + readyCount, color: "#10b981", icon: "⚙️" },
          { labelEn: "Blocked & Flagged", labelAr: "المحظورة والمستبعدة", value: blockedCount, color: "#ef4444", icon: "🚫" },
        ].map((card, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: "#111", 
              border: "1px solid #1e1e1e", 
              padding: "24px", 
              borderRadius: "20px", 
              position: "relative",
              overflow: "hidden",
              borderTop: `3px solid ${card.color}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#666", fontSize: "0.85rem", fontWeight: 700 }}>
                <T en={card.labelEn} ar={card.labelAr} />
              </span>
              <span style={{ fontSize: "1.25rem" }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, marginTop: "12px", color: "white" }}>
              {card.value}
            </div>
          </div>
        ))}
      </section>

      {/* 3. DUAL FILTER CONTROLS & SEARCH INPUT */}
      <section style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "24px", padding: "24px", marginBottom: "40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* A. Search and Status Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: "#888", fontSize: "0.85rem", fontWeight: 700 }}>
                <T en="Filters" ar="الفلاتر" />:
              </span>
              
              {/* Reset link when active */}
              {(activeRole !== "all" || activeStatus !== "all" || searchQuery) && (
                <Link 
                  href="/admin/crm" 
                  style={{ color: "#ef4444", fontSize: "0.8rem", textDecoration: "none", fontWeight: 700, background: "rgba(239, 68, 68, 0.08)", padding: "4px 10px", borderRadius: "8px" }}
                >
                  ✕ <T en="Clear Filters" ar="إزالة التصفية" />
                </Link>
              )}
            </div>

            {/* Search Input Form */}
            <form style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "360px" }}>
              {/* Keep other filter search params */}
              {activeRole !== "all" && <input type="hidden" name="role" value={activeRole} />}
              {activeStatus !== "all" && <input type="hidden" name="status" value={activeStatus} />}
              
              <input 
                type="text" 
                name="search" 
                defaultValue={resolvedSearchParams.search || ""} 
                placeholder="Search leads..." 
                style={{ 
                  flex: 1, 
                  background: "#0a0a0a", 
                  border: "1px solid #222", 
                  padding: "10px 16px", 
                  borderRadius: "12px", 
                  color: "white", 
                  fontSize: "0.85rem" 
                }} 
              />
              <button 
                type="submit" 
                style={{ 
                  background: "#cfa86e", 
                  color: "black", 
                  border: "none", 
                  padding: "10px 18px", 
                  borderRadius: "12px", 
                  fontWeight: 800, 
                  fontSize: "0.85rem", 
                  cursor: "pointer" 
                }}
              >
                <T en="Search" ar="بحث" />
              </button>
            </form>
          </div>

          {/* B. Role Filters Selector */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "0.8rem", fontWeight: 700, paddingTop: "8px", width: "100px" }}>
              <T en="By User Role" ar="دور العميل" />:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {rolesList.map((roleItem) => {
                const isActive = activeRole === roleItem.id;
                return (
                  <Link
                    key={roleItem.id}
                    href={makeFilterUrl({ role: roleItem.id })}
                    style={{
                      textDecoration: "none",
                      background: isActive ? "#cfa86e" : "#0a0a0a",
                      color: isActive ? "black" : "#888",
                      border: isActive ? "1px solid #cfa86e" : "1px solid #222",
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <T en={roleItem.labelEn} ar={roleItem.labelAr} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* C. Status Filters Selector */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "0.8rem", fontWeight: 700, paddingTop: "8px", width: "100px" }}>
              <T en="By Status" ar="حالة الاتصال" />:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {statusesList.map((statusItem) => {
                const isActive = activeStatus === statusItem.id;
                return (
                  <Link
                    key={statusItem.id}
                    href={makeFilterUrl({ status: statusItem.id })}
                    style={{
                      textDecoration: "none",
                      background: isActive ? "#cfa86e" : "#0a0a0a",
                      color: isActive ? "black" : "#888",
                      border: isActive ? "1px solid #cfa86e" : "1px solid #222",
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <T en={statusItem.labelEn} ar={statusItem.labelAr} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CRM KANBAN PIPELINE / EMPTY STATES */}
      {dbError && (
        <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "16px 20px", borderRadius: "16px", color: "#f87171", fontSize: "0.85rem", marginBottom: "32px" }}>
          ⚠️ <T en="Safe Sandbox Mode active. Live DB connection failed to load CRM schema tables:" ar="بيئة الفحص الآمنة نشطة. تعذر الاتصال بجداول إدارة علاقات العملاء في قاعدة البيانات:" /> {dbError}
        </div>
      )}

      {enrichedLeads.length === 0 ? (
        /* Core Empty State: Rendered only when absolutely no real test leads exist */
        <section 
          style={{ 
            background: "linear-gradient(135deg, #111 0%, #0d0d0d 100%)", 
            border: "1px dashed #222", 
            borderRadius: "24px", 
            padding: "80px 40px", 
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto"
          }}
        >
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "20px" }}>🤝</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: "0 0 12px 0" }}>
            <T en="No Test CRM Contacts Registered" ar="لا توجد جهات اتصال مسجلة في الفحص" />
          </h2>
          <p style={{ color: "#999", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto 32px auto" }}>
            <T 
              en="CRM records will appear here after internal test accounts and contacts are created." 
              ar="ستظهر سجلات إدارة علاقات العملاء (CRM) هنا بعد إنشاء حسابات الاختبار الداخلية وجهات الاتصال." 
            />
          </p>
          
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link 
              href="/admin/manual-ops" 
              style={{ 
                background: "#cfa86e", 
                color: "black", 
                padding: "12px 24px", 
                borderRadius: "12px", 
                textDecoration: "none", 
                fontWeight: 800, 
                fontSize: "0.9rem" 
              }}
            >
              <T en="Go to Manual Ops Sandbox" ar="الذهاب إلى منصة الفحص التأسيسية" /> →
            </Link>
            
            <Link 
              href="/admin/users" 
              style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid #222",
                color: "white", 
                padding: "12px 24px", 
                borderRadius: "12px", 
                textDecoration: "none", 
                fontWeight: 800, 
                fontSize: "0.9rem" 
              }}
            >
              <T en="Manage User Profiles" ar="إدارة ملفات المستخدمين" />
            </Link>
          </div>
        </section>
      ) : (
        /* Render Visual Kanban Pipeline columns */
        <section 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(6, 1fr)", 
            gap: "20px", 
            overflowX: "auto",
            paddingBottom: "24px"
          }}
        >
          {pipelineColumns.map((col) => {
            const colLeads = filteredLeads.filter((l) => mapStatusToUX(l.status) === col.id);

            return (
              <div 
                key={col.id} 
                style={{ 
                  background: "rgba(17, 17, 17, 0.4)", 
                  border: "1px solid #1e1e1e", 
                  borderRadius: "20px", 
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "260px",
                  minHeight: "450px"
                }}
              >
                {/* Column Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #222", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "white" }}>
                      <T en={col.labelEn} ar={col.labelAr} />
                    </span>
                  </div>
                  <span style={{ background: "#222", color: "#888", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Leads Queue inside specific column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  {colLeads.length === 0 ? (
                    /* Dotted card placeholder when no leads match this stage */
                    <div 
                      style={{ 
                        border: "1px dashed #222", 
                        borderRadius: "14px", 
                        padding: "24px 16px", 
                        textAlign: "center", 
                        color: "#555", 
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100px"
                      }}
                    >
                      <T en="No leads here" ar="لا توجد جهات اتصال" />
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const rStyle = roleStyles[lead.resolvedRole] || { bg: "#222", text: "#888", ar: lead.resolvedRole };
                      
                      return (
                        <div 
                          key={lead.id} 
                          style={{ 
                            background: "#111", 
                            border: "1px solid #1e1e1e", 
                            borderRadius: "14px", 
                            padding: "16px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <span 
                            style={{ 
                              background: rStyle.bg, 
                              color: rStyle.text, 
                              fontSize: "0.65rem", 
                              padding: "2px 8px", 
                              borderRadius: "6px", 
                              fontWeight: 800,
                              textTransform: "uppercase" 
                            }}
                          >
                            <T en={lead.resolvedRole} ar={rStyle.ar} />
                          </span>

                          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", margin: "10px 0 6px 0" }}>
                            {lead.title}
                          </h4>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#cfa86e", color: "black", fontWeight: 900, fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {getInitials(lead.resolvedName)}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                {lead.resolvedName}
                              </span>
                              <span style={{ display: "block", fontSize: "0.65rem", color: "#666", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                {lead.resolvedEmail}
                              </span>
                            </div>
                          </div>

                          {lead.source && (
                            <div style={{ marginTop: "12px", fontSize: "0.65rem", color: "#555", display: "flex", justifyContent: "space-between" }}>
                              <span>Source: {lead.source}</span>
                              <span style={{ color: "#cfa86e" }}>{lead.status}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
