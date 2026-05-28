# V3-A7: Partner / Seller / Admin Workflow Backend Contract

This contract defines the operational lifecycles, role assignment rules, administrative boundaries, security safeguards, Row Level Security (RLS) policies, and required API endpoints for the commercial partner, seller, and administrative workflows in GearBeat V3. It serves as the formal specification for future database migrations and backend integrations.

---

## 1. User Role Assignment Rules

To maintain strict boundary integrity and prevent privilege escalation, role assignments are governed by the following rules:

1. **Default Registration Role:**
   - Any self-registered user on `gearbeat.app` via `/signup` is initialized with the `customer` role in their public profile (`public.profiles.role = 'customer'`).
   - The user profile's onboarding status defaults to `'new'`, and their account status defaults to `'active'`.

2. **Commercial Promotion Gates:**
   - Users cannot self-select or upgrade their role to `studio_partner` or `seller`.
   - Role promotion is strictly gated by the administrative review workflow. A user's role is updated to `studio_partner` or `seller` only upon successful approval of their onboarding intake application by a verified `admin` or `super_admin`.

3. **Administrative Role Gating (Hybrid Role Model):**
   - Administrative roles (`support_operator`, `admin`, `super_admin`) are stored in the isolated `public.user_roles` table, completely decoupled from the public `profiles` table.
   - Promotion to any administrative role requires direct database insertion into the `public.user_roles` table. 
   - Write access to `public.user_roles` is restricted exclusively to existing `super_admin` accounts.

4. **Mutual Exclusivity:**
   - A single profile can only hold one role at a time in the `public.profiles.role` enum (`customer`, `studio_partner`, `seller`).
   - Users wishing to act as both a studio partner and a gear seller must maintain separate accounts to prevent security domain contamination and keep RLS parameters clean.

---

## 2. Onboarding & Profile Lifecycles

### 2.1. Partner Application Lifecycle

```
[Customer Sign-Up]
       │ (default: customer)
       ▼
[Intake Form Submitted]  ──► Creates partner_applications row (status: pending)
       │
       ▼
[Admin Audit Review]     ──► Transitions status to under_review
       │
       ├─► REJECT  ──────► status: rejected; user remains customer; feedback logged
       │
       └─► APPROVE ──────► status: approved; profiles.role = studio_partner;
                           Bootstraps public.studio_owner_profiles record
```

1. **Application Intake:**
   - A `customer` submits the studio partner intake form on `partners.gearbeat.app/apply`.
   - The system inserts a record into `public.partner_applications` with a status of `'pending'`, storing metadata and verification documents (e.g., Commercial Registration, business license) in a private storage bucket path.
   - The applicant's role in `public.profiles.role` remains `'customer'`.

2. **Audit & Review:**
   - An administrator pulls the application into the review queue. The status transitions to `'under_review'`.
   - The admin validates the documents (checking CR validity, IBAN, bank records, and studio location details).

3. **Resolution:**
   - **Rejection:** The administrator rejects the application, updating `public.partner_applications.status` to `'rejected'` and logging rejection reasons. The applicant remains a standard `'customer'` and receives an automated email. They can update and resubmit their details.
   - **Approval:** The administrator approves the application. The system executes a database transaction:
     - Updates `public.partner_applications.status` to `'approved'`.
     - Promotes the user's role in `public.profiles` to `'studio_partner'`.
     - Promotes `public.profiles.onboarding_status` to `'approved'`.
     - Creates a corresponding profile entry in `public.studio_owner_profiles` containing the studio's metadata, with `verified_badge` set to `false` by default.
     - Sends an email notifying the user of their portal activation, allowing them to access `portal.gearbeat.app`.

---

### 2.2. Seller Application Lifecycle

```
[Customer Sign-Up]
       │ (default: customer)
       ▼
[Intake Form Submitted]  ──► Creates seller_applications row (status: pending)
       │
       ▼
[Admin Audit Review]     ──► Transitions status to under_review
       │
       ├─► REJECT  ──────► status: rejected; user remains customer; feedback logged
       │
       └─► APPROVE ──────► status: approved; profiles.role = seller;
                           Bootstraps public.seller_profiles record
```

1. **Application Intake:**
   - A `customer` submits store details, VAT registration, national address, ID documents, and IBAN details via the `#become-seller` form.
   - The system inserts a record into `public.seller_applications` with a status of `'pending'`.
   - The user's role remains `'customer'`.

