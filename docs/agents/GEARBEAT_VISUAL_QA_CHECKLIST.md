# GearBeat Visual QA Checklist

Use this checklist during visual frontend reviews to ensure every page conforms to the premium, bilingual, mobile-first GearBeat brand design.

---

## 1. Mobile-First Layout Verification

*   [ ] **Viewport Scalability**: Check page at standard mobile breakpoints (e.g., 360px, 390px, 412px, 430px width). Ensure zero horizontal overflow scrollbars.
*   [ ] **Touch Targets**: Verify that all clickable elements (buttons, link labels, custom icons) have a minimum dimension of **48px x 48px**.
*   [ ] **Flexbox & Grid Wrapping**: Check containers with dynamic text. Ensure that when long titles wrap, they do not overlap with adjacent elements (images, icons, buttons).
*   [ ] **Viewport Fit**: Verify that fixed elements (sticky headers, bottom navigation bars) are scaled relative to safe area insets on mobile devices (e.g., notch margins).

---

## 2. Bilingual (RTL / LTR) Visual Parity

*   [ ] **Direction Mapping**: Switch layout direction to `rtl`. Verify that the page layout matches the language flow (content starts from right to left).
*   [ ] **Text Alignment**: Verify that title and body alignments shift logically (`text-align: right` or `text-align: start`).
*   [ ] **Icon Mirroring**: Confirm that direction-sensitive icons (e.g., back arrows `<-`, next page buttons `->`, chevron selectors) mirror correctly.
    *   *Note*: Static logos, media playback controls (play, pause, fast forward), and global currency icons must not be mirrored.
*   [ ] **Bilingual String Alignment**: Verify that no English text strings appear in Arabic mode (and vice versa) except for global brand names like "GearBeat".
*   [ ] **Arabic Font Line Heights**: Arabic fonts (like Tajawal) require more vertical space. Verify that descenders are not cut off and text lines do not overlap.

---

## 3. Premium Contrast & Aesthetics

*   [ ] **Brand Theme Color Check**: Ensure background remains deep black/charcoal (`#000000`/`#121212`) and main accents are gold (`#D4AF37`).
*   [ ] **Text Readability (Contrast)**: Body text must be soft light gray/white (`#E0E0E0`) rather than pure bright white (`#FFF`). Contrast ratios must meet Web Content Accessibility Guidelines (WCAG) AAA/AA standard on a pitch-black background.
*   [ ] **Hover & Micro-animations**: Ensure hover and active states (gold glows, opacity shifts, scale transitions) feel fast, smooth, and premium.
*   [ ] **No Placeholders**: Confirm that all images have valid paths, alt descriptions, and represent real audio gear or premium studio environments.
