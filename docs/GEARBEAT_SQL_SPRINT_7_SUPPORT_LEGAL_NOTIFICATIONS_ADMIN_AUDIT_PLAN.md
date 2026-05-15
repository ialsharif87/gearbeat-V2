# GEARBEAT: SQL SPRINT 7 — SUPPORT, LEGAL, NOTIFICATIONS & ADMIN AUDIT PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 7
This final foundational phase establishes the operational and regulatory "Safety Net" for GearBeat. It defines the systems for **Support & Escalation**, **Legal Compliance**, **Notification Delivery**, and **Administrative Auditing**, ensuring the platform is ready for professional government-level and investor-grade review.

## 2. DEPENDENCY ON PREVIOUS SPRINTS
- **Sprint 1 (Identity)**: All tickets, consents, and audit logs are anchored to `profiles`.
- **Sprint 5 (Payments)**: Support escalations often link to `refund_requests` or `payment_transactions`.
- **Sprint 6 (Growth)**: Notifications are triggered by `reward_events` and `referral_events`.

## 3. SUPPORT & ESCALATION
- **Ticketing**: `support_tickets` and `support_ticket_messages` provide a structured communication channel between users and the GearBeat team.
- **Escalation**: `support_escalations` track tickets that require specialized review (e.g., payment disputes or legal complaints).
- **Categories**: `support_categories` allow for routing and severity-based SLA tracking.

## 4. LEGAL & COMPLIANCE
- **Versioned Policies**: `legal_policies` and `legal_policy_versions` allow the platform to update Terms and Privacy rules while maintaining an audit trail of what a user agreed to.
- **Consent Tracking**: `user_policy_acceptances` and `academy_guardian_consents` (for minors) ensure verifiable legal standing before platform use.
- **Agreements**: `partner_agreement_references` link to off-chain or external legal contracts for studios and vendors.

## 5. NOTIFICATION ENGINE
- **Outbox Model**: `notification_outbox` acts as a high-reliability buffer for system-generated messages (Email, SMS, WhatsApp).
- **Preferences**: `notification_preferences` give users granular control over which channels and events they want to be notified about.
- **Templates**: `notification_templates` support multi-lingual (Arabic/English) readiness and consistent branding.

## 6. ADMIN AUDIT & INTERNAL TASKS
- **Action Logs**: `admin_action_logs` record every mutation performed by a user with administrative roles, ensuring "no-blind-spot" operations.
- **Review Workflow**: `internal_review_tasks` allow the team to assign and track complex administrative work (e.g., "Verify Studio Hardware Audit").
- **Notes**: `admin_notes` provide internal context on users or transactions that is never visible to the public.

## 7. RISK & DATA RETENTION
- **Risk Flags**: `compliance_flags` and `risk_review_events` allow for pro-active monitoring of suspicious activity (e.g., sudden refund spikes).
- **Retention**: `data_retention_events` track when specific records are anonymized or purged in accordance with local data privacy regulations.

## 8. RLS DIRECTION (DRAFT)
- **Support**: Users can only see their own tickets and messages. Support agents can see all tickets within their assigned categories.
- **Legal**: Acceptances are readable by the user and compliance officers. Policies are publicly readable.
- **Notifications**: Preferences and outbox items are private to the user.
- **Audit**: `admin_audit_logs` are strictly restricted to the `security_officer` or `super_admin` roles.

## 9. PRODUCTION VERIFICATION REQUIREMENTS
- **Security**: Ensure `admin_notes` are strictly excluded from all public or user-facing APIs.
- **Reliability**: Verify the idempotency of the `notification_outbox` to prevent duplicate SMS/Email delivery.
- **Integrity**: Audit the linkage between `support_escalations` and financial `refund_requests`.

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review. Legal and support workflows remain in simulation mode until explicit policy sign-off from the legal department.
