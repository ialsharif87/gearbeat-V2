# GEARBEAT PATCH 51B — WEB READINESS BASELINE & ROUTE INVENTORY

## 1. Overview
This patch establishes a comprehensive route inventory and web readiness baseline for GearBeat V2. It audits the current application structure across public, admin, portal, and API layers to identify dependencies for the upcoming **GearBeat Certified** live implementation and general launch readiness.

---

## 2. Route Inventory

### 2.1 Public Pages
- `/`: Home Page (High-traffic landing)
- `/studios`: Studio Marketplace
- `/studios/[slug]`: Individual Studio Profile
- `/marketplace`: Gear & Product Marketplace
- `/gear`: Specialized gear landing
- `/about`: Company vision
- `/contact`: Support & Inquiry
- `/support`: Documentation & Help Center
- `/how-it-works`: Platform explanation
- `/terms`: Legal Terms of Service
- `/privacy`: Data Privacy Policy

### 2.2 GearBeat Certified (Foundational)
- `/gearbeat-certified`: Certification Program Landing
- `/gearbeat-certified/[slug]`: Public Verification Certificate (Digital Proof)

### 2.3 Admin Pages (`/admin`)
- `/admin`: Main Dashboard (Stats & Overview)
- `/admin/accounting`: Financial management
- `/admin/leads`: Application review (Sellers & Studios)
- `/admin/sellers`: Approved vendor management
- `/admin/studios`: Approved studio management
- `/admin/certified-studios`: **(Target)** Certification status & tier management
- `/admin/bookings`: Global booking monitor
- `/admin/studio-payments`: Studio payout management
- `/admin/seller-payments`: Vendor payout management
- `/admin/reviews`: Review & Rating moderation
- `/admin/settings`: Global system configuration

### 2.4 Portal Pages (`/portal`)
- `/portal/seller`: Vendor Dashboard (Inventory, Orders)
- `/portal/studio`: Studio Owner Dashboard (Bookings, Settings)
- `/portal/studio/onboarding`: Studio setup flow
- `/portal/studio/studios/[id]/manage`: Detailed studio configuration

### 2.5 Customer Pages (`/customer`)
- `/customer`: Customer Dashboard
- `/customer/bookings`: Personal booking history
- `/customer/favorites`: Saved studios & products

### 2.6 Auth & Identity
- `/login`: User authentication
- `/signup`: New account creation
- `/forgot-password`: Recovery flow
- `/update-password`: Security management
- `/staff-access`: Dedicated portal for GearBeat staff

### 2.7 API Layer Highlights
- `/api/auth`: NextAuth/Supabase auth handlers
- `/api/bookings`: Booking logic & availability
- `/api/cron`: Scheduled cleanup & expiry tasks
- `/api/storage`: Signed URL & Secure upload handlers
- `/api/rpc`: Supabase Remote Procedure Calls

---

## 3. Page Readiness Status Baseline

| Page / Route | Current Status | Notes |
| :--- | :--- | :--- |
| `/` | Ready | Core marketing content active. |
| `/studios/[slug]` | Needs Polish | Needs integration of StudioTierBadge. |
| `/gearbeat-certified` | Ready | Visual foundation complete (Patch 50). |
| `/gearbeat-certified/[slug]` | Needs Data | Static placeholder (Needs Patch 51E). |
| `/admin/certified-studios` | Needs Data | UI active, needs mutation actions. |
| `/portal/studio/manage` | Ready | Core features active. |
| `/api/storage` | Ready | Hardened in Patch 48/49. |

---

## 4. GearBeat Certified Dependencies

- **Route Dependency**: `/studios/[slug]` must dynamically render the `StudioTierBadge` based on the `certified_studios` table.
- **Admin Dependency**: `/admin/certified-studios` requires new Server Actions to update `certified_studios.status`.
- **Public Dependency**: `/gearbeat-certified/[slug]` must fetch verified audit dates and trust scores.
- **Onboarding Dependency**: `/join/studio` flow should mention the benefits of certification to encourage applications.

---

## 5. UX/Readiness Audit Categories

- **Mobile Responsiveness**: Critical for the Verification Page (QR scans happen on phones).
- **Arabic/English Support**: Ensure `<T />` components are used in all new certification labels.
- **Loading States**: Add premium skeletons for dynamic certification data fetching.
- **Error States**: Handle "Certification Not Found" or "Expired" gracefully on the verification route.
- **Premium Aesthetics**: Maintain gold/black consistency in all badges and banners.
- **Performance**: Ensure the public verification page loads in < 1s for instant trust.

---

## 6. Risk Assessment

- **Trust Risk**: Public verification page displaying "Verified" for an expired or suspended studio.
- **Security Risk**: RLS leakage in `qr_verification_links` allowing unauthorized token access.
- **UX Risk**: Poor mobile layout for the QR verification page leading to friction in-studio.
- **Data Risk**: Stale audit dates if the manual review process is not strictly logged.

---

## 7. Recommended Future Roadmap

1. **Patch 51C: Certified SQL/RLS Draft Review** (Database Layer)
2. **Patch 51D: Certified Admin Integration** (Mutation Actions)
3. **Patch 51E: Dynamic Public Verification Page** (Frontend Binding)
4. **Patch 51F: QR Verification + Audit Logs** (The Trust Loop)
5. **Patch 62: Premium UI/UX Polish** (Visual Hardening)
6. **Patch 63: SEO & Content Readiness** (Launch Content)

---

## 8. Acceptance Checklist
- [x] Full route inventory completed (Public, Admin, Portal, API).
- [x] Page readiness baseline established.
- [x] Certification dependencies identified across the app.
- [x] No implementation changes made.
- [x] No SQL/RLS/Database changes made.
- [x] Build passes verification.
