# GEARBEAT PATCH 59A — GLOBAL UX/UI PAGE QUALITY AUDIT PLAN

## 1. Phase 59 Overview
This document initiates **Phase 59: UX/UI Quality, Filters & Legal Readiness Foundation**. As GearBeat transitions toward a production-ready state, this phase focuses on standardizing the user interface, ensuring global consistency of the dark/gold premium identity, finalizing responsive layouts, implementing missing UI components (e.g., filters), and establishing the foundation for essential legal and policy pages. 

**Safety Boundary:** This patch establishes the audit and roadmap only. No UI components, application logic, or API integrations are modified in this patch.

---

## 2. Current UX/UI Risk Areas
- **Inconsistent Filtering:** `app/studios` and `app/marketplace` lack unified, mobile-friendly advanced filter sidebars or drawers.
- **Missing Legal Pages:** `/terms`, `/privacy`, and `/refunds` are either empty or lack standardized premium styling.
- **RTL/LTR Anomalies:** Certain deeply nested flexbox/grid alignments may break or overflow when switched to Arabic.
- **Responsive Overflow:** Admin and Partner dashboard tables/grids may lack proper horizontal scrolling or stacking on mobile viewports.

---

## 3. Public Website Page Audit Checklist
- [ ] `/` (Home): Hero section responsive text scaling, section padding consistency, trust badge alignment.
- [ ] `/about`: Brand messaging alignment, dark/gold gradient consistency.
- [ ] Header/Footer: Mobile navigation drawer behavior, language toggle accessibility, logo scaling.

---

## 4. Studio Discovery and Booking Journey Audit Checklist
- [ ] `/studios`: Grid layout on mobile (1-col vs 2-col), price display consistency, badge overflow handling.
- [ ] `/studios/[slug]`: Sticky booking widget behavior on mobile vs desktop, image gallery swipeability, rich text rendering for studio descriptions.
- [ ] Booking Flow: Date/time picker touch targets, checkout summary layout in RTL.

---

## 5. Marketplace Page Audit Checklist
- [ ] `/marketplace`: Product card height uniformity, `OutOfStock` badge visibility, vendor name truncation.
- [ ] `/marketplace/products/[slug]`: Image carousel responsiveness, "Add to Cart" sticky behavior on mobile.
- [ ] Cart/Checkout: Line item summary layout, price alignment (LTR vs RTL).

---

## 6. Ticketing Page Audit Checklist
- [ ] `/tickets`: Experience card grid spacing, "Coming Soon" badge visibility.
- [ ] Upcoming Check: Future layout planning for interactive seat maps and QR ticket displays.

---

## 7. Customer Rewards Page Audit Checklist
- [ ] `/customer/rewards`: Points ledger table responsiveness, Tier progress bar visualization, Mobile wallet readiness card alignment.

---

## 8. Partner/Extranet Page Audit Checklist
- [ ] `/partner`: Architecture grid alignment on mobile.
- [ ] `/partner/tickets`: Event lifecycle management grid spacing.
- [ ] `/portal/studio` & `/portal/store`: Calendar touch targets, inventory table horizontal scroll capability.

---

## 9. Admin Dashboard Page Audit Checklist
- [ ] `/admin/*`: Sidebar collapse behavior on tablets, data table overflow, pagination control accessibility.
- [ ] `/admin/loyalty`: Planning cards grid consistency, badge alignments.

---

## 10. Arabic/English and RTL/LTR QA Checklist
- [ ] Verify all absolute positioning swaps (`left` to `right`).
- [ ] Verify flex directions (`flex-row` implicitly reversing, margins `ml` vs `mr` converting to `ms` vs `me`).
- [ ] Verify font weights (Arabic fonts may require different weights for legibility).
- [ ] Verify translation completeness using the `<T />` component.

---

## 11. Mobile Responsive QA Checklist
- [ ] Touch targets are at least 44x44px.
- [ ] No horizontal scrolling on the `<body>` element.
- [ ] Modals and dialogs are fully visible and dismissible on small screens (e.g., iPhone SE).
- [ ] Font sizes scale appropriately (minimum 16px for readable body text on mobile).

---

## 12. Premium Dark/Gold Identity QA Checklist
- [ ] Consistent use of `var(--gb-gold)` and `var(--bg-gradient)`.
- [ ] No unstyled native browser alerts or basic `<select>` dropdowns.
- [ ] Subtle hover animations (transform, opacity) present on interactive elements.
- [ ] Consistent border radii (e.g., 12px or 16px for cards, 8px for buttons).

---

## 13. Filters Readiness Audit Notes
- **Requirement:** A unified Filter architecture is needed for Studios and Marketplace.
- **Desktop:** Left-hand sidebar or top bar dropdowns.
- **Mobile:** Bottom sheet / modal drawer triggered by a sticky "Filters" button.
- **State:** Must reflect URL search parameters (`?category=...&price=...`) for shareability.

---

## 14. Legal Pages Readiness Notes
- **Requirement:** Standardized layouts for Privacy Policy, Terms of Service, Vendor Agreement, and Refund Policy.
- **Structure:** Clean typography, clear headings, Last Updated timestamps, and easily navigable table of contents.

---

## 15. API/External Integration Public-Readiness Notes
- Ensure that any future-state features (e.g., Stripe, SendGrid, Apple Wallet) have clear "Planning Phase" badges if their UI represents unbuilt functionality.
- Verify loading states and skeletons are premium and don't cause layout shifts (CLS).

---

## 16. Priority Scoring System
- **Critical:** Broken layouts, unreadable text, broken navigation, or missing translations preventing core tasks.
- **High:** Inconsistent branding, poor mobile responsive tables, or misaligned critical buttons.
- **Medium:** Minor padding issues, missing hover states, or non-critical un-translated microcopy.
- **Low:** Nice-to-have visual polishes or subtle animation improvements.

---

## 17. Recommended Grouped Patches for Phase 59
- **59B Filters Readiness:** Establish UI for advanced filtering in Studios & Marketplace.
- **59C Legal Pages Readiness:** Create/style foundational legal and policy pages.
- **59D Page Polish & Visual QA:** Execute the fixes identified in this audit.
- **59E External API/Public Integration Readiness:** Document and finalize UI integration points for 3rd party services.
- **59F Phase Closeout & QA:** Final review and documentation of Phase 59.

---

## 18. Explicit Implementation Boundaries
- **No Refactoring Live Logic:** This phase focuses on the View layer. Controllers, Server Actions, and API routes must remain untouched.
- **No Database Changes:** No SQL, RLS, or migrations will be introduced.
- **No New Dependencies:** Do not add new UI libraries unless explicitly vetted (e.g., `framer-motion` if required, but standard CSS is preferred).
- **Documentation Only (Patch 59A):** This specific patch creates this plan. Subsequent patches will execute the UI updates.