2. **Audit & Review:**
   - The application status changes to `'under_review'` when opened by an administrator.
   - The administrator audits the company documents against Saudi commercial compliance criteria.

3. **Resolution:**
   - **Rejection:** Application status is updated to `'rejected'`, leaving the user as a `'customer'`. Rejection reasons are stored and emailed.
   - **Approval:** Approval triggers a transactional update:
     - Updates `public.seller_applications.status` to `'approved'`.
     - Promotes the user's role in `public.profiles` to `'seller'`.
     - Promotes `public.profiles.onboarding_status` to `'approved'`.
     - Inserts a record into `public.seller_profiles` with `verified_seller` set to `false` by default.
     - Permits access to `seller.gearbeat.app`.

---

### 2.3. Studio Owner Profile Lifecycle

1. **Activation:**
   - Created automatically upon partner application approval.
   - Houses operational records, verified status, and serves as the foreign key target for studio listings, availability schedules, and reviews.

2. **Verification Levels:**
   - **Standard Partner:** Can create studio listings and accept bookings immediately.
   - **Certified Partner:** Administrators can toggle `verified_badge` to `true` in `public.studio_owner_profiles` under `/admin/certified-program`. This status highlights listings in public search and gives priority in discovery workflows.

3. **Suspension & Lockout:**
   - If a partner profile is flagged, an administrator can toggle `public.profiles.account_status` to `'suspended'`.
   - Upon suspension, all associated studio listings under `public.studio_owner_profiles` are immediately set to inactive or hidden in public directories, and any upcoming booking payouts are held in escrow.

4. **Archiving & Deletion:**
   - Changing `account_status` to `'pending_deletion'` initiates soft-delete triggers that pull all active studio schedules, disable public search pages, and cascade to delete profiles once active bookings are fulfilled.

---

## 3. Administrative Review & System Workflows

### 3.1. Admin Review Workflow

Administrators manage user onboarding, dispute resolution, and compliance checking inside the Command Center (`admin.gearbeat.app`).

1. **Audit Logs & Intakes:**
   - The admin views the lead queues at `/admin/leads` and selects an application.
   - The system requests a short-lived (5-minute expiration) signed storage URL to display sensitive business files (VAT registrations, national IDs) privately.

2. **State Updates:**
   - System updates transition through: `pending` ──► `under_review` ──► `approved` / `rejected`.
   - Transitions require the active admin's `user_id` to be logged in the database audit log.

3. **Notifications:**
   - Transitions trigger automated emails or SMS alerts communicating state changes, request revisions, or confirmation credentials.

---

### 3.2. Super_Admin-Only Actions

Certain high-risk actions are restricted exclusively to `super_admin` accounts (where `public.user_roles.role = 'super_admin'`):

- **Privileged Access Management:** Promoting, demoting, or creating entries in the `public.user_roles` table (e.g., granting someone `support_operator` or `admin` status).
- **Global Feature Controls & Launch Gating:** Toggling global system locks, read-only modes, or manually shutting down live payment APIs at `/admin/launch-controls`.
- **Financial Rule Adjustments:** Updating global system commission rates, platform transaction fee parameters, or overriding manual payout approvals.
- **Security Audit Purges:** The ability to delete or purge records in `public.auth_audit_events`. (Support Operators and regular Admins have read-only access with no delete capability).
- **Direct Database Override:** Executing billing adjustments or manual overrides on active Escrow accounts.

---

## 4. Approval, Rejection, and Suspension States

The system implements strict state rules to manage account suspension and application rejection:

| Account State | Allowed Client Actions | System Side-Effects | Recovery Path |
| :--- | :--- | :--- | :--- |
| **`active`** (Profile) | Full access to portal, marketplace, bookings, and profile settings. | Listings are visible; bookings can process. | N/A (Standard operating state). |
| **`suspended`** (Profile) | Read-only access to historic portal dashboard. Write actions blocked. | All active listings hidden; future bookings halted; payouts frozen. | Requires manual admin review and unsuspend action. |
| **`pending_deletion`** | Access disabled. User logged out immediately. | Active listings deleted; soft-deletion trigger scheduled. | Appeal to customer support before a 30-day cleanup window expires. |
| **`pending`** (Application) | View application status; submit updates. | User's profile role remains `customer`. | Waiting for admin audit. |
| **`under_review`** | Read-only preview of submitted application. | User's profile role remains `customer`. | Checked by admin. |
| **`approved`** (Application) | Redirected to portal setup page. | User promoted to `studio_partner` / `seller`. | N/A (Promotion finalized). |
| **`rejected`** (Application) | Edit intake details and resubmit. | User remains a `customer`; feedback log attached. | Re-submit corrected business documents. |

