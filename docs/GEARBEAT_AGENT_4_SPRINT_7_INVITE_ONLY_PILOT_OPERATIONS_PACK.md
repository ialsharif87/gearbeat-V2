# Sprint 7 — Invite-Only Pilot Operations Pack

## 1. Executive Summary
This document defines the operational framework for the **GearBeat V2 Private Pilot**. This phase is a controlled, invite-only environment designed to verify product-market fit and platform stability among a selected cohort of creators and partners before full regulatory activation.

---

## 2. Pilot Scope & Candidate Profiles

### 2.1 Pilot Scope
- **Environment**: Production (Vercel) but restricted to invited users.
- **Verticals**: Marketplace, Book Studios, Services, Tickets, Academy.
- **Payment Mode**: *Deferred/Manual* only. Real funds will not be processed.
- **AI**: Presentational discovery UI (Simulated responses).

### 2.2 Candidate Profiles (The "First 50")
- **Studio Partners**: 5–10 GearBeat-Certified local studios.
- **Content Creators**: 15–20 Trusted musicians, producers, and photographers.
- **Academy Instructors**: 5–10 Professional educators for live synchronous sessions.
- **General Users**: 10–20 "Friends & Family" testers for public UX validation.

---

## 3. Manual Support & Feedback Workflow

### 3.1 Support Channels
- **Direct Concierge**: WhatsApp Business / Telegram for real-time partner assistance.
- **Email Support**: `pilot-support@gearbeat.app` for formal issue tracking.
- **Manual Booking Handling**: Support team verifies "Deferred" booking requests with studios via phone/chat.

### 3.2 Feedback Loop
- **In-App Discovery**: Users report feedback directly via the "Ask GearBeat" interface (routed to manual logs).
- **Weekly Surveys**: Short pulse-check surveys sent to all pilot participants.

---

## 4. Investor & Government Demo Script

### 4.1 The "Golden Path" Demo
1. **Discovery**: Showcase "Ask GearBeat" AI discovering a top-rated studio or academy course.
2. **Booking/Purchase**: Navigate to the Studio or Marketplace listing; select variants/times.
3. **Checkout**: Demonstrate the "Manual/Deferred" payment flow, highlighting transparency.
4. **Partner UX**: Show the (mocked) Partner Dashboard receiving the notification.
5. **Trust Layer**: View the "GearBeat Certified" badges and regulatory disclaimers.

---

## 5. Operational Governance

### 5.1 Issue Intake & Severity
- **P0 (Blocker)**: Vertical flow broken, security vulnerability, data leak.
- **P1 (Critical)**: Visual regression on mobile, navigation failure.
- **P2 (Standard)**: Content typos, minor aesthetic misalignments.

### 5.2 Evidence Tracker (KYC Off-DB)
- **Partner KYC**: All Commercial Records (CR) and IDs are tracked in a secure, offline spreadsheet or encrypted external drive.
- **No PII in Database**: Confirming that sensitive identification documents are **not** uploaded to Supabase/Vercel storage during the pilot.

---

## 6. Stop/Go Launch Gates
The transition to "Public Pilot" requires:
- [ ] **GO**: Zero P0 or P1 issues remaining in the pilot tracker.
- [ ] **GO**: Successful legal entity registration and bank account activation.
- [ ] **GO**: Signed "Pilot Agreement" from 100% of participating partners.
- [ ] **STOP**: Any unauthorized PII collection or payment activation discovered.

---

## 7. Agent 4 Confirmations
As Agent 4, I confirm the following for Sprint 7:
- **No Real Public Launch**: Registration remains invite-only.
- **No Live Payments**: All transactions use manual placeholders.
- **No Real PII Collection**: All personal identifying documents are handled off-platform.
- **No Contract Execution**: Agreement templates remain in draft status.
- **No Real Partner Onboarding**: Production database only contains demo/pilot data.

> [!IMPORTANT]
> This operations pack is for demonstration and pilot readiness only. It does not constitute a commercial launch or legal authorization to collect customer funds.
