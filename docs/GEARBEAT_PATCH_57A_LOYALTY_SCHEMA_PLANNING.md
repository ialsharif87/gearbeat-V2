# GEARBEAT PATCH 57A — LOYALTY SCHEMA PLANNING

## 1. Overview
This document outlines the architectural roadmap for the future **GearBeat Loyalty Engine**. This engine will unify the customer experience across the three core GearBeat tracks (Studios, Marketplace, and Ticketing), rewarding engagement and enabling premium perks. 

**IMPORTANT SAFETY BOUNDARY:** This patch is strictly **documentation-only**. No live database tables, SQL migrations, RLS policies, or backend mutations are being introduced at this stage. All schema proposals are deferred for explicit executive approval.

---

## 2. Loyalty Engine Scope

### 2.1 Points Ledger (سجل النقاط)
An immutable, append-only ledger tracking all point transactions (earns, burns, expires, adjustments) to ensure absolute auditability.

### 2.2 Tier Rules (قواعد المستويات)
Dynamic calculation of customer tiers (e.g., Bronze, Silver, Gold/Premium, Black/Elite) based on rolling point accruals or lifetime spend.

### 2.3 Earn Rules (قواعد الاكتساب)
- **Booking Earn Logic:** Points awarded upon successful completion of a studio session.
- **Marketplace Earn Logic:** Points awarded upon delivery/acceptance of a verified gear purchase.
- **Ticketing Earn Logic:** Points awarded upon successful check-in or completion of an experience/event.

### 2.4 Redemption Rules (قواعد الاستبدال)
Logic governing how points are converted to currency or discounts at checkout across the three platform tracks.

### 2.5 Referral Rules (قواعد الإحالة)
Incentive structures for referring new customers or verified studio partners.

### 2.6 Admin Controls (ضوابط الإدارة)
A centralized CRM module allowing admins to adjust point balances, audit ledgers, and manage tier thresholds.

### 2.7 Integration Readiness
- **Mobile Loyalty Readiness:** API structures designed for lightweight consumption by future native iOS/Android apps.
- **External Integration Readiness:** Webhook foundations for syncing point balances with external marketing or fulfillment partners.

---

## 3. Proposed Future Database Architecture

> **NOTE:** These tables do NOT exist and are proposed for future implementation.

### 3.1 `loyalty_wallets`
Stores the current state of a user's loyalty profile.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> auth.users)
- `balance` (Integer, Current available points)
- `lifetime_points` (Integer, Total points ever earned)
- `current_tier` (String, e.g., 'BRONZE', 'GOLD')
- `tier_expiry` (Timestamp)

### 3.2 `loyalty_ledger`
Append-only log of all point transactions.
- `id` (UUID, Primary Key)
- `wallet_id` (UUID, Foreign Key -> loyalty_wallets)
- `transaction_type` (Enum: 'EARN', 'REDEEM', 'ADJUST', 'EXPIRE', 'REFUND')
- `points` (Integer, positive or negative)
- `reference_type` (Enum: 'BOOKING', 'ORDER', 'TICKET', 'REFERRAL', 'ADMIN')
- `reference_id` (UUID, Link to the triggering entity)
- `created_at` (Timestamp)

### 3.3 `loyalty_tiers`
Configuration table for tier requirements and benefits.
- `id` (UUID, Primary Key)
- `tier_level` (Integer, e.g., 1, 2, 3)
- `tier_name_en` (String, e.g., 'Gold')
- `tier_name_ar` (String, e.g., 'ذهبي')
- `required_points` (Integer)
- `multiplier` (Decimal, e.g., 1.5x earn rate)

---

## 4. Bilingual Product Terminology

- **Loyalty Points:** نقاط الولاء
- **Current Balance:** الرصيد الحالي
- **Earn Points:** اكتساب النقاط
- **Redeem Points:** استبدال النقاط
- **Reward Tier:** مستوى المكافأة
- **Transaction History:** سجل العمليات
- **Welcome Kit Eligibility:** أهلية مجموعة الترحيب

---

## 5. QA & Implementation Readiness Checklist

Prior to executing SQL migrations for the Loyalty Engine, the following criteria must be met:
- [ ] **Executive Approval:** Formal sign-off on the proposed schema and earn/burn ratios.
- [ ] **RLS Definition:** Strict Row Level Security policies defined to prevent client-side ledger manipulation.
- [ ] **Ledger Integrity:** Validation that the ledger acts as the source of truth (wallet balances must equal the sum of ledger entries).
- [ ] **Refund Handling:** Documented protocol for point clawbacks in the event of canceled bookings or refunded marketplace orders.
- [ ] **Currency Conversion:** Approved fixed conversion rate for points to SAR/USD during redemption.

---

## 6. Next Steps
Following approval of this schema planning document, future phases will introduce the SQL migrations, strict RLS policies, and server-side logic required to power the Loyalty Engine.
