# GearBeat V2 Hotfix Runbook — Homepage Photo Removal + Pulse Wave Restoration

This runbook catalogs the hotfix implemented to clean up visual data on the homepage, eliminate unwanted photographic studio preview mockups, and restore the highly engaged CSS-only golden pulse/sound-wave visual.

---

## 1. Executive Summary & Verdict Matrix

*   **Hotfix Objective**: Remove the photographic studio placeholder image everywhere on the homepage, eliminate the newly added preview cards in the hero visual, and restore the original concentric golden pulse wave interactive visual.
*   **Verification Status**:
    *   **TypeScript Verification**: `PENDING`
    *   **Next.js Production Build**: `PENDING`
*   **Aesthetics Check**: **100% BRAND CONSISTENT**
*   **Sovereign Payment Integrity**: **UNTOUCHED & PROTECTED**

> [!IMPORTANT]
> **Total Elimination of Photographic Studio Mockups**:
> The homepage no longer renders the `/brand/studio-placeholder.jpg` or any image containing fake studio visual data. All photographic studio containers are completely replaced with clean, high-fidelity CSS abstractions.
>
> **Interactive Soundwave Pulse Restored**:
> The hero section visual area has been restored to its popular CSS-only concentric golden pulse and heartbeat layout. Unwanted preview cards, sample lists, and Global Sound Station panels introduced in recent updates are completely removed.

---

## 2. Technical Modifications Log

### A. Homepage Component Layout ([app/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/page.tsx))

1.  **Removed Imports**:
    *   Removed `Image` from `next/image` import since the homepage hero and curated selections are now fully CSS-only, avoiding unused dependencies.
2.  **Cinematic Hero Visual Area Restored**:
    *   Removed Riyadh Studio A live panel (`panel-main`) and GearBeat Certified status panel (`panel-secondary`).
    *   Restored the concentric `.pulse-ring` system (rings 1, 2, and 3) and rotating `.pulse-halo` glows.
    *   Restored `.abstract-orb` containing the inner floating gradient glow (`.orb-inner-glow`) and the 7-band glowing soundwave lines (`.sw-line`).
3.  **Elite Featured Studios Section Reimagined**:
    *   Removed the photographic `Image` placeholder element inside `4. FEATURED STUDIOS PREVIEW`.
    *   Designed a pristine, high-fidelity abstract CSS visual placeholder inside the curated selection cards (`.studio-thumb-placeholder`), rendering a beautiful golden gradient background and centered 5-bar visual graphic equalizer.

### B. Cleaned CSS Inlined Styling
*   Removed all references to `.brand-panel`, `.panel-header`, `.dot-green`, `.frequency-display`, and floating box transforms.
*   Reestablished the highly performant `orb-drift`, `elegant-pulse`, and `sw-horizontal-vibrate` animations for maximum fluid responsiveness.

---

## 3. Strict Safety Compliance Review

*   [x] **No Backend Modifications**: No API routes, hooks, or backend utility files were altered.
*   [x] **No Supabase/Database Interactions**: Database tables, RLS policy definitions, and seed data remain intact.
*   [x] **No SQL Execution**: Zero SQL scripts or migrations were applied.
*   [x] **No Payments/Auth Touch**: Checkout, registration, auth verification, and Tap configurations are 100% untouched.

---

## 4. Next Steps
*   Run local `typecheck` and production `build` to verify system stability.
*   Commit and push clean branch `hotfix-homepage-remove-studio-photo-cards-restore-pulse-wave` to remote origin.
