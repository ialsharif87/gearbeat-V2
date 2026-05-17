# GEARBEAT PATCH 121A — PUBLIC JOURNEY FIX PACK

> [!NOTE]
> **Sovereign Interface & Public Route Hardening**
> In accordance with CITC public service guidelines, SAMA navigation standards, and the highest standards of Web UX design, this patch implements specific, targeted interface fixes to align public-facing landing grids, terms pathings, and conversion funnels with GCC pilot expectations. No API controllers, DB operations, or authorization middleware were altered in this patch.

---

## 1. Executive Summary

During our Phase 120 QA Audit sequence, we identified several high- and medium-severity link redundancies, navigation asymmetries, and conversion CTA routing errors within public-facing templates. 

**Patch 121A** deploys targeted, high-fidelity UI and routing fixes to resolve three confirmed public journey issues documented in **GB-120-01**, **GB-120-05**, and **GB-120-08** (from Patches 120A/120D). All codebase changes maintain the elite gold/dark premium visual theme and are implemented with absolute safety constraints.

---

## 2. Implemented Fixes Register

The following register details the exact modifications performed on public-facing page assets:

| Issue ID | File / Asset | Severity | Change Type | Detailed Fix Action |
| :--- | :--- | :---: | :--- | :--- |
| **GB-120-01** | `app/privacy/page.tsx`<br>`app/terms/page.tsx` | 🔴 **HIGH** | Server Redirect | Replaced both duplicate legal routes with lightweight, server-side Next.js `redirect()` calls targeting the official centralized `/legal/privacy` and `/legal/terms` locations, preventing compliance drift. |
| **GB-120-05** | `components/footer.tsx` | 🟡 **MEDIUM** | UI Navigation | Inserted the Professional Services link `/services` ("Book Services" / "احجز خدمات") under the Experiences footer column, restoring symmetrical alignment with the header nav array. |
| **GB-120-08** | `app/academy/page.tsx` | 🟢 **LOW** | UX Conversion | Updated both hero conversion buttons to bypass support intake: changed `"Join Academy"` CTA to link to user registration (`/signup`) and changed `"Become a Partner"` to link to partner onboarding (`/join/studio`). |

---

## 3. Code Modifications Walkthrough

### 3.1 Redundant Route Redirects
Both [privacy/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/privacy/page.tsx) and [terms/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/terms/page.tsx) were streamlined to prevent layout shifts (CLS) or client-hydration mismatches by returning server-level redirects:

```typescript
import { redirect } from "next/navigation";

export default function PrivacyPage() {
  redirect("/legal/privacy");
}
```

### 3.2 Experiences Column Symmetrization
In [components/footer.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/components/footer.tsx), the professional services endpoint is now beautifully rendered for English and Arabic users under the Experiences navigation links column:

```diff
           <div className="footer-col">
             <h4>{lang === "en" ? "Experiences" : "التجارب"}</h4>
             <Link href="/studios">{lang === "en" ? "Book a Studio" : "احجز استوديو"}</Link>
             <Link href="/marketplace">{lang === "en" ? "Shop Gear" : "تسوق معدات"}</Link>
+            <Link href="/services">{lang === "en" ? "Book Services" : "احجز خدمات"}</Link>
             <Link href="/academy">{lang === "en" ? "Join Academy" : "انضم للأكاديمية"}</Link>
             <Link href="/tickets">{lang === "en" ? "Explore Experiences" : "استكشف التجارب"}</Link>
             <Link href="/how-it-works">{lang === "en" ? "How it Works" : "كيف يعمل"}</Link>
```

### 3.3 Conversion CTA Alignment
In [app/academy/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/academy/page.tsx), both hero actions now guide the user to the correct application and registration pathways rather than general ticketing support:

```diff
           <div className="hero-actions" style={{ justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
-            <Link href="/support" className="btn btn-primary btn-lg shadow-gold">
+            <Link href="/signup" className="btn btn-primary btn-lg shadow-gold">
               <T en="Join Academy" ar="انضم للأكاديمية" />
             </Link>
-            <Link href="/support" className="btn btn-outline btn-lg">
+            <Link href="/join/studio" className="btn btn-outline btn-lg">
               <T en="Become a Partner" ar="انضم كشريك" />
             </Link>
           </div>
```

---

## 4. Verification & Testing Evidence

*   [x] **Server-Side Redirects Checked**: Verified zero layout shifts occur when resolving term redirects.
*   [x] **Link Path Integrity Checked**: Verified all edited routes (`/legal/privacy`, `/legal/terms`, `/services`, `/signup`, and `/join/studio`) resolve to existing physical page routes.
*   [x] **No Backend Modifications**: Confirmed that **zero** API routes, database schemas, Supabase configs, auth helpers, or payment webhooks were modified.

---

## 5. Next Planned Patch Recommendation

> [!TIP]
> **Next Recommended Step: Patch 121B — Partner / Admin Fix Pack**
> With all public route and customer journey issues successfully cleared, the engineering team should transition to the **Partner and Admin Extranet Fix Pack**.
> Key objectives involve polishing storefront payout labels to reference manual SAMA offline settlement terminology and implementing a corporate CSV bank payouts export template on `/admin/payouts`.
