# GEARBEAT PATCH 58A — MOBILE SCOPE & API READINESS MASTER PLAN

## 1. Phase 58 Overview
This document initiates **Phase 58: Mobile Readiness Foundation**. It establishes the architectural master plan for extending the GearBeat V2 ecosystem (Studios, Marketplace, Ticketing, Loyalty) into native mobile applications. 

**Safety Boundary:** This is a **documentation-only** patch. No React Native code, Expo configurations, APIs, or database changes are introduced in this patch.

---

## 2. Future Mobile App Scope
GearBeat will ultimately deploy three primary mobile applications (or distinct app modes) to cater to the ecosystem:
1. **GearBeat App (Customer):** For studio bookings, marketplace purchases, event discovery, and loyalty wallet management.
2. **GearBeat Pro (Studio Owners & Vendors):** For calendar management, booking approvals, order fulfillment, and chat.
3. **GearBeat Ticket Scanner (Event Partners):** A lightweight utility app for secure QR code scanning and attendee management.

---

## 3. Technology Stack & Architecture

### 3.1 React Native + Expo Preferred Direction
The GearBeat mobile ecosystem will be built using **React Native with Expo (Managed Workflow)**.
- **Why Expo:** Rapid development, over-the-air (OTA) updates, seamless push notification integration, and shared TypeScript types with the Next.js web application.
- **State Management:** Zustand or React Query (matching the web architecture).
- **Styling:** NativeWind (Tailwind for React Native) to mirror the web's utility-class approach, preserving the premium dark/gold identity.

### 3.2 Optional Swift/Kotlin Escape Hatch
While Expo covers 95% of use cases, we reserve the right to eject or use Expo Development Builds (custom native code) for:
- Low-latency audio processing/streaming (if required by studios).
- Advanced local hardware integrations (e.g., specialized NFC/Bluetooth access for studios).

---

## 4. Mobile Feature Maps

### 4.1 Customer Mobile Feature Map
- **Discovery:** Geo-location based studio search, marketplace browsing, and ticketing feed.
- **Bookings:** Calendar view, slot selection, and Apple Pay / Google Pay checkout.
- **Loyalty Wallet:** Native digital membership card (Apple Wallet / Google Wallet integration).
- **Push Notifications:** Booking confirmations, outbid alerts, and event reminders.

### 4.2 Partner/Studio Owner Feature Map
- **Calendar Management:** Quick block/unblock slots and approve/decline requests.
- **Messaging:** Real-time chat with customers.
- **Dashboard:** Revenue snapshots and upcoming sessions list.

### 4.3 Seller/Vendor Feature Map
- **Order Management:** Scan shipping labels, update tracking numbers.
- **Inventory:** Quick stock adjustments via mobile camera barcode scanning.

### 4.4 Admin/Operations Visibility
- **Oversight:** Super-admin dashboard is **not** prioritized for native mobile. Admins will continue to use the responsive web application (`/admin/*`) for complex CRM operations.

---

## 5. API & Platform Readiness Audits

### 5.1 Booking Mobile Readiness
- **Current State:** Web server actions handle bookings.
- **Gap:** Need dedicated REST/GraphQL API endpoints or Supabase Edge Functions to handle mobile booking payloads securely.

### 5.2 Ticketing and QR Mobile Readiness
- **Current State:** Web UI placeholders exist.
- **Gap:** Need a secure payload generator for QR codes (cryptographically signed) and a validation endpoint for the scanning app to prevent ticket duplication.

### 5.3 Marketplace Mobile Readiness
- **Current State:** Web cart and checkout flow established.
- **Gap:** Need integration with native mobile payment gateways (Apple Pay, Google Pay) via Stripe React Native SDK.

### 5.4 Loyalty/Rewards Mobile Readiness
- **Current State:** Ledger UI mapped.
- **Gap:** Need API endpoints to serve live points balance to the mobile app and fetch digital wallet pass files (.pkpass).

### 5.5 Notifications Readiness
- **Current State:** Email/Supabase auth emails exist.
- **Gap:** Need a push notification registry table in Supabase (`user_devices` with FCM/APNs tokens) and an Expo Push Notification service integration.

---

## 6. App Store / Google Play Legal & Asset Checklist
Before submitting any mobile builds, the following must be prepared:
- [ ] **Developer Accounts:** Apple Developer Program ($99/yr) and Google Play Console ($25).
- [ ] **Legal Documents:** Mobile-specific Privacy Policy and Terms of Service (EULA).
- [ ] **App Assets:** App icons (1024x1024), splash screens, and localized (Arabic/English) store screenshots.
- [ ] **Content Moderation:** In-app reporting and blocking mechanisms (Strict requirement by Apple for apps with user-generated content or chat).
- [ ] **Account Deletion:** In-app flow to completely delete user accounts and data (Strict Apple requirement).

---

## 7. Explicit Implementation Boundaries
- **No API Changes Today:** This master plan dictates that API routes will be built in subsequent patches.
- **Web First:** Features must reach maturity on the Next.js web platform before being ported to React Native.
- **Supabase as the Hub:** All mobile apps will authenticate directly via Supabase Auth (React Native SDK), sharing the same users and sessions as the web platform.
