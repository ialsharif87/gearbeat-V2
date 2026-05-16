# Patch 108L — Public Launch Visual QA Checklist

## Overview
This document outlines the mandatory **Public Launch Visual QA Checklist** required to sign off on the public-facing pages of the GearBeat V2 platform. Running this audit guarantees that our premium brand identity is preserved, assets deliver outstanding performance, and the user conversion experience is seamless across all supported devices and languages prior to invite-only cohort activation.

---

## 1. Public Route QA Checklist
Verify each of the following public routes locally and on staging for design, content, and translation integrity:

- [ ] **Homepage (`/`)**:
  * Check LCP banner element formatting.
  * Verify brand copy layout on both LTR (English) and RTL (Arabic) alignments.
- [ ] **Studios Discovery (`/studios`)**:
  * Check studio card listings and search preview chips.
  * Ensure the filter sidebar adjusts cleanly without clipping on smaller displays.
- [ ] **Services & Extranet Overview (`/services`)**:
  * Verify that booking/extranet marketing blocks display correct badges.
  * Check CTA links pointing to partner signups.
- [ ] **Ticketing & Events (`/tickets`)**:
  * Confirm active ticketing status and event details load cleanly.
- [ ] **Academy Lessons (`/academy`)**:
  * Check online lesson grids and legal positioning banners.
- [ ] **Marketplace Product Grid (`/marketplace`)**:
  * Confirm that first-fold images load priority assets smoothly.
  * Check category toggle lists.
- [ ] **GearBeat Certified Trust Page (`/gearbeat-certified`)**:
  * Verify trusted badges list, vendor vetting criteria copy, and pilot certification status.
- [ ] **Partner Landing page (`/partner`)**:
  * Confirm onboarding CRM forms, terms checklists, and CTA redirection routes.

---

## 2. Navigation Header & Footer Checks
- [ ] **Header System**:
  * Verify the language toggle switcher active state highlights the active translation.
  * Ensure the shopping cart badge handles item counters in real-time.
  * Check responsive mobile menu burger toggling.
- [ ] **Footer System**:
  * Verify all social icons, copyright lines, and legal links (Terms of Service, Privacy Policy) point to correct paths.
  * Confirm dark/gold logo dimensions remain unwarped.

---

## 3. Brand & Visual Consistency Checks (Dark & Gold Identity)
- [ ] **Color Palette Compliance**:
  * Confirm backgrounds strictly render `#0B0F16` (Deep Obsidian).
  * Confirm cards strictly render `#0F1621` or `#151C29` on hover.
  * Verify all core borders match `var(--gb-border)` (rgba gold accents).
- [ ] **Premium Typography**:
  * Ensure English routes use the *Space Grotesk* font.
  * Ensure Arabic routes use the *Cairo* font.
  * No standard default system serif/sans-serif fonts should load in place of premium type.
- [ ] **Micro-animations**:
  * Verify card scaling, translation transitions, and premium hover glow animations are active and fluid.

---

## 4. Arabic/English Copy & Copy-Safe Layouts
- [ ] **Directional Layouts (RTL / LTR)**:
  * Ensure `dir="rtl"` is applied properly on `<html>` and body elements when switching to Arabic.
  * Verify columns and text alignments invert symmetrically (e.g., label text-align, margins, icon positions).
- [ ] **Bilingual Consistency**:
  * Check that no fallback or empty texts display on translation toggle.
  * Ensure terms and certificates have translated alternatives.

---

## 5. Mobile Responsive Visual Audit
- [ ] **Viewport Grids**:
  * Verify grids (`grid-2`, `grid-3`, `grid-4`) correctly stack into single/double column configurations on screen widths $< 768px$.
- [ ] **Tap Target Sizes**:
  * Ensure all CTAs, buttons, and input fields offer a minimum **44px x 44px** tap target to optimize mobile interactions.
- [ ] **Clutter Reduction**:
  * Verify decorative ornaments or large background visuals hide cleanly on mobile screen formats (`hide-app` class audit).

---

## 6. Image Loading & Asset Audits
- [ ] **Next.js Image Substitution**:
  * Confirm no standard native `<img>` tags are present in modified views; all must use `<Image>` with correct responsive sizing constraints (`sizes`).
- [ ] **CLS Prevention**:
  * Ensure parent image container boxes specify exact layout dimensions or are wrapped inside `position: "relative"` containers.
- [ ] **Placeholder Fallbacks**:
  * Confirm fallback placeholder vectors load gracefully in case of broken Supabase remote storage images.

---

## 7. Performance & Lighthouse Standards (Post-Launch Audit)
- [ ] **Performance Goal**: Score $\ge$ **85** on Mobile Lighthouse and $\ge$ **95** on Desktop.
- [ ] **Accessibility Score**: Target a minimum of **95** by adding appropriate `alt` tags and `aria-label` screen reader descriptors.
- [ ] **SEO Score**: Maintain **100** by serving meta tags, unique titles, and proper header hierarchy (`h1` constraints).

---

## 8. Screenshot Evidence Checklist
Before signing off on the pilot launch, capture visual evidence of:
1. Homepage fold in both English and Arabic.
2. Responsive mobile view of the Marketplace product details page showing thumbnails.
3. Password strength validation prompt on `/signup`.
4. Mobile menu state overlay.

---

## 9. Pilot Launch Blockers
The occurrence of any of the following triggers an immediate **No-Go** release decision:
* [ ] Text overlap or misalignment occurring on RTL (Arabic) viewports.
* [ ] Buttons or links leading to empty routes or generic 404 pages.
* [ ] Significant layout shift (CLS $> 0.1$) on image render.
* [ ] Presence of generic plain web image placeholders or debug grids.
