# GearBeat Mobile Investor Demo Readiness Checklist (Sprint 8)

**Agent:** Agent 1 — Mobile/App
**Branch:** `agent-1-sprint-8-mobile-investor-demo-readiness`
**Status:** [ ] READY FOR REVIEW

---

## 1. Objective
Verify that the GearBeat Mobile Mirror app provides a premium, consistent, and safe discovery experience for investor and government presentations.

## 2. Customer Demo Flow Verification

### Home & Discovery
- [ ] **Visual Impact**: Confirm the premium dark/gold cinematic hero scales correctly on iOS and Android.
- [ ] **Search & Explore**: Verify the search bar and featured categories are accessible and responsive.
- [ ] **Ask GearBeat**: Ensure the AI discovery preview UI is correctly padded for mobile viewports.

### Studios Vertical
- [ ] **Discovery**: Navigate to `/studios`. Verify filters and studio listing grid.
- [ ] **Studio Profiles**: Open a Studio profile. Confirm images, "Certified" badges, and description layout.

### Marketplace Vertical
- [ ] **Browsing**: Navigate to `/marketplace`. Verify product category navigation.
- [ ] **Product Details**: Open a Product page. Confirm price display and "Verified Gear" trust indicators.

### Services Vertical
- [ ] **Listings**: Navigate to `/services`. Verify provider card layout and expertise tags.

### Tickets Vertical
- [ ] **Events**: Navigate to `/tickets`. Verify event discovery cards and detail view.

### Academy Vertical
- [ ] **Courses**: Navigate to `/academy`. Verify course grid and lesson preview readability.

---

## 3. Strict Safety & Interaction Blocks

**CRITICAL**: The mobile app is in "Read-Only Mirror Mode" for the investor demo. The following actions MUST be blocked or simulated:

- [ ] **Live Payments**: Stripe/Checkout interactions trigger the "Preview/Deferred" state. NO real credit card processing.
- [ ] **Live AI**: "Ask GearBeat" interactions are simulated discovery previews. NO live production LLM tokens are consumed.
- [ ] **Real Bookings**: Confirm that "Book Now" actions do NOT result in persistent database mutations.
- [ ] **Real Orders**: Confirm that marketplace "Buy" actions are for UI verification only.
- [ ] **Real Tickets**: Confirm that ticket acquisition is simulated; no real QR codes or entries are issued.
- [ ] **Paid Academy Enrollment**: Confirm that course "Enroll" actions are non-functional UI placeholders.

---

## 4. App Shell Readiness
- [ ] **WebView Load**: Confirm the production mirror `?app=1` loads without SSL or mixed-content errors.
- [ ] **Environment Switcher**: Verify that the hidden switcher is active and redirects to specified URLs correctly.
- [ ] **Android Back Button**: Verify navigation history management (Standard vs. Exit behavior).
- [ ] **Pull-to-Refresh**: Confirm gold indicator and refresh logic on list pages.

---

## 5. Recommendation
- **Investor Readiness**: [ ] PENDING / [x] READY
- **Government Compliance**: This demo is for pre-pilot/investor/government readiness only. No commercial launch claims are made.
