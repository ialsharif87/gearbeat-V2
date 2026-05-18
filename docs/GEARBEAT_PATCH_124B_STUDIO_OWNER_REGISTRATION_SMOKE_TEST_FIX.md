# GEARBEAT PATCH 124B — STUDIO OWNER REGISTRATION SMOKE TEST & SCHEMA COMPATIBILITY FIX

> [!NOTE]
> This functional readiness patch resolves a critical check constraint conflict in the Studio Owner registration path, ensuring a seamless founder self-test journey.

---

## 1. Audit and Root Cause Analysis

### The Problem
During the registration flow, when a user selected **Studio Owner / صاحب استوديو**, the client state passed `role: "studio_owner"` to the Supabase Auth metadata and the `profiles` table database insertion:
```typescript
const [role, setRole] = useState<"customer" | "studio_owner">("customer");
```
However, the database `profiles` table contains a strict check constraint restricting values in the `role` column:
```sql
check: role = ANY (ARRAY['customer'::text, 'owner'::text, 'vendor'::text])
```
Because `"studio_owner"` is not inside the permitted database roles, the insert statement failed immediately with a database Check Constraint violation, blocking the registration flow completely.

### The Solution
We implemented a robust mapping layer in `SignupClient.tsx`. When writing to the database `profiles` table and Auth User Metadata, `"studio_owner"` is mapped to `"owner"`:
```typescript
role: role === "studio_owner" ? "owner" : role
```
Because the GearBeat route guards (`lib/auth-guards.ts`), role routing system (`lib/role-routing.ts`), and owner portals (`app/portal/studio/create-studio/page.tsx`) fully normalize and support both `"owner"` and `"studio_owner"` interchangeably, this change guarantees:
1. **Perfect Check Constraint Compliance:** Database insertions succeed without violations.
2. **Seamless Portal Routing:** Registered owners are correctly routed to the Studio Owner portal.
3. **No Legacy Discrepancies:** Auth metadata and profiles table role values remain 100% in sync.

---

## 2. Founder Self-Test Journey

A founder can fully self-test this flow step-by-step on their local environment.

### Step 1: Access the Signup Flow
1. Navigate to the registration page:
   - **URL:** `/signup?account=owner`
2. Enter the test credentials:
   - **Full Name:** `Founder Self-Test Owner`
   - **Email:** `test-owner@gearbeat.com` (or any unique address)
   - **Phone Number:** Enter a valid Saudi phone number (e.g. `+966 50 123 4567`)
   - **Role:** Select **Studio Owner / صاحب استوديو**
   - **Password:** Must be at least 8 characters and contain at least three of: lowercase, uppercase, numbers, and special characters.

### Step 2: Form Submission & Verification
1. Submit the form by clicking **Create Account**.
2. Under the local/preview environment, the `profiles` record is successfully created with the compliant `'owner'` role.
3. The page will present the Verification Step notifying you that an email verification link was sent.

### Step 3: Enter the Studio Owner Portal
1. Login with the newly registered owner credentials at `/portal/login`.
2. Once logged in, the system checks the `profiles` role and routes the user directly to `/portal/studio`.
3. To create a new studio profile, navigate to the **Create Studio** page:
   - **URL:** `/portal/studio/create-studio`

### Step 4: Submit a Studio Profile
1. Populate the form fields with test data:
   - **Studio Name:** `Riyadh Sound Lab`
   - **Starting Price:** `250 SAR`
   - **Location:** Riyadh
   - **Description:** A premier analog recording and mastering studio.
   - **Cover Image:** (Optional) Upload a standard JPG/PNG cover image.
2. Click **Submit Studio for Review**.
3. The system inserts the record into the `studios` table with `status: 'pending'`, `verified: false`, and `owner_auth_user_id: user.id` (using the correct, non-FK nullable owner mapping).

### Step 5: Admin Review & Approval
1. Log in as an Administrator/Super Admin and navigate to the **Approved Studios** console:
   - **URL:** `/admin/studios`
2. You will see `Riyadh Sound Lab` listed with a `status: 'pending'` and status badge.
3. Click the **Activate** action button.
4. The system executes the status transition, marking the studio as `status: 'approved'`, `booking_enabled: true`, and `verified: true`, instantly making it bookable.

---

## 3. Technical Verification & Branch Info

- **Git Branch:** `patch-124b-studio-owner-registration-smoke-test-fix`
- **Base Branch:** `patch-123g-integrate-crm-manual-ops-rewards-sql-review`
- **Modified File:** `app/signup/SignupClient.tsx`
- **Status:** Staged, committed, and successfully pushed to origin.
- **Next.js Production Build status:** Compiled & verified with 0 errors.
