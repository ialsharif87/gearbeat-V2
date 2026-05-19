# GEARBEAT PATCH 126C — PROFILE REPAIR LOCKDOWN & FOUNDER ACCOUNT RESET RUNBOOK

This patch locks down the `/profile/repair` path, removing manual role selection, and provides a clear runbook for founder account management.

---

## 1. Profile Repair Isolation

### Root Issue Found in `/profile/repair`
Previously, the profile repair page displayed a `<select>` dropdown letting users manually choose between "Customer" and "Studio Owner" accounts. This created a security risk where an unconfigured or partially-created account could self-assign a role, bypass signup intake rules, and introduce routing confusion.

### Final Repair Behavior
* **No Manual Selection:** The selection dropdown has been completely removed.
* **Intent Inference:** The system checks `user_metadata.role` from the authenticated Supabase user object to determine the signup route:
  - If `customer` or `user` -> Inferred as **Customer**
  - If `owner` or `studio_owner` -> Inferred as **Studio Owner**
* **Support Lockdown Mode:** If `user_metadata.role` is missing, null, or is an unrecognized value, the form is locked. A premium, localized message is shown:
  - **English:** "Support Review Required. Your account configuration could not be verified automatically. Please contact support."
  - **Arabic:** "مراجعة الدعم مطلوبة. تعذر التحقق من تهيئة حسابك تلقائياً. يرجى الاتصال بالدعم."
  - A **Sign Out** button is provided to let the user clear their session.

---

## 2. Role Boundaries & Intakes

To maintain strict boundary safety, the following ingress and egress routes must be strictly followed:

| Account Type | Signup Page | Login Page | Canonical Role Value | Post-Authentication Target |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `/signup` | `/login` | `customer` | `/customer` |
| **Studio Owner** | `/studio-owner/signup` | `/login` | `studio_owner` (maps to `owner`) | `/portal/studio` |
| **Admin / Super Admin** | *None (Intentionally absent)* | `/admin/login` | `admin` / `super_admin` | `/admin` |
| **Seller / Merchant** | *None (Future intake)* | `/login` | `vendor` (maps to `seller`) | `/portal/store` |

---

## 3. Founder Account Reset Runbook

When developing, testing, or cleaning up broken partial accounts in your local or production database, use the following manual checklist:

### A. Pre-Deletion Verification (Supabase Dashboard)
1. **Never delete accounts programmatically or through un-audited SQL script runs.**
2. Go to the **Supabase Database/Table Editor** and inspect the `profiles` table.
3. Search for the target email or user ID.
4. **Foreign Key Safety:** Check if the user has active bookings (`bookings` table), ledger entries, or store associations. Deleting the auth user directly without clearing dependent data may trigger database constraint errors.
5. In the **Authentication** section of Supabase, locate the user and click **Delete User** only after database reference verification.

### B. Clean Test Accounts Standard
When testing the platform, configure one account per role using safe, isolated credentials.
* **Admin Test User:** Must have a record in `admin_users` table with status `active`.
* **Customer Test User:** Standard user created via `/signup`.
* **Studio Owner Test User:** Partner user created via `/studio-owner/signup`.

> [!IMPORTANT]
> **No Passwords in Repo:** Under no circumstances should test credentials (especially passwords) be written to documentation, source files, or commit messages. Always use local env files or enter passwords manually during manual runs.

### C. Founder Self-Test Sequence
To verify end-to-end authentication isolation:
1. **Step 1:** Clear browser cookies and storage.
2. **Step 2 (Customer Signup):** Go to `/signup`, create an account, verify redirect to dashboard, and check that a `profiles` row with role `customer` was created.
3. **Step 3 (Studio Owner Signup):** Go to `/studio-owner/signup`, create an account, verify redirect to `/portal/first-login` (or pending screen), and check that a `profiles` row with role `owner` was created.
4. **Step 4 (Admin Access):** Go to `/admin/login`, attempt log in with a customer/owner account, and verify it displays **Access Denied**. Log in with an active admin account and verify it redirects to `/admin`.
5. **Step 5 (Profile Repair):** Log in with an account that has no `profiles` record. Ensure that if it has no role metadata, it halts with **Support Review Required**; if it has a role metadata, it completes profile details without letting the user edit the role.
