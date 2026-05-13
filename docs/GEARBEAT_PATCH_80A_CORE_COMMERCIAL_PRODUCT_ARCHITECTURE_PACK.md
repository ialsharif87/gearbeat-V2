# GEARBEAT PATCH 80A — CORE COMMERCIAL PRODUCT ARCHITECTURE PACK

## 1. Overview
This pack defines the foundational commercial architecture for GearBeat V2. It establishes the taxonomy, boundaries, and journey maps for the five core revenue verticals before entering Full Journey QA. This is a **documentation-only** patch designed to align product strategy with technical reality.

## 2. Core Vertical Taxonomy

| Vertical | Core Value Proposition | Primary Transaction Unit | Status |
| --- | --- | --- | --- |
| **Marketplace** | Verified new and pre-owned elite audio gear. | Product Unit (SKU) | Operational |
| **Book Studios** | On-demand access to certified recording spaces. | Time Slot (Hourly/Daily) | Operational |
| **Services** | Professional audio expertise (Mixing, Mastering). | Service Package/Project | Discovery Ready |
| **Tickets** | Access to masterclasses and industry events. | Event Pass (Ticket) | Discovery Ready |
| **Academy** | Structured audio education and mentorship. | Course/Session | Deferred |

### 2.1 Difference: Services vs. Academy
- **Services**: Output-oriented professional tasks (e.g., "Mix my song"). The user provides assets and receives a finished product. Providers are primarily Studios and Engineers.
- **Academy**: Knowledge-oriented growth (e.g., "Teach me to mix"). The user attends a session to learn a skill. Providers are Mentors and Educators.

---

## 3. Journey Mapping

### 3.1 Customer Journeys (Artists/Creators)
1.  **Marketplace**: Browse → Cart → Checkout → Shipping Update → Item Received.
2.  **Book Studios**: Discovery → Availability Check → Slot Selection → Payment → Booking Confirmation → Session Entry.
3.  **Services**: Service Discovery → Request Quote/Book → Asset Upload → Feedback Loop → Final Delivery.
4.  **Tickets**: Event Discovery → Seat/Pass Selection → Payment → Digital Ticket Issued → QR Entry.
5.  **Academy**: Curriculum Browse → Enrollment → Content Access/Live Session → Certification.

### 3.2 Partner Journeys (Studios/Vendors/Mentors)
1.  **Marketplace**: Application → Store Setup → Product Listing → Order Management → Fulfillment → Payout.
2.  **Book Studios**: Studio Onboarding → Availability Config → Booking Management → Settlement.
3.  **Services**: Profile Setup → Service Definition → Quote Management → Project Delivery.
4.  **Tickets**: Event Creation → Tier Pricing → Sales Monitoring → Attendee Management.
5.  **Academy**: Instructor Onboarding → Course Creation → Student Engagement → Revenue Share.

---

## 4. Admin & Operations Responsibilities
- **Vetting**: Manual verification of all Studio and Vendor applications.
- **Conflict Resolution**: Mediation between customers and partners for failed sessions or gear returns.
- **Financial Ops**: Reviewing payout requests and managing the `finance_ledger`.
- **Content Moderation**: Ensuring event descriptions and service profiles meet premium brand standards.

---

## 5. Technical Boundaries & Readiness

### 5.1 What is READY vs. DEFERRED
- **READY**: Marketplace discovery/cart, Studio discovery/booking (manual flow), Partner applications, Basic Ticketing discovery.
- **DEFERRED**: Live Tap payments, Real-time shipping API integration, Academy logic, Automated refund processing.

### 5.2 Pilot & Partner Boundaries
- **No-Pilot Boundary**: Real customer money should not be processed until Patch 82A (Payment Hardening).
- **No-Real-Partner Boundary**: Onboarding in the current phase is for internal testing/pilot leads only.

### 5.3 AI Readiness Notes
- **Marketplace**: Future AI for product recommendation and automatic description generation.
- **Studios**: Future AI for "Best Match" studio recommendations based on artist genre.
- **Academy**: Future AI for student learning paths and automated feedback on audio stems.

### 5.4 Mobile Readiness Notes
- **Strategy**: Mobile-first responsive web initially.
- **Native**: Deferred until the core web platform hits Commercial Stability Gate 1. Native app will focus on **Tickets (QR)** and **Marketplace (Track)**.

---

## 6. Future Dependencies
- **Database**: Requirement for `academy_courses`, `academy_enrollments`, and `service_orders` tables.
- **API**: Integration with global shipping carriers (DHL/FedEx) for Marketplace.
- **Payment**: Transition from `manual_bank_transfer` to `tap_gateway` for all verticals.

---

## 7. QA Readiness & Decisions
- **Decision**: **Full Journey QA** remains strictly **DEFERRED** until the following patches are complete:
  - **80B**: Partner Portal Hardening.
  - **81A**: Marketplace Fulfillment Logic.
  - **82A**: Payment Security Gate.
  - **83A**: Booking Conflict Resolution.
- **Pre-Full-Journey QA Requirements**:
  - All five vertical discovery pages must be build-verified.
  - SEO canonical domains must be locked.
  - Hydration performance must be > 75 (Mobile).

---

## 8. No-Risk Scope Confirmation
- This is a documentation-only patch.
- No backend code, database schema, or payment logic was modified.
- No business logic for Marketplace or Bookings was altered.
- No AI or Academy implementation was started.
