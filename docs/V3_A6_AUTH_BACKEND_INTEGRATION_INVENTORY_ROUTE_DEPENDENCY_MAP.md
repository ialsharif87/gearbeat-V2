# V3-A6: Auth Backend Integration Inventory + Route Dependency Map

This document defines the route inventory, backend dependency mappings, integration checkpoints, and security considerations for the GearBeat V3 authentication and profile integration phase. It bridges the gap between current client-side mock mechanisms and the future Supabase schema defined in [V3_A3_SUPABASE_SCHEMA_AUTH_PROFILE_CONTRACT.md](file:///c:/Users/iaals/Documents/GitHub/gearbeat-figma-homepage-source/docs/V3_A3_SUPABASE_SCHEMA_AUTH_PROFILE_CONTRACT.md) and [V3_A4_SUPABASE_MIGRATION_DRAFT_AUTH_PROFILE_SCHEMA.md](file:///c:/Users/iaals/Documents/GitHub/gearbeat-figma-homepage-source/docs/V3_A4_SUPABASE_MIGRATION_DRAFT_AUTH_PROFILE_SCHEMA.md).

---

## 1. Authentication & Onboarding Route Inventory

The current user entry points, credentials exchange layers, and default role assignments are structured as follows:

| Entry Path / Route | Component File | Role / Purpose | Auth Operations |
| :--- | :--- | :--- | :--- |
| `/login` | [page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/login/page.tsx) | Customer & User Sign-In | Password & OTP Sign-in; confirmation resends |
| `/signup` | [SignupClient.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/signup/SignupClient.tsx) | Customer Self-Registration | Direct creation of `customer` role profiles |
| `/portal/login` | [page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/portal/login/page.tsx) | Shared Provider Sign-In | Hostname-based custom visual wrappers for Studio Owners (`portal.*`) and Sellers (`seller.*`) |
| `/admin/login` | [page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/%28admin-auth%29/admin/login/page.tsx) | Administrative Sign-In | Command Center login gated by `/api/admin/login-check` |

---

## 2. Customer Route Inventory

These routes reside on the main public domain (`gearbeat.app`) and represent the client/buyer workflow.

* **Layout Protection Boundary:** Protected by `requireCustomerLayoutAccess()` in [layout.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/customer/layout.tsx), which forces redirection if the active role is not `customer` (or legacy `user`).
* **Protected Paths under `/customer`:**
  - `/customer` (Dashboard summary)
  - `/customer/bookings` (Active/past bookings)
  - `/customer/orders` (Booking orders)
  - `/customer/marketplace-orders` (Marketplace gear purchases)
  - `/customer/payments` (Transaction logs)
  - `/customer/rewards` (Loyalty rewards wallet status)
  - `/customer/saved` (Saved recording studios or catalog items)
  - `/customer/wishlist` (User's gear wishlist)

---

## 3. Partner / Portal / Seller Route Inventory

These routes represent verified commercial providers. They map to individual subdomains through host detection.

### 3.1. Partner / Seller Application Intake (Public)
* `/partners/apply` ([apply/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/partners/apply/page.tsx)): Intake landing page displaying partner options.
* `/join/seller` ([seller/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/join/seller/page.tsx)): Seller registration form submitting documents (CR, VAT, national address, IBAN) to `provider_leads` table.

### 3.2. Studio Partner Portal (`portal.gearbeat.app`)
* **Layout Protection Boundary:** Protected inline in [layout.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/portal/studio/layout.tsx). Gated strictly to `owner` or `studio_owner` roles.
* **Gated Subroutes:**
  - `/portal/studio` (Dashboard telemetry)
  - `/portal/studio/bookings` (Booking scheduler and accept/reject actions)
  - `/portal/studio/availability` (Availability slots scheduler)
  - `/portal/studio/studios` (Studio listings config)
  - `/portal/studio/analytics` (Telemetry and revenue metrics)
  - `/portal/studio/bank` & `/portal/studio/payouts` & `/portal/studio/payout-requests` (Payout settings)
  - `/portal/studio/contract` (Digitally signed agreements view)
  - `/portal/studio/reviews` (Client reviews list)
  - `/portal/studio/settings` (Studio profile/account settings)

### 3.3. Seller Portal (`seller.gearbeat.app`)
* **Layout Protection Boundary:** Protected by `requireVendorLayoutAccess()` in [layout.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/portal/store/layout.tsx). Cross-references verified `vendor_profiles` lookup record.
* **Gated Subroutes:**
  - `/portal/store` (Seller dashboard)
  - `/portal/store/inventory` & `/portal/store/products` (Catalog and stock control)
  - `/portal/store/orders` & `/portal/store/returns` (Order fulfillment lifecycle)
  - `/portal/store/analytics` (Sales charts and reports)
  - `/portal/store/bank` & `/portal/store/payouts` & `/portal/store/payout-requests` (Banking/payout console)
  - `/portal/store/settings` (Merchant settings)

---

## 4. Admin Route Inventory (`admin.gearbeat.app`)

These routes handle platform-level administration.

* **Layout Protection Boundary:** Protected by `requireAdminLayoutAccess()` in [layout.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/layout.tsx), which queries `admin_users` to verify user existence and `status = 'active'`.
* **Administrative Subroutes:**
  - `/admin` (System overview)
  - `/admin/leads` (Partner and seller onboarding verification queue)
  - `/admin/users` (Platform user database registry)
  - `/admin/studios` & `/admin/vendors` & `/admin/sellers` (Listing moderation panels)
  - `/admin/owner-compliance` & `/admin/verifications` (Document auditing console)
  - `/admin/bookings` & `/admin/orders` & `/admin/marketplace-orders` (Global transaction logs)
  - `/admin/payments` & `/admin/refunds` & `/admin/payouts` & `/admin/payout-requests` & `/admin/settlements` (Financial dashboard)
  - `/admin/accounting` & `/admin/commissions` & `/admin/commission-settings` (Commission configurations)
  - `/admin/crm` & `/admin/operations-crm` (Lead pipelines and customer relationships)
  - `/admin/manual-ops` (Manual fallback operation logs)
  - `/admin/launch-controls` (Global feature flags and system locks)
  - `/admin/loyalty` (Loyalty tiers config)
  - `/admin/rewards-kits` (Fulfillment logs for physical rewards kits)
  - `/admin/certified-program` & `/admin/certified-studios` (Certified badges control)
  - `/admin/team` (Operator administration console)

---

## 5. Future Integration & Route Dependency Map

```
  [User Client Action]
          │
          ▼
┌──────────────────┐
│  Next Middleware │ ──► Reads JWT session tokens & applies subdomain rewrite checks
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│   Layout Guard   │ ──► Dual protection validation (Zero Client Trust verification)
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│   Page Render    │ ──► Renders role-specific data using RLS secured database queries
└──────────────────┘
```

### 5.1. Where Profile Bootstrap Should Connect Later
* **Connection Point:** Database-level trigger on `auth.users` insertion.
* **Mechanism:** The proposed `handle_new_user_profile` trigger in [V3_A4_SUPABASE_MIGRATION_DRAFT_AUTH_PROFILE_SCHEMA.md](file:///c:/Users/iaals/Documents/GitHub/gearbeat-figma-homepage-source/docs/V3_A4_SUPABASE_MIGRATION_DRAFT_AUTH_PROFILE_SCHEMA.md) must fire automatically upon signup. This trigger will bootstrap matching rows in `public.profiles` with a default role of `'customer'`.
* **Fallback Safety:** The auto-repair endpoint `/api/customer/profile/ensure` and client redirect `/profile/repair` will continue to catch missing profile rows at the application tier.

### 5.2. Where Role Guards Should Connect Later
* **Middleware Gate:** NextJS `middleware.ts` should intercept requests to all subdomains (except `gearbeat.app` and `partners.gearbeat.app`). It must retrieve the Supabase session, decrypt the token, and read `app_metadata.role` to redirect unauthorized users prior to serving static JS assets.
* **Layout Isolation:** Keep layout gates (`requireCustomerLayoutAccess`, `requireOwnerLayoutAccess`, etc.) in place to perform secondary, server-side checks. 
* **Refactoring Note:** Refactor [layout.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/portal/studio/layout.tsx) to use `requireOwnerLayoutAccess()` instead of duplicate, inline queries.

### 5.3. Where Partner/Seller Applications Should Connect Later
* **Onboarding Forms:**
  - **Seller application:** [seller/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/join/seller/page.tsx) must write applications directly to the future `public.seller_applications` table.
  - **Studio application:** [StudioOwnerSignupClient.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/studio-owner/signup/StudioOwnerSignupClient.tsx) must insert records into the future `public.partner_applications` table.
* **Role Promotion Pipeline:** Submitting applications does **not** change the user's role. Applicants remain standard `customer` users. The promotion to `studio_owner` or `vendor` must occur through an administrative action inside `/admin/leads` (backed by server actions in `/admin/leads/actions.ts`). Approval triggers a state shift on `public.profiles.role` and writes a corresponding record to `public.studio_owner_profiles` or `public.seller_profiles`.

---

## 6. Mock to Backend Gaps Analysis

The following components are currently mock-heavy and require backend wiring:

1. **Email & SMS OTP Flow:** 
   - Login OTP in [page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/login/page.tsx) relies on `supabase.auth.signInWithOtp` using only email.
   - True SMS OTP verification requires configuring Twilio/Vonage inside the Supabase console and updating client inputs to transmit phone numbers in E.164 formats.
2. **Intake Document Persistence:**
   - File uploads in [seller/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/join/seller/page.tsx) leverage `uploadProviderDocumentAction` to write files to the `provider-documents` storage bucket.
   - However, database application records in `provider_leads` or `studio_applications` are disconnected from the user's actual profile entity. They must be re-routed to the structured `public.partner_applications` / `public.seller_applications` tables.
3. **Admin Compliance and Auditing:**
   - Document verification pages in `/admin/owner-compliance` and `/admin/verifications` display simulated status fields and static JSON files. They must fetch signed storage URLs and update compliance columns on profiles directly.
4. **CRM and Pipeline Telemetry:**
   - Operational CRM routes (`/admin/leads`, `/admin/crm`) use hardcoded client datasets. They need queries linked to the structured intake tables.

---

## 7. Risks & Mitigations

> [!WARNING]
> Review these risks carefully before activating backend code patches.

* **Risk 1: Client-Side Claim Tampering**
  - *Description:* Attackers spoof custom roles in local storage or client state to access privileged subdirectories.
  - *Mitigation:* Zero Client Trust. Never trust the frontend role definitions. Layouts and API routes must extract and verify the user ID and role directly from the cryptographic JWT signature.
* **Risk 2: Role Escalation Vulnerabilities**
  - *Description:* Public profile updates (`UPDATE public.profiles`) permitting write operations on the `role` column, enabling users to self-promote to `admin`.
  - *Mitigation:* Hybrid Role Architecture. Guard administrative privileges by isolating them in a separate table (`public.user_roles`) containing a strict FK to `auth.users`. RLS policies must block public update requests from editing the `role` column in the `profiles` table.
* **Risk 3: Public Storage Disclosures**
  - *Description:* Storing national ID documents, CR records, and financial statements in public storage buckets, exposing sensitive Saudi business data to the open web.
  - *Mitigation:* Enforce private storage rules on the `provider-documents` bucket. The application must only serve these files using short-lived signed URLs (expiring in 5 minutes) via [provider-documents.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/lib/storage/provider-documents.ts) after checking role permissions.
* **Risk 4: Subdomain Session Contamination**
  - *Description:* Cookie storage sharing sessions across subdomains, allowing session tokens to be exposed.
  - *Mitigation:* Ensure Supabase token cookies are configured with `SameSite=Lax`, `HttpOnly`, and secure domain boundaries.

---

## 8. Recommended First Backend Patch

After verifying the database schema, the following initial patch is recommended to safely initiate the backend auth connection:

```
[Register Sync Triggers] ──► [Deploy public.profiles Schema] ──► [Verify Customer Self-Signup]
```

### Patch Goal
Establish a secure user registration baseline by deploying the `public.profiles` table and trigger-based profile bootstrapping.

### Step-by-Step Implementation
1. **Provision Enums & Table:** Execute migrations to deploy `public.user_role`, `public.account_status`, `public.onboarding_status`, and create the `public.profiles` table.
2. **Deploy Auto-Profile Sync Trigger:** Register the `handle_new_user_profile` trigger function. Verify that it executes as `SECURITY DEFINER` so it can write new profiles bypassing client restrictions.
3. **Configure Profiles RLS:** Deploy the base read/write security policies:
   ```sql
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow self read" ON public.profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Allow self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
   ```
4. **Smoke-Test Integration:** Register a test account via the `/signup` route. Verify that:
   - A user record appears in Supabase Auth.
   - The database trigger automatically inserts a corresponding profile row in `public.profiles`.
   - The default `role` is set to `'customer'` and `account_status` is `'active'`.
