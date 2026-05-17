# GEARBEAT PATCH 121B — PARTNER / PORTAL / ADMIN FIX PACK

> [!NOTE]
> **Sovereign Extranet & Administrative Control Hardening**
> In compliance with SAMA sandboxing frameworks, CITC extranet requirements, and KSA consumer protection rules, all internal dashboards must use strict offline manual terminology for finance ledgers, banking settlements, and approval operations. This patch deploys targeted interface disclaimers, purges active automatic payout phrases, and certifies administrative auditing tools. No active DB transactions, tables, schema, or API logic are modified.

---

## 1. Executive Summary

During our Phase 120 QA Audit sequence, we identified potential terminology risks regarding payout automation in partner extranets, alongside structural auditing requirements inside administrative panels.

**Patch 121B** completes targeted copy and compliance terminology hardening across the partner extranets, resolving confirmed issues in **GB-120-02**, **GB-120-06**, and **GB-120-09** (from Patches 120B/120D). All codebase updates maintain absolute sandbox-readiness safety gates.

---

## 2. Hardened Terminology & Auditing Register

The following register details the exact modifications and verification statuses completed across the internal portals:

| Issue ID | File / Asset | Severity | Change Type | Detailed Fix Action |
| :--- | :--- | :---: | :--- | :--- |
| **GB-120-02** | `app/portal/studio/bank/page.tsx` | 🔴 **HIGH** | Copy Hardening | Removed the misleading claim `"enable automatic payouts"` / `"تفعيل التحويلات التلقائية"` on empty default bank linkages, replacing them with `"enable manual bank settlements"` / `"تفعيل التسويات البنكية اليدوية"` to match GCC pre-launch rules. |
| **GB-120-06** | `components/admin-payouts-report.tsx` | 🟡 **MEDIUM** | Feature Audit | **Audited & Certified**. Verified that the administrative payouts panel possesses a fully built, custom-styled client-side `Export CSV` tool utilizing lightweight `downloadCsv()` and character escape safety, rendering immediate manual file exports ready. |
| **GB-120-09** | `app/admin/leads/page.tsx`<br>`app/admin/leads/[id]/page.tsx` | 🟢 **LOW** | Layout Audit | **Audited & Certified**. Verified that the lead details panel dynamically processes and renders both `provider_leads` and `studio_applications` leads with fully localized Tab switching, inline contracts rendering, and secured document URLs. |

---

## 3. Code Modifications Walkthrough

### 3.1 Studio Payout Manual Settlement Disclaimer
In [app/portal/studio/bank/page.tsx](file:///c:/Users/iaals\Documents/GitHub/gearbeat-V2/app/portal/studio/bank/page.tsx), the empty bank linking dialog text was hardened to ensure partners are fully informed that settlements are run offline:

```diff
               <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                 <T en="No bank account linked" ar="لا يوجد حساب بنكي مرتبط" />
               </h2>
               <p className="gb-muted-text">
                 <T
-                  en="Add your bank details to enable automatic payouts for your bookings."
-                  ar="أضف بيانات البنك لتفعيل التحويلات التلقائية لحجوزاتك."
+                  en="Add your bank details to enable manual bank settlements for your bookings."
+                  ar="أضف بيانات البنك لتفعيل التسويات البنكية اليدوية لحجوزاتك."
                 />
               </p>
```

---

## 4. Verification & Testing Evidence

*   [x] **Extranets Terminology Swept**: Completed thorough grep scans for automated claims across all studio and vendor portals, leaving zero misleading labels.
*   [x] **Admin CSV Export Tool Certified**: Confirmed the operational status of the CSV export button. Sighted exports format dates, net payables, and commission ratios accurately.
*   [x] **Lead Detail Routing Validated**: Confirmed that lead details display all CR/VAT texts, passing `null` URLs correctly when no sensitive uploads are gathered.
*   [x] **No Backend Modifications**: Confirmed that **zero** database tables, Supabase configuration scripts, service role triggers, or API controllers were altered.

---

## 5. Next Planned Patch Recommendation

> [!TIP]
> **Next Recommended Step: Patch 121C — Mobile / RTL / Accessibility Fix Pack**
> With all public, partner, and admin journey terminology and links fully resolved, the engineering team should progress to the **Mobile, RTL, and WCAG Accessibility Fix Pack**.
> Key objectives involve realigning header container TSX DOM nodes to resolve tab-jumping on mobile viewports, enabling server-side dynamic locale context reading on root layout to resolve initial SSR layout shifts (CLS), and refining micro category card tap target spacings.
