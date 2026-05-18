"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import T from "@/components/t";

interface ManualOpsConsoleClientProps {
  adminEmail: string;
  studioBookings: any[];
  marketplaceOrders: any[];
  serviceBookings: any[];
  ticketBookings: any[];
  academyLessons: any[];
  academyBookings: any[];
  manualOperations: any[];
  refundStudioBookings: any[];
  refundMarketplaceOrders: any[];
  founderTestIssues: any[];
}

export function ManualOpsConsoleClient({
  adminEmail,
  studioBookings,
  marketplaceOrders,
  serviceBookings,
  ticketBookings,
  academyLessons,
  academyBookings,
  manualOperations,
  refundStudioBookings,
  refundMarketplaceOrders,
  founderTestIssues
}: ManualOpsConsoleClientProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gb_founder_selftest_checklist");
      const defaults: Record<string, boolean> = {
        "user_roles": false,
        "customer_signup": false,
        "vendor_signup": false,
        "studio_signup": false,
        "booking_simulation": false,
        "manual_payment_audit": false,
        "catalog_draft": false,
        "marketplace_checkout": false,
        "service_listing": false,
        "event_ticket": false,
        "academy_lesson": false,
        "refund_reconciliation": false,
        "reconcile_ledger": false,
        "db_log_run": false,
        "demo_customer_bind": false,
        "demo_owner_bind": false,
        "demo_vendor_bind": false,
        "demo_organizer_bind": false,
        "demo_admin_bind": false
      };
      if (saved) {
        setChecklist({ ...defaults, ...JSON.parse(saved) });
      } else {
        setChecklist(defaults);
        localStorage.setItem("gb_founder_selftest_checklist", JSON.stringify(defaults));
      }
    } catch (e) {
      console.error("Failed to load checklist from localStorage:", e);
    }
  }, []);

  // Update localStorage when checklist changes
  const toggleChecklistItem = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem("gb_founder_selftest_checklist", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save checklist to localStorage:", e);
    }
  };

  const getChecklistProgress = () => {
    const keys = Object.keys(checklist);
    if (keys.length === 0) return 0;
    const completed = keys.filter(k => checklist[k]).length;
    return Math.round((completed / keys.length) * 100);
  };

  // Safe Date formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="gb-dashboard-page" style={{ padding: "32px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* 1. TOP HEADER & FOUNDER WARNING BANNER */}
      <section className="gb-dashboard-header" style={{ marginBottom: "20px" }}>
        <div className="animate-up">
          <p className="gb-eyebrow">
            <T en="Founder Self-Test System" ar="نظام الفحص الذاتي للمؤسس" />
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 900, margin: 0, letterSpacing: "-1.5px", color: "#FFF" }}>
            <T en="Manual Operations Console" ar="لوحة التحكم بالعمليات اليدوية" />
          </h1>
          
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge-gold" style={{ letterSpacing: 1, background: "rgba(212, 175, 55, 0.1)" }}>
              FOUNDER_SANDBOX
            </span>
            <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: "0.65rem", fontWeight: 800 }}>
              PRE-LAUNCH SAFETY DRAFT
            </span>
            <span className="badge" style={{ background: "rgba(0, 255, 136, 0.1)", color: "#00ff88", border: "1px solid rgba(0, 255, 136, 0.3)", fontSize: "0.65rem", fontWeight: 800 }}>
              SAUDI-FIRST COMPLIANCE
            </span>
            <span style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", borderLeft: "1px solid var(--gb-border)", paddingLeft: "12px" }}>
              {adminEmail}
            </span>
          </div>
        </div>

        <div className="text-end animate-up" style={{ minWidth: "150px" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--gb-gold)", letterSpacing: -1 }}>
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="gb-eyebrow" style={{ marginTop: "4px", fontSize: "0.65rem" }}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
          </div>
        </div>
      </section>

      {/* BANNER FOR PRE-LAUNCH SAFETY LIMITATIONS */}
      <section className="animate-up" style={{
        background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "32px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "2.2rem" }}>🛡️</span>
          <div>
            <h3 style={{ color: "var(--gb-gold)", fontSize: "1.1rem", fontWeight: 800, marginBottom: "6px" }}>
              <T en="Founder Self-Test Safety & Transaction Isolation" ar="عزل المعاملات وسلامة الفحص الذاتي للمؤسس" />
            </h3>
            <p style={{ color: "#e2e8f0", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>
              <T 
                en="This console is constructed exclusively as an internal sandboxed audit console. Real payment processing is currently locked. Manual payment review, credit allocations, and refund triggers represent simulated workflows for self-testing. Backend mutations and SQL executions remain strictly disabled to maintain database integrity."
                ar="تم إنشاء لوحة التحكم هذه حصريًا كمنصة تدقيق معزولة للفحص الذاتي. معالجة المدفوعات الحقيقية مغلقة حاليًا. تمثل مراجعة المدفوعات وتخصيص الرصيد وإلغاء المعاملات محاكاة لخطوات الفحص. العمليات الخلفية المباشرة معطلة تمامًا لحماية البيانات."
              />
            </p>
          </div>
        </div>
      </section>

      {/* 2. TAB SELECTOR */}
      <section className="animate-up" style={{ 
        display: "flex", 
        borderBottom: "1px solid var(--gb-border)", 
        marginBottom: "32px", 
        overflowX: "auto",
        gap: "4px",
        paddingBottom: "1px"
      }}>
        <TabButton id="dashboard" labelEn="Dashboard" labelAr="لوحة المراقبة" activeId={activeTab} onClick={setActiveTab} icon="📊" />
        <TabButton id="bookings" labelEn="Bookings Queue" labelAr="طابور الحجوزات" activeId={activeTab} onClick={setActiveTab} icon="📅" count={studioBookings.length + serviceBookings.length + ticketBookings.length} />
        <TabButton id="marketplace" labelEn="Marketplace Orders" labelAr="طلبات السوق" activeId={activeTab} onClick={setActiveTab} icon="🛒" count={marketplaceOrders.length} />
        <TabButton id="academy" labelEn="Academy Lesson Review" labelAr="مراجعة دروس الأكاديمية" activeId={activeTab} onClick={setActiveTab} icon="🎓" count={academyLessons.length + academyBookings.length} />
        <TabButton id="safety" labelEn="Safety & Refunds" labelAr="الأمان والاسترداد" activeId={activeTab} onClick={setActiveTab} icon="🔒" count={manualOperations.length + refundStudioBookings.length + refundMarketplaceOrders.length} />
        <TabButton id="blockers" labelEn="Self-Test Blockers" labelAr="عوائق الفحص" activeId={activeTab} onClick={setActiveTab} icon="⚠️" count={founderTestIssues.length} />
        <TabButton id="checklist" labelEn="Action Checklist" labelAr="قائمة المهام" activeId={activeTab} onClick={setActiveTab} icon="📋" progress={getChecklistProgress()} />
      </section>

      {/* 3. TAB CONTENT */}
      
      {/* --- DASHBOARD TAB --- */}
      {activeTab === "dashboard" && (
        <div className="animate-up" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* A. GLOBAL METRIC CARDS */}
          <div className="gb-dash-grid">
            <MetricCard 
              labelEn="Studio Bookings Awaiting Review" 
              labelAr="حجوزات استوديوهات قيد المراجعة" 
              value={studioBookings.length} 
              icon="🎙️" 
              color="var(--gb-gold)"
            />
            <MetricCard 
              labelEn="Marketplace Orders Awaiting Review" 
              labelAr="طلبات السوق قيد المراجعة" 
              value={marketplaceOrders.length} 
              icon="🛍️" 
              color="var(--gb-gold)"
            />
            <MetricCard 
              labelEn="Service & Ticket Bookings" 
              labelAr="حجوزات الخدمات والتذاكر" 
              value={serviceBookings.length + ticketBookings.length} 
              icon="🎫" 
              color="#209cff"
            />
            <MetricCard 
              labelEn="Academy Lessons Pending" 
              labelAr="حصص أكاديمية معلقة" 
              value={academyLessons.length} 
              icon="🎓" 
              color="#a569bd"
            />
          </div>

          {/* B. MAIN OVERVIEW SPLIT LAYOUT */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* Left Box: System Operations Checklist Progress */}
            <div className="gb-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                    <T en="Founder Self-Test Progress" ar="تقدم الفحص الذاتي للمؤسس" />
                  </h3>
                  <span className="badge-gold">{getChecklistProgress()}%</span>
                </div>
                <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  <T 
                    en="Follow the interactive checklist on the 'Action Checklist' tab to execute comprehensive pre-launch operations testing." 
                    ar="اتبع قائمة المهام التفاعلية في تبويب 'قائمة المهام' لتنفيذ الفحص الكامل لعمليات ما قبل الإطلاق." 
                  />
                </p>
                
                {/* Visual Progress Bar */}
                <div style={{ background: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "24px" }}>
                  <div style={{ 
                    background: "linear-gradient(90deg, var(--gb-gold), var(--gb-gold-light))", 
                    width: `${getChecklistProgress()}%`, 
                    height: "100%", 
                    transition: "width 0.4s ease-in-out" 
                  }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ChecklistOverviewItem done={checklist["user_roles"]} labelEn="Verify User Roles & Onboarding" labelAr="التحقق من أدوار المستخدمين وتأهيلهم" />
                  <ChecklistOverviewItem done={checklist["booking_simulation"]} labelEn="Perform Booking Simulation" labelAr="محاكاة حجز استوديو" />
                  <ChecklistOverviewItem done={checklist["marketplace_checkout"]} labelEn="Verify Marketplace Checkout" labelAr="التحقق من شراء منتج من السوق" />
                  <ChecklistOverviewItem done={checklist["manual_payment_audit"]} labelEn="Audit Manual Payment Flows" labelAr="مراجعة تدفقات الدفع اليدوية" />
                </div>
              </div>

              <button 
                onClick={() => setActiveTab("checklist")} 
                className="gb-button gb-button-outline" 
                style={{ width: "100%", marginTop: "24px", justifyContent: "center" }}
              >
                <T en="Go to Action Checklist" ar="الذهاب إلى قائمة المهام" /> →
              </button>
            </div>

            {/* Right Box: Manual Payments Safety Gate */}
            <div className="gb-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🔒</span>
                  <T en="Manual Payment Safety Status" ar="حالة أمان الدفع اليدوي" />
                </h3>
                
                <div style={{ 
                  background: "rgba(0, 255, 136, 0.05)", 
                  border: "1px solid rgba(0, 255, 136, 0.2)", 
                  padding: "16px", 
                  borderRadius: "12px", 
                  marginBottom: "20px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ color: "#00ff88", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <T en="Simulation Isolated" ar="المحاكاة معزولة" />
                    </strong>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
                  </div>
                  <p style={{ color: "var(--gb-text-muted)", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>
                    <T 
                      en="No payment mutations can be submitted to production payment processors. All TAP credentials and checkout API configurations are locked in safe sandbox test key modes." 
                      ar="لا يمكن إجراء أي تعديلات دفع حقيقية. جميع بيانات اعتماد بوابة TAP واشتراكات API مقفلة في وضع مفاتيح اختبار بيئة التطوير الآمنة." 
                    />
                  </p>
                </div>

                <div style={{ display: "grid", gap: "10px", fontSize: "0.8rem", color: "var(--gb-text-muted)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <span><T en="TAP Payment Processor API" ar="واجهة بوابة دفع TAP" /></span>
                    <strong style={{ color: "#f43f5e" }}>OFFLINE / TEST KEYS</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <span><T en="Live Invoicing mutations" ar="تعديلات الفواتير الحية" /></span>
                    <strong style={{ color: "#f43f5e" }}>DISABLED</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span><T en="Pre-live safety ledger verification" ar="التحقق من دفتر الأمان المالي" /></span>
                    <strong style={{ color: "#00ff88" }}>ACTIVE</strong>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab("safety")} 
                className="gb-button gb-button-primary" 
                style={{ width: "100%", marginTop: "24px", justifyContent: "center", color: "#000" }}
              >
                <T en="View Safety Logs" ar="عرض سجلات الأمان" />
              </button>
            </div>

          </div>

          {/* C. ACTIVE BLOCKER WATCH */}
          <div className="gb-card" style={{ border: "1px solid rgba(239, 68, 68, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠️</span>
                <T en="Founder Self-Test Blocker watch" ar="مراقبة عوائق الفحص الذاتي للمؤسس" />
              </h3>
              <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                {founderTestIssues.length} <T en="Active Blocker(s)" ar="عوائق نشطة" />
              </span>
            </div>

            {founderTestIssues.length === 0 ? (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px", background: "rgba(0, 255, 136, 0.05)", borderRadius: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <p style={{ color: "#86efac", fontSize: "0.85rem", margin: 0 }}>
                  <T en="No active founder blockers detected. The platform is fully operational for self-test scenarios!" ar="لا توجد عوائق نشطة للمؤسس. المنصة جاهزة تمامًا لسيناريوهات الفحص الذاتي!" />
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {founderTestIssues.map(issue => (
                  <div key={issue.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "10px", alignItems: "center" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.9rem", color: "#FFF" }}>{issue.title}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--gb-text-muted)" }}>{issue.description}</span>
                    </div>
                    <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", fontSize: "0.65rem" }}>
                      {issue.severity?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- BOOKING REVIEW QUEUES --- */}
      {activeTab === "bookings" && (
        <div className="animate-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Studio Booking Queue */}
          <div className="gb-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>🎙️ <T en="Studio Booking Review Queue" ar="طابور مراجعة حجوزات الاستوديوهات" /></h3>
              <span className="badge-gold">{studioBookings.length}</span>
            </div>

            {studioBookings.length === 0 ? (
              <RealEmptyState textEn="No live studio bookings yet." textAr="لا توجد حجوزات استوديوهات نشطة بعد." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Booking ID" ar="رقم الحجز" /></th>
                      <th style={tableThStyle}><T en="Studio" ar="الاستوديو" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                      <th style={tableThStyle}><T en="Total Amount" ar="المبلغ الإجمالي" /></th>
                      <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                      <th style={tableThStyle}><T en="Pre-Live Action" ar="إجراء الفحص" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {studioBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{b.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}>{b.studios?.name || "Unknown Studio"}</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                            {b.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={tableTdStyle}>{b.total_amount} SAR</td>
                        <td style={tableTdStyle}>{formatDate(b.created_at)}</td>
                        <td style={tableTdStyle}>
                          <button disabled style={disabledButtonStyle}>
                            <T en="Simulate Approve" ar="محاكاة الموافقة" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Service Booking Queue */}
          <div className="gb-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>🔧 <T en="Service Booking Review Queue" ar="طابور مراجعة حجوزات الخدمات" /></h3>
              <span className="badge-gold">{serviceBookings.length}</span>
            </div>

            {serviceBookings.length === 0 ? (
              <RealEmptyState textEn="No live service bookings yet." textAr="لا توجد حجوزات خدمات نشطة بعد." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Booking ID" ar="رقم الحجز" /></th>
                      <th style={tableThStyle}><T en="Service Title" ar="عنوان الخدمة" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                      <th style={tableThStyle}><T en="Paid Amount" ar="المبلغ المدفوع" /></th>
                      <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                      <th style={tableThStyle}><T en="Pre-Live Action" ar="إجراء الفحص" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{b.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}>{b.service_listings?.title || "Service"}</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                            {b.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={tableTdStyle}>{b.price_paid} SAR</td>
                        <td style={tableTdStyle}>{formatDate(b.created_at)}</td>
                        <td style={tableTdStyle}>
                          <button disabled style={disabledButtonStyle}>
                            <T en="Simulate Approve" ar="محاكاة الموافقة" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ticket Booking Queue */}
          <div className="gb-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>🎫 <T en="Ticket Booking Review Queue" ar="طابور مراجعة حجوزات الفعاليات" /></h3>
              <span className="badge-gold">{ticketBookings.length}</span>
            </div>

            {ticketBookings.length === 0 ? (
              <RealEmptyState textEn="No live ticket bookings yet." textAr="لا توجد حجوزات تذاكر نشطة بعد." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Order ID" ar="رقم الطلب" /></th>
                      <th style={tableThStyle}><T en="Event Title" ar="عنوان الفعالية" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                      <th style={tableThStyle}><T en="Total Price" ar="المبلغ الإجمالي" /></th>
                      <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                      <th style={tableThStyle}><T en="Pre-Live Action" ar="إجراء الفحص" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{b.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}>{b.events?.title || "Event"}</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                            {b.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={tableTdStyle}>{b.total_price} SAR</td>
                        <td style={tableTdStyle}>{formatDate(b.created_at)}</td>
                        <td style={tableTdStyle}>
                          <button disabled style={disabledButtonStyle}>
                            <T en="Simulate Approve" ar="محاكاة الموافقة" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- MARKETPLACE REVIEW QUEUE --- */}
      {activeTab === "marketplace" && (
        <div className="animate-up gb-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>🛒 <T en="Marketplace Order Review Queue" ar="طابور مراجعة طلبات المتجر" /></h3>
            <span className="badge-gold">{marketplaceOrders.length}</span>
          </div>

          {marketplaceOrders.length === 0 ? (
            <RealEmptyState textEn="No live marketplace orders awaiting review." textAr="لا توجد طلبات متجر معلقة للمراجعة." />
          ) : (
            <div className="gb-table-wrap">
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={tableThStyle}><T en="Order ID" ar="رقم الطلب" /></th>
                    <th style={tableThStyle}><T en="Seller" ar="التاجر" /></th>
                    <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                    <th style={tableThStyle}><T en="Total Amount" ar="المبلغ الإجمالي" /></th>
                    <th style={tableThStyle}><T en="Fulfillment" ar="التنفيذ" /></th>
                    <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                    <th style={tableThStyle}><T en="Action" ar="إجراء" /></th>
                  </tr>
                </thead>
                <tbody>
                  {marketplaceOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={tableTdStyle}>#{o.id?.slice(0, 8)}</td>
                      <td style={tableTdStyle}>{o.profiles?.full_name || "Unknown"}</td>
                      <td style={tableTdStyle}>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                          {o.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={tableTdStyle}>{o.total_amount} SAR</td>
                      <td style={tableTdStyle}>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(255,255,255,0.05)", color: "#fff" }}>
                          {o.fulfillment_status || "PENDING"}
                        </span>
                      </td>
                      <td style={tableTdStyle}>{formatDate(o.created_at)}</td>
                      <td style={tableTdStyle}>
                        <button disabled style={disabledButtonStyle}>
                          <T en="Approve & Settlement" ar="تأكيد وتسوية" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- ACADEMY QUEUE --- */}
      {activeTab === "academy" && (
        <div className="animate-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Academy Lesson Review Queue */}
          <div className="gb-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>🎓 <T en="Academy Lesson Review Queue" ar="طابور مراجعة حصص الأكاديمية" /></h3>
              <span className="badge-gold">{academyLessons.length}</span>
            </div>

            {academyLessons.length === 0 ? (
              <RealEmptyState textEn="No academy lessons pending review." textAr="لا توجد دروس أكاديمية معلقة للمراجعة." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Lesson ID" ar="رقم الدرس" /></th>
                      <th style={tableThStyle}><T en="Title" ar="العنوان" /></th>
                      <th style={tableThStyle}><T en="Duration" ar="المدة" /></th>
                      <th style={tableThStyle}><T en="Price" ar="السعر" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                      <th style={tableThStyle}><T en="Action" ar="إجراء" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {academyLessons.map(l => (
                      <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{l.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}>{l.title}</td>
                        <td style={tableTdStyle}>{l.duration_minutes} mins</td>
                        <td style={tableTdStyle}>{l.price} SAR</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                            {l.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <button disabled style={disabledButtonStyle}>
                            <T en="Approve Lesson" ar="الموافقة على الدرس" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Academy Bookings Review Queue */}
          <div className="gb-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>📋 <T en="Academy Booking Review Queue" ar="طابور مراجعة حجوزات الأكاديمية" /></h3>
              <span className="badge-gold">{academyBookings.length}</span>
            </div>

            {academyBookings.length === 0 ? (
              <RealEmptyState textEn="No academy bookings pending review." textAr="لا توجد حجوزات أكاديمية معلقة للمراجعة." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Booking ID" ar="رقم الحجز" /></th>
                      <th style={tableThStyle}><T en="Lesson Title" ar="عنوان الدرس" /></th>
                      <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                      <th style={tableThStyle}><T en="Action" ar="إجراء" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {academyBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{b.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}>{b.academy_lessons?.title || "Lesson"}</td>
                        <td style={tableTdStyle}>{formatDate(b.booking_time)}</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)" }}>
                            {b.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <button disabled style={disabledButtonStyle}>
                            <T en="Approve Attendance" ar="الموافقة على الحضور" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- SAFETY & REFUNDS TAB --- */}
      {activeTab === "safety" && (
        <div className="animate-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Manual Operations safety logs */}
          <div className="gb-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🛡️</span>
                <T en="Manual Operations Safety Logs" ar="سجلات أمان العمليات اليدوية" />
              </h3>
              <span className="badge-gold">{manualOperations.length}</span>
            </div>

            {manualOperations.length === 0 ? (
              <RealEmptyState textEn="No manual operations logged yet." textAr="لا توجد عمليات يدوية مسجلة بعد." />
            ) : (
              <div className="gb-table-wrap">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={tableThStyle}><T en="Log ID" ar="رقم السجل" /></th>
                      <th style={tableThStyle}><T en="Operation Type" ar="نوع العملية" /></th>
                      <th style={tableThStyle}><T en="Description" ar="الوصف" /></th>
                      <th style={tableThStyle}><T en="Date" ar="التاريخ" /></th>
                      <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualOperations.map(op => (
                      <tr key={op.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={tableTdStyle}>#{op.id?.slice(0, 8)}</td>
                        <td style={tableTdStyle}><strong>{op.operation_type}</strong></td>
                        <td style={tableTdStyle}>{op.description}</td>
                        <td style={tableTdStyle}>{formatDate(op.created_at)}</td>
                        <td style={tableTdStyle}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(0, 255, 136, 0.1)", color: "#00ff88" }}>
                            {op.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Refund/cancellation review status */}
          <div className="gb-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>💸 <T en="Refund & Cancellation Review Queue" ar="طابور مراجعة الاسترداد والإلغاء" /></h3>
              <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                {refundStudioBookings.length + refundMarketplaceOrders.length} <T en="Pending" ar="معلق" />
              </span>
            </div>

            {refundStudioBookings.length === 0 && refundMarketplaceOrders.length === 0 ? (
              <RealEmptyState textEn="No refund or cancellation requests pending review." textAr="لا توجد طلبات استرداد أو إلغاء معلقة للمراجعة." />
            ) : (
              <div className="gb-table-wrap" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Refund bookings */}
                {refundStudioBookings.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--gb-gold)", textTransform: "uppercase", marginBottom: "10px" }}>
                      <T en="Studio Bookings Refunds" ar="استرداد حجوزات الاستوديوهات" />
                    </h4>
                    <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={tableThStyle}><T en="Booking ID" ar="رقم الحجز" /></th>
                          <th style={tableThStyle}><T en="Studio" ar="الاستوديو" /></th>
                          <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                          <th style={tableThStyle}><T en="Amount" ar="المبلغ" /></th>
                          <th style={tableThStyle}><T en="Pre-Live Action" ar="إجراء الفحص" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {refundStudioBookings.map(b => (
                          <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={tableTdStyle}>#{b.id?.slice(0, 8)}</td>
                            <td style={tableTdStyle}>{b.studios?.name}</td>
                            <td style={tableTdStyle}>
                              <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                                {b.status?.toUpperCase()}
                              </span>
                            </td>
                            <td style={tableTdStyle}>{b.total_amount} SAR</td>
                            <td style={tableTdStyle}>
                              <button disabled style={disabledButtonStyle}>
                                <T en="Authorize Refund" ar="تفويض الاسترداد" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Refund Marketplace orders */}
                {refundMarketplaceOrders.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", color: "var(--gb-gold)", textTransform: "uppercase", marginBottom: "10px" }}>
                      <T en="Marketplace Orders Refunds" ar="استرداد طلبات السوق" />
                    </h4>
                    <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <th style={tableThStyle}><T en="Order ID" ar="رقم الطلب" /></th>
                          <th style={tableThStyle}><T en="Seller" ar="التاجر" /></th>
                          <th style={tableThStyle}><T en="Status" ar="الحالة" /></th>
                          <th style={tableThStyle}><T en="Amount" ar="المبلغ" /></th>
                          <th style={tableThStyle}><T en="Pre-Live Action" ar="إجراء الفحص" /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {refundMarketplaceOrders.map(o => (
                          <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={tableTdStyle}>#{o.id?.slice(0, 8)}</td>
                            <td style={tableTdStyle}>{o.profiles?.full_name}</td>
                            <td style={tableTdStyle}>
                              <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                                {o.status?.toUpperCase()}
                              </span>
                            </td>
                            <td style={tableTdStyle}>{o.total_amount} SAR</td>
                            <td style={tableTdStyle}>
                              <button disabled style={disabledButtonStyle}>
                                <T en="Authorize Refund" ar="تفويض الاسترداد" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

      {/* --- BLOCKERS TAB --- */}
      {activeTab === "blockers" && (
        <div className="animate-up gb-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>⚠️ <T en="Founder Self-Test Blocker watch" ar="مراقبة عوائق الفحص الذاتي للمؤسس" /></h3>
            <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
              {founderTestIssues.length} <T en="Active Issues" ar="عوائق نشطة" />
            </span>
          </div>

          <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
            <T 
              en="Track critical blockers raised during founder self-test execution sweeps. The blocker watch prevents production readiness signoff if any high or critical bugs are reported."
              ar="تتبع العوائق الحرجة التي تم تسجيلها أثناء عمليات الفحص الذاتي للمؤسس. تمنع لوحة المراقبة تأكيد جاهزية المنصة للإطلاق في حال وجود عوائق مسجلة."
            />
          </p>

          {founderTestIssues.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed rgba(0, 255, 136, 0.3)", background: "rgba(0, 255, 136, 0.02)", borderRadius: "16px" }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>✨</span>
              <h4 style={{ color: "#86efac", fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px" }}>
                <T en="All Clear — System Green" ar="النظام سليم بالكامل" />
              </h4>
              <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", margin: 0 }}>
                <T en="No self-test blocker tickets are currently active." ar="لا توجد تذاكر عوائق نشطة في الوقت الحالي." />
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {founderTestIssues.map(issue => (
                <div key={issue.id} style={{ border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.02)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                      <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", fontSize: "0.65rem", fontWeight: 800 }}>
                        {issue.severity?.toUpperCase()}
                      </span>
                      <span style={{ color: "var(--gb-text-muted)", fontSize: "0.75rem" }}>
                        {formatDate(issue.created_at)}
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "#FFF", marginBottom: "4px" }}>{issue.title}</strong>
                    <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", margin: 0 }}>{issue.description}</p>
                  </div>
                  
                  <span className="badge" style={{ background: "rgba(212,175,55,0.1)", color: "var(--gb-gold)", fontSize: "0.7rem" }}>
                    {issue.status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ACTION CHECKLIST TAB --- */}
      {activeTab === "checklist" && (
        <div className="animate-up" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* A. FOUNDER DEMO ACCOUNT SETUP & ROLE BINDINGS CARD */}
          <div className="gb-card animate-up" style={{ border: "1px solid rgba(212, 175, 55, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--gb-gold)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span>🔑</span>
                <T en="Founder Demo Account Setup & Role Bindings" ar="إعداد حسابات المطور التجريبية وربط الأدوار" />
              </h3>
              <span className="badge" style={{ background: "rgba(0, 255, 136, 0.1)", color: "#00ff88", border: "1px solid rgba(0, 255, 136, 0.25)" }}>
                <T en="Sandbox Readiness" ar="جاهزية بيئة التطوير" />
              </span>
            </div>

            <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", marginBottom: "24px", lineHeight: "1.5" }}>
              <T 
                en="Before starting the Founder Full-Journey Self-Test, prepare isolated local sandbox accounts for each separate platform role. Note: This card acts as a verification checklist. Real profiles are mapped directly using the database CLI during migrations, strictly preserving payment security boundaries."
                ar="قبل البدء بالفحص الذاتي لرحلة العميل الكاملة للمؤسس، قم بإعداد حسابات معزولة لكل دور في المنصة. ملاحظة: تعمل هذه البطاقة كقائمة تحقق للجاهزية. يتم تعيين الحسابات الحقيقية مباشرة باستخدام واجهة سطر الأوامر لقاعدة البيانات أثناء الهجرات."
              />
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={checklistGridStyle}>
                
                <ChecklistItem 
                  id="demo_customer_bind"
                  checked={checklist["demo_customer_bind"]}
                  onChange={toggleChecklistItem}
                  titleEn="Customer Sandbox Account Setup"
                  titleAr="إعداد حساب العميل التجريبي"
                  descEn="Verify local account customer@gearbeat.com is registered and bound to Customer Profile."
                  descAr="تأكد من تسجيل الحساب المحلي customer@gearbeat.com وربطه بملف العميل."
                />

                <ChecklistItem 
                  id="demo_owner_bind"
                  checked={checklist["demo_owner_bind"]}
                  onChange={toggleChecklistItem}
                  titleEn="Studio Owner Sandbox Account Setup"
                  titleAr="إعداد حساب صاحب الاستوديو التجريبي"
                  descEn="Verify local account owner@gearbeat.com is registered and bound to Studio Owner Profile."
                  descAr="تأكد من تسجيل الحساب المحلي owner@gearbeat.com وربطه بملف صاحب الاستوديو."
                />

                <ChecklistItem 
                  id="demo_vendor_bind"
                  checked={checklist["demo_vendor_bind"]}
                  onChange={toggleChecklistItem}
                  titleEn="Merchant / Vendor Sandbox Account Setup"
                  titleAr="إعداد حساب التاجر التجريبي"
                  descEn="Verify local account vendor@gearbeat.com is registered and bound to Vendor Profile."
                  descAr="تأكد من تسجيل الحساب المحلي vendor@gearbeat.com وربطه بملف التاجر."
                />

                <ChecklistItem 
                  id="demo_organizer_bind"
                  checked={checklist["demo_organizer_bind"]}
                  onChange={toggleChecklistItem}
                  titleEn="Event Organizer Sandbox Account Setup"
                  titleAr="إعداد حساب منظم الفعاليات التجريبي"
                  descEn="Verify local account organizer@gearbeat.com is registered and bound to Ticket Organizer Profile."
                  descAr="تأكد من تسجيل الحساب المحلي organizer@gearbeat.com وربطه بملف منظم الفعاليات."
                />

                <ChecklistItem 
                  id="demo_admin_bind"
                  checked={checklist["demo_admin_bind"]}
                  onChange={toggleChecklistItem}
                  titleEn="Super Admin Operator Account Setup"
                  titleAr="إعداد حساب مسؤول النظام الخارق"
                  descEn="Verify local account admin@gearbeat.com is bound to the Admin / Operator Profile."
                  descAr="تأكد من تسجيل الحساب المحلي admin@gearbeat.com وربطه بملف المسؤول."
                />

              </div>
            </div>
          </div>

          <div className="gb-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>📋 <T en="Admin Action Checklist" ar="قائمة مهام المسؤول" /></h3>
              <span className="badge-gold">{getChecklistProgress()}% <T en="Done" ar="مكتمل" /></span>
            </div>

            <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
              <T 
                en="This interactive checklist guides you through all founder self-test operational sweeps. Checking off items saves your progress locally in the browser."
                ar="ترشدك قائمة المهام التفاعلية هذه خلال عمليات الفحص الذاتي للمؤسس. تحديد المهام يحفظ تقدمك محليًا في المتصفح."
              />
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Category 1 */}
              <div>
                <h4 style={checklistCategoryStyle}>
                  <T en="1. Core Setup & Roles" ar="1. الإعداد الأساسي والأدوار" />
                </h4>
                <div style={checklistGridStyle}>
                  <ChecklistItem 
                    id="user_roles"
                    checked={checklist["user_roles"]}
                    onChange={toggleChecklistItem}
                    titleEn="Verify Super Admin Role Setup"
                    titleAr="التحقق من إعداد دور المسؤول الخارق"
                    descEn="Verify that the platform has designated admin users matching local config records."
                    descAr="تأكد من مطابقة مستخدمي المسؤول في المنصة لسجلات الإعداد المحلية."
                  />
                  <ChecklistItem 
                    id="customer_signup"
                    checked={checklist["customer_signup"]}
                    onChange={toggleChecklistItem}
                    titleEn="Register Customer Self-Test Profile"
                    titleAr="تسجيل ملف عميل تجريبي"
                    descEn="Complete registration sweep for a test customer account in the customer module."
                    descAr="أكمل تسجيل حساب عميل تجريبي لاختبار مسار رحلة العميل."
                  />
                  <ChecklistItem 
                    id="vendor_signup"
                    checked={checklist["vendor_signup"]}
                    onChange={toggleChecklistItem}
                    titleEn="Register Test Marketplace Vendor"
                    titleAr="تسجيل تاجر متجر تجريبي"
                    descEn="Validate vendor registration intake without active corporate bank attachments."
                    descAr="تحقق من عملية تسجيل التاجر دون طلب إرفاق المستندات البنكية الحية."
                  />
                  <ChecklistItem 
                    id="studio_signup"
                    checked={checklist["studio_signup"]}
                    onChange={toggleChecklistItem}
                    titleEn="Register Test Studio Space"
                    titleAr="تسجيل استوديو تجريبي"
                    descEn="Submit a studio registration lead application flow and verify admin approval queue."
                    descAr="أرسل طلب انضمام استوديو تجريبي وتحقق من ظهوره في طابور الموافقات الإدارية."
                  />
                </div>
              </div>

              {/* Category 2 */}
              <div>
                <h4 style={checklistCategoryStyle}>
                  <T en="2. Bookings & E-Commerce" ar="2. الحجوزات والتجارة الإلكترونية" />
                </h4>
                <div style={checklistGridStyle}>
                  <ChecklistItem 
                    id="booking_simulation"
                    checked={checklist["booking_simulation"]}
                    onChange={toggleChecklistItem}
                    titleEn="Simulate Studio Reservation Flow"
                    titleAr="محاكاة عملية حجز استوديو"
                    descEn="Book a studio room seat slot and verify that it appears inside the booking review queue in unpaid status."
                    descAr="احجز فترة استوديو وتحقق من ظهورها في طابور الحجوزات المعلقة غير المدفوعة."
                  />
                  <ChecklistItem 
                    id="manual_payment_audit"
                    checked={checklist["manual_payment_audit"]}
                    onChange={toggleChecklistItem}
                    titleEn="Simulate Manual payment safety audit"
                    titleAr="محاكاة تدقيق أمان الدفع اليدوي"
                    descEn="Review bookings needing manual payment authorization without executing live invoice mutations."
                    descAr="راجع الحجوزات التي تتطلب تأكيد دفع يدوي دون تعديل فواتير حية."
                  />
                  <ChecklistItem 
                    id="catalog_draft"
                    checked={checklist["catalog_draft"]}
                    onChange={toggleChecklistItem}
                    titleEn="Create Draft Marketplace Product"
                    titleAr="إنشاء مسودة منتج في المتجر"
                    descEn="Create a placeholder marketplace product under a test vendor profile."
                    descAr="أنشئ منتجًا تجريبيًا في المتجر تحت ملف التاجر التجريبي."
                  />
                  <ChecklistItem 
                    id="marketplace_checkout"
                    checked={checklist["marketplace_checkout"]}
                    onChange={toggleChecklistItem}
                    titleEn="Complete Marketplace Checkout Flow"
                    titleAr="إتمام شراء من المتجر"
                    descEn="Complete order checkout simulation and verify invoice order generation in the queue."
                    descAr="أتمم محاكاة شراء منتج وتحقق من إنشاء الفاتورة في طابور الطلبات المعلقة."
                  />
                </div>
              </div>

              {/* Category 3 */}
              <div>
                <h4 style={checklistCategoryStyle}>
                  <T en="3. Services & Academy" ar="3. الخدمات والأكاديمية" />
                </h4>
                <div style={checklistGridStyle}>
                  <ChecklistItem 
                    id="service_listing"
                    checked={checklist["service_listing"]}
                    onChange={toggleChecklistItem}
                    titleEn="Verify Service Booking Queue"
                    titleAr="التحقق من طابور حجوزات الخدمات"
                    descEn="Verify that third-party equipment tuning or consultant bookings populate correctly."
                    descAr="تأكد من ظهور حجوزات صيانة المعدات أو الاستشارات في طابور مراجعة الخدمات."
                  />
                  <ChecklistItem 
                    id="event_ticket"
                    checked={checklist["event_ticket"]}
                    onChange={toggleChecklistItem}
                    titleEn="Verify Event Ticket Purchases"
                    titleAr="التحقق من شراء تذاكر الفعاليات"
                    descEn="Ensure that event ticketing checkouts map to ticket_orders lists without SQL conflicts."
                    descAr="تأكد من تسجيل شراء تذاكر الفعاليات في قائمة الطلبات دون أي تعارض."
                  />
                  <ChecklistItem 
                    id="academy_lesson"
                    checked={checklist["academy_lesson"]}
                    onChange={toggleChecklistItem}
                    titleEn="Verify Academy Lesson review"
                    titleAr="التحقق من مراجعة دروس الأكاديمية"
                    descEn="Submit academy lesson draft listings and verify that attendance capacities are enforced."
                    descAr="أرسل مسودة درس أكاديمية وتأكد من الالتزام بالسعة الاستيعابية المحددة للحضور."
                  />
                </div>
              </div>

              {/* Category 4 */}
              <div>
                <h4 style={checklistCategoryStyle}>
                  <T en="4. Safety & Reconciliation" ar="4. الأمان والمطابقة المالية" />
                </h4>
                <div style={checklistGridStyle}>
                  <ChecklistItem 
                    id="refund_reconciliation"
                    checked={checklist["refund_reconciliation"]}
                    onChange={toggleChecklistItem}
                    titleEn="Verify Refund & Cancellation Queue"
                    titleAr="التحقق من طابور الاسترداد والإلغاء"
                    descEn="Audit the cancellation pipelines to ensure refund requests map to the isolated safety queue."
                    descAr="راجع مسارات الإلغاء للتأكد من توجيه طلبات الاسترداد إلى طابور الأمان المعزول."
                  />
                  <ChecklistItem 
                    id="reconcile_ledger"
                    checked={checklist["reconcile_ledger"]}
                    onChange={toggleChecklistItem}
                    titleEn="Reconcile Pre-Live Ledger Points"
                    titleAr="مطابقة نقاط المحفظة التجريبية"
                    descEn="Ensure points ledger reasons safely allocate points to customer wallets under review."
                    descAr="تأكد من إمكانية تخصيص نقاط الولاء لمحفظة العميل وتدقيقها بأمان."
                  />
                  <ChecklistItem 
                    id="db_log_run"
                    checked={checklist["db_log_run"]}
                    onChange={toggleChecklistItem}
                    titleEn="Log Founder Self-Test Run"
                    titleAr="تسجيل جولة فحص ذاتي"
                    descEn="Mark self-test sweeps completed successfully in local workspace validation logs."
                    descAr="سجل نجاح جولة الفحص الذاتي واكتمالها في سجلات التحقق المحلية."
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- QUICK LINKS BACK TO ADMIN DASHBOARD --- */}
      <section className="animate-up" style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--gb-border)", paddingTop: "24px" }}>
        <Link href="/admin" className="gb-text-link" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          ← <T en="Back to Platform Command Center" ar="العودة إلى مركز التحكم بالمنصة" />
        </Link>
        <span style={{ color: "var(--gb-text-muted)", fontSize: "0.75rem" }}>
          GearBeat Admin V2.0.0
        </span>
      </section>

    </main>
  );
}

// Sub-components for clean structure

interface TabButtonProps {
  id: string;
  labelEn: string;
  labelAr: string;
  activeId: string;
  onClick: (id: string) => void;
  icon: string;
  count?: number;
  progress?: number;
}

function TabButton({ id, labelEn, labelAr, activeId, onClick, icon, count, progress }: TabButtonProps) {
  const active = activeId === id;
  return (
    <button 
      onClick={() => onClick(id)} 
      style={{
        background: active ? "rgba(207, 168, 110, 0.08)" : "transparent",
        color: active ? "var(--gb-gold)" : "var(--gb-text-muted)",
        border: "none",
        borderBottom: active ? "2px solid var(--gb-gold)" : "2px solid transparent",
        padding: "12px 18px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: 700,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <span>{icon}</span>
      <T en={labelEn} ar={labelAr} />
      {count !== undefined && count > 0 && (
        <span style={{ 
          background: active ? "var(--gb-gold)" : "rgba(255,255,255,0.08)", 
          color: active ? "#000" : "#FFF", 
          fontSize: "10px", 
          padding: "2px 6px", 
          borderRadius: "10px",
          fontWeight: 800
        }}>
          {count}
        </span>
      )}
      {progress !== undefined && (
        <span style={{ 
          fontSize: "10px", 
          color: active ? "var(--gb-gold-light)" : "var(--gb-text-muted)"
        }}>
          ({progress}%)
        </span>
      )}
    </button>
  );
}

function MetricCard({ labelEn, labelAr, value, icon, color }: { labelEn: string; labelAr: string; value: number; icon: string; color: string }) {
  return (
    <div className="gb-dash-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div className="gb-eyebrow" style={{ fontSize: "0.65rem", margin: 0 }}>
          <T en={labelEn} ar={labelAr} />
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#FFF", marginTop: "8px" }}>
          {value}
        </div>
      </div>
      <div style={{ 
        width: "50px", 
        height: "50px", 
        background: `rgba(255,255,255,0.02)`, 
        border: `1px solid rgba(255,255,255,0.05)`,
        borderRadius: "12px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: "1.5rem" 
      }}>
        {icon}
      </div>
    </div>
  );
}

function ChecklistOverviewItem({ done, labelEn, labelAr }: { done: boolean; labelEn: string; labelAr: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ color: done ? "#00ff88" : "var(--gb-text-muted)", fontSize: "0.9rem" }}>
        {done ? "✓" : "○"}
      </span>
      <span style={{ 
        fontSize: "0.8rem", 
        color: done ? "rgba(255,255,255,0.9)" : "var(--gb-text-muted)",
        textDecoration: done ? "line-through" : "none",
        textDecorationColor: "rgba(255,255,255,0.2)"
      }}>
        <T en={labelEn} ar={labelAr} />
      </span>
    </div>
  );
}

function RealEmptyState({ textEn, textAr }: { textEn: string; textAr: string }) {
  return (
    <div style={{ 
      padding: "40px 20px", 
      textAlign: "center", 
      background: "rgba(0,0,0,0.15)", 
      border: "1px dashed rgba(212,175,55,0.1)", 
      borderRadius: "12px" 
    }}>
      <p style={{ color: "var(--gb-text-muted)", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
        🔍 <T en="No live operations yet" ar="لا توجد عمليات نشطة في الوقت الحالي" />
      </p>
      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", display: "block", marginTop: "6px" }}>
        <T en={textEn} ar={textAr} />
      </span>
    </div>
  );
}

interface ChecklistItemProps {
  id: string;
  checked: boolean;
  onChange: (id: string) => void;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}

function ChecklistItem({ id, checked, onChange, titleEn, titleAr, descEn, descAr }: ChecklistItemProps) {
  return (
    <div 
      onClick={() => onChange(id)}
      style={{ 
        border: checked ? "1px solid rgba(0, 255, 136, 0.25)" : "1px solid rgba(255,255,255,0.05)",
        background: checked ? "rgba(0, 255, 136, 0.02)" : "rgba(0,0,0,0.1)",
        padding: "16px", 
        borderRadius: "12px", 
        cursor: "pointer",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        transition: "all 0.2s ease-in-out"
      }}
    >
      <div style={{ 
        width: "20px", 
        height: "20px", 
        borderRadius: "4px", 
        border: checked ? "2px solid #00ff88" : "2px solid var(--gb-text-muted)", 
        background: checked ? "#00ff88" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2px",
        flexShrink: 0
      }}>
        {checked && <span style={{ color: "#000", fontWeight: 900, fontSize: "12px" }}>✓</span>}
      </div>
      <div>
        <strong style={{ 
          display: "block", 
          fontSize: "0.9rem", 
          color: checked ? "#FFF" : "#e2e8f0",
          textDecoration: checked ? "line-through" : "none",
          textDecorationColor: "rgba(255,255,255,0.3)"
        }}>
          <T en={titleEn} ar={titleAr} />
        </strong>
        <p style={{ 
          color: "var(--gb-text-muted)", 
          fontSize: "0.8rem", 
          margin: "4px 0 0 0",
          lineHeight: 1.4
        }}><T en={descEn} ar={descAr} /></p>
      </div>
    </div>
  );
}

// Styling Constants
const tableThStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "0.75rem",
  color: "var(--gb-text-muted)",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tableTdStyle: React.CSSProperties = {
  padding: "16px",
  fontSize: "0.85rem",
  color: "#FFF"
};

const disabledButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "0.7rem",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.3)",
  cursor: "not-allowed"
};

const checklistCategoryStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 800,
  color: "var(--gb-gold)",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
  borderLeft: "2px solid var(--gb-gold)",
  paddingLeft: "8px"
};

const checklistGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px"
};