---

## 5. Security & Isolation Boundaries

### 5.1. Customer Boundaries
- Customers (`profiles.role = 'customer'`) can only read their own profile row.
- They are blocked from accessing any subdomains other than `gearbeat.app` and `partners.gearbeat.app`.
- They cannot query `public.user_roles`, `public.partner_applications`, or other users' profiles.

### 5.2. Partner / Seller Boundaries
- Studio Partners can access `portal.gearbeat.app` but are blocked from `seller.gearbeat.app` and `admin.gearbeat.app`.
- Sellers can access `seller.gearbeat.app` but are blocked from `portal.gearbeat.app` and `admin.gearbeat.app`.
- Cross-read operations are prevented: Studio Partners cannot view marketplace seller products from the backend portal, and Sellers cannot view studio booking pipelines.

### 5.3. Admin Security Risks & Mitigations
- **Risk: Client-Side Claim Spoofing**
  - *Mitigation:* Zero Client Trust. All layout guards and API endpoints verify the role directly from the decrypted JWT payload signature (`auth.jwt() -> 'app_metadata' ->> 'role'`).
- **Risk: Role Escalation via Profile Update**
  - *Mitigation:* The `role` column in `public.profiles` is protected. Updates to `profiles.role` reject requests if `auth.uid()` is not an authorized administrator. Administrative roles are isolated in the `public.user_roles` table, which client endpoints cannot modify.
- **Risk: Document Leakage (IDOR)**
  - *Mitigation:* All intake uploads go to private storage buckets. Public access is disabled. Files can only be downloaded by requesting a signed URL from the backend, which verifies the user's role is `admin` or `support_operator` (or the owner of the document).
- **Risk: Admin Session Hijacking**
  - *Mitigation:* MFA validation is mandatory for admins. The `admin_profiles` table checks `mfa_verified` flags before permitting actions on `/admin/*` subroutes.

---

## 6. Required Row Level Security (RLS) Assumptions

To enforce the above boundaries at the database layer, migrations must implement the following RLS policies:

### 6.1. `public.profiles`
```sql
-- Select: Allow self read, or support/admin read
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('support_operator', 'admin', 'super_admin')
  )
);

-- Update: Allow self update (restricted to non-role fields) or admin update
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  -- Trigger-level check or column checks to prevent users from altering:
  -- role, account_status, onboarding_status
  (auth.uid() = id AND (
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid())
    AND onboarding_status = (SELECT onboarding_status FROM public.profiles WHERE id = auth.uid())
  ))
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

### 6.2. `public.user_roles` (Admin Lookup)
```sql
-- Select: Admins can view all admin roles, users can view their own
CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('support_operator', 'admin', 'super_admin')
  )
);

-- Write: Restricted entirely to super_admin
CREATE POLICY "user_roles_write_policy" ON public.user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);
```

### 6.3. `public.partner_applications` & `public.seller_applications`
```sql
-- Select: Allow self read, or support/admin read
CREATE POLICY "applications_select_policy" ON public.partner_applications FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('support_operator', 'admin', 'super_admin')
  )
);

-- Insert: Any customer user can submit their own application
CREATE POLICY "applications_insert_policy" ON public.partner_applications FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid()
  ) = 'customer'::public.user_role
);

-- Update: Gated strictly to admins
CREATE POLICY "applications_update_policy" ON public.partner_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

