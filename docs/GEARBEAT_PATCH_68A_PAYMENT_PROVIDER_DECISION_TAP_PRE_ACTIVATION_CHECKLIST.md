# GEARBEAT PATCH 68A — PAYMENT PROVIDER DECISION + TAP PRE-ACTIVATION CHECKLIST

## 1. Phase 68 Overview & Purpose
Phase 68 (**Payment Pre-Activation Foundation**) marks the transition from conceptual planning to operational readiness for financial transactions. The purpose of this phase is to finalize the selection of payment gateways, establish company-level compliance prerequisites, and define the architectural boundaries for the live implementation of payment flows.

---

## 2. Primary Payment Provider: Tap Payments
**Decision:** **Tap Payments** is selected as the preliminary first-choice provider for GearBeat V2 due to its strong support for Saudi Arabia (KSA) and the wider GCC region, comprehensive documentation, and native support for Mada, Apple Pay, and Google Pay.

### Alternatives for Record
While Tap is the primary choice, the following providers are kept on record for future redundancy or regional expansion:
- **Moyasar:** Excellent local KSA support and simple API.
- **HyperPay:** Robust enterprise-level gateway with deep regional integration.
- **PayTabs:** Flexible multi-currency support.
- **Stripe:** To be considered only if entity/country availability and regional fee structures align with GearBeat's business model.

---

## 3. Company Activation Requirements
Before live payments can be accepted, GearBeat (the entity) must ensure the following are ready:
- [ ] **Commercial Registration (CR):** Valid and up-to-date Saudi or regional business license.
- [ ] **VAT Registration:** If applicable, ensured for tax compliance.
- [ ] **Business Bank Account:** Active account with IBAN for settlement.
- [ ] **Identity Verification:** KYC (Know Your Customer) completed for the company's authorized signers.

---

## 4. Website Readiness Checklist (Compliance)
Payment providers require specific "Public Pages" to be active and clear before granting a "Live" environment.

- [ ] **About Us:** Clearly stating the platform's purpose and mission.
- [ ] **Contact Us:** Verified contact details (Email, Phone, Physical Address).
- [ ] **Pricing:** Clear display of session rates and product prices.
- [ ] **Terms of Service:** finalized legal text (currently in Draft).
- [ ] **Privacy Policy:** finalised legal text (currently in Draft).
- [ ] **Refund & Cancellation Policy:** Explicit rules for studio and product returns.
- [ ] **Checkout Flow:** A functional, bug-free path from discovery to payment.

---

## 5. Tap Live Activation Checklist
1.  **Sandbox Validation:** Complete all Phase 67 state-machine testing using Tap Sandbox keys.
2.  **Merchant Profile:** Submit business documents to Tap.
3.  **URL Whitelisting:** Register `gearbeat.com` and its subdomains in the Tap Dashboard.
4.  **Key Rotation:** Securely transition from `pk_test/sk_test` to `pk_live/sk_live` using encrypted environment variables.

---

## 6. Payment Architecture Boundaries

### A. Backend Integration
- **Payment Session:** All transactions must originate from a `checkout_payment_sessions` record created server-side.
- **Hosted Checkout:** Preference for Tap's Hosted Checkout or Redirect flow to minimize PCI-DSS compliance scope on GearBeat servers.
- **Webhook Integrity:** The `api/tap/webhook` is the **Source of Truth**. Status updates to bookings/orders must be triggered by verified webhooks.

### B. Transactional Safety
- **Idempotency:** Implement idempotency keys to prevent duplicate charges if a user clicks "Pay" multiple times or a webhook is retried.
- **Cross-References:** Every Tap charge must carry `metadata.booking_id` or `metadata.order_id` for perfect reconciliation.
- **Refunds:** All refunds must be initiated via the Tap API and reflected in the `payment_refunds` table.

---

## 7. Pilot vs. Production Policy
- **Manual Payment:** This flow remains **Pilot-Only**. It must NEVER be exposed to the general public. It is intended for internal QA and trusted partner testing only.
- **Production Payments:** Only verified gateway transactions (Tap) are permitted for public user transactions.

---

## 8. Decision Gate
**GO/NO-GO:** Before implementing any code for Patch 68B, the project leads must confirm:
1.  Legal draft reviews are complete.
2.  Commercial registration is submitted.
3.  Sandbox state-machine logic (Patch 67) is build-verified.

---
**Plan Created By:** Antigravity AI
**Date:** 2026-05-12
**Verification Status:** DOCUMENTATION ONLY. NO CODE MUTATION.
