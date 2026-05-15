# GearBeat Mobile Pilot Demo Checklist (Sprint 7)

**Agent:** Agent 1 — Mobile/App
**Branch:** `agent-1-sprint-7-mobile-pilot-demo-checklist`
**Status:** [ ] READY FOR DEMO

---

## 1. Objective
Verify that the GearBeat Mobile Mirror app provides a premium, consistent, and safe discovery experience for the invite-only pilot demo targeted at investors and government partners.

## 2. Customer Demo Journey Checklist

### Home & Discovery
- [ ] **Visual Impact**: Confirm the premium dark/gold cinematic hero scales correctly on iOS and Android.
- [ ] **Search Experience**: Verify the search bar and featured categories are accessible and responsive.
- [ ] **Ask GearBeat**: Ensure the AI discovery preview UI is correctly padded for mobile viewports.

### Studios Vertical
- [ ] **Discovery**: Navigate to `/studios`. Verify filters and studio listing grid.
- [ ] **Profiles**: Open a Studio profile. Confirm images, "Certified" badges, and description layout.

### Marketplace Vertical
- [ ] **Browsing**: Navigate to `/marketplace`. Verify product category navigation.
- [ ] **Details**: Open a Product page. Confirm price display and "Verified Gear" trust indicators.

### Services Vertical
- [ ] **Listings**: Navigate to `/services`. Verify provider card layout and expertise tags.

### Tickets Vertical
- [ ] **Events**: Navigate to `/tickets`. Verify event discovery cards and detail view.

### Academy Vertical
- [ ] **Courses**: Navigate to `/academy`. Verify course grid and lesson preview readability.

---

## 3. Strict Safety & Interaction Blocks

**CRITICAL**: The mobile app is in "Read-Only Mirror Mode" for the pilot demo. The following actions MUST be blocked or simulated:

- [ ] **Live Payments**: Stripe/Checkout interactions trigger the "Preview/Deferred" state. NO real credit card processing.
- [ ] **Live AI**: "Ask GearBeat" interactions are simulated discovery previews. NO live production LLM tokens are consumed.
- [ ] **Real Bookings**: Confirm that "Book Now" actions do NOT result in persistent database mutations.
- [ ] **Real Orders**: Confirm that marketplace "Buy" actions are for UI verification only.
- [ ] **Real Tickets**: Confirm that ticket acquisition is simulated; no real QR codes or entries are issued.
- [ ] **Academy Enrollment**: Confirm that course "Enroll" actions are non-functional UI placeholders.

---

## 4. Mobile Technical Verification
- [ ] **WebView Load**: Confirm the production mirror `?app=1` loads without SSL or mixed-content errors.
- [ ] **Android Back Button**: Verify navigation history management (Standard vs. Exit behavior).
- [ ] **Pull-to-Refresh**: Confirm gold indicator and refresh logic on list pages.
- [ ] **External Links**: Verify that social and support links open in the native system browser.

---

## 5. Recommendation
- **Demo Readiness**: [ ] PENDING / [x] READY
- **Compliance**: This demo is for pre-pilot/investor/government readiness only. No commercial launch claims are made.