### 6.4. `public.studio_owner_profiles` & `public.seller_profiles`
```sql
-- Select: Publicly readable for listings and marketplace details
CREATE POLICY "commercial_profiles_select_policy" ON public.studio_owner_profiles FOR SELECT
USING (true);

-- Update: Owner updates their metadata, admins update badge / verified fields
CREATE POLICY "commercial_profiles_update_policy" ON public.studio_owner_profiles FOR UPDATE
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  (user_id = auth.uid() AND (
    verified_badge = (SELECT verified_badge FROM public.studio_owner_profiles WHERE user_id = auth.uid())
  ))
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

---

## 7. Security Auditing Requirements

The `public.auth_audit_events` table must record all occurrences of the following events:

1. **`AUTH_LOGIN_SUCCESS` / `AUTH_LOGIN_FAILURE`:**
   - Logs user credentials status, source IP address, and browser User-Agent.

2. **`AUTH_MFA_CHALLENGE`:**
   - Tracks success or failure of secondary factor checks for operator logins.

3. **`ADMIN_APPLICATION_STATE_CHANGE`:**
   - Records when an application is moved to `under_review`, `approved`, or `rejected`.
   - Fields: `admin_id`, `target_user_id`, `application_type` (partner/seller), `previous_status`, `new_status`, `rejection_reason` (if applicable).

4. **`PRIVILEGED_ROLE_ASSIGNMENT`:**
   - Captures any direct insertion, update, or deletion in `public.user_roles`.
   - Fields: `super_admin_id`, `target_user_id`, `assigned_role`.

5. **`USER_ACCOUNT_SUSPENDED` / `USER_ACCOUNT_UNSUSPENDED`:**
   - Logs when an admin updates a user profile's status to `suspended` or `active`.
   - Fields: `admin_id`, `target_user_id`, `action_type`, `reason`.

6. **`CRITICAL_DATA_ACCESS`:**
   - Logs whenever an administrator or support operator requests a signed URL to read sensitive partner documents (VAT certificates, national IDs).

---

## 8. Required Backend API Endpoints (Future Phases)

To support these workflows, subsequent phases must implement the following API contracts:

### 8.1. Onboarding Intake Endpoints
- **`POST /api/partners/apply`**
  - **Auth:** Required (`customer` session).
  - **Payload:** `{ studio_name: string, city: string, verification_documents: object }`
  - **Effect:** Inserts row in `public.partner_applications` with status `'pending'`.
- **`POST /api/sellers/apply`**
  - **Auth:** Required (`customer` session).
  - **Payload:** `{ store_name: string, id_document_path: string }`
  - **Effect:** Inserts row in `public.seller_applications` with status `'pending'`.

### 8.2. Admin Application Management
- **`GET /api/admin/applications`**
  - **Auth:** Required (`admin` or `super_admin`).
  - **Query Parameters:** `type` (partner/seller), `status` (pending/under_review/approved/rejected).
  - **Effect:** Returns list of applications with applicant profiles.
- **`POST /api/admin/applications/[id]/review`**
  - **Auth:** Required (`admin` or `super_admin`).
  - **Payload:** None.
  - **Effect:** Transitions application status to `'under_review'`, writes `CRITICAL_DATA_ACCESS` audit event.
- **`POST /api/admin/applications/[id]/approve`**
  - **Auth:** Required (`admin` or `super_admin` with verified MFA).
  - **Payload:** None.
  - **Effect:** Sets application status to `'approved'`. In a database transaction, changes `profiles.role` to target commercial role, sets `onboarding_status` to `'approved'`, and inserts matching commercial profile. Emits `ADMIN_APPLICATION_STATE_CHANGE` audit log.
- **`POST /api/admin/applications/[id]/reject`**
  - **Auth:** Required (`admin` or `super_admin`).
  - **Payload:** `{ reason: string }`
  - **Effect:** Sets application status to `'rejected'`, logs rejection reason, keeps user role as `customer`. Emits `ADMIN_APPLICATION_STATE_CHANGE` audit log.

### 8.3. Admin Profile & Status Controls
- **`POST /api/admin/users/[id]/suspend`**
  - **Auth:** Required (`admin` or `super_admin` with verified MFA).
  - **Payload:** `{ reason: string }`
  - **Effect:** Changes user's `profiles.account_status` to `'suspended'`. Triggers inactivation of linked studio/seller listings. Logs `USER_ACCOUNT_SUSPENDED` audit event.
- **`POST /api/admin/users/[id]/unsuspend`**
  - **Auth:** Required (`admin` or `super_admin` with verified MFA).
  - **Payload:** None.
  - **Effect:** Reverts `profiles.account_status` to `'active'`. Logs `USER_ACCOUNT_UNSUSPENDED` audit event.

### 8.4. Super Admin Administrative Controls
- **`POST /api/admin/roles/assign`**
  - **Auth:** Required (`super_admin` with verified MFA).
  - **Payload:** `{ user_id: string, role: admin_role }`
  - **Effect:** Inserts or updates a record in `public.user_roles`. Logs `PRIVILEGED_ROLE_ASSIGNMENT` audit event.
- **`POST /api/admin/launch-controls/lock`**
  - **Auth:** Required (`super_admin` with verified MFA).
  - **Payload:** `{ system_lock: boolean, reasons: string }`
  - **Effect:** Updates the global system settings table, toggling write locks or payment processing gates. Logs `SYSTEM_CONFIG_CHANGED` audit event.
