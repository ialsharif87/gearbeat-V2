# GEARBEAT PATCH 126B — ADMIN LOGIN BOUNDARY FIX

This patch establishes secure admin/operator authentication boundaries, ensuring administrative portals are isolated from customer/partner paths.

---

## 1. Authentication Configuration

* **Current/Legacy Admin Login Route Found:** `/staff-access`
* **Final Admin Login Target:** `/admin/login`
* **Administrative Role Values Supported:** `super_admin`, `admin` (enforced via the `admin_users` table with status `active`)

---

## 2. Access & Redirection Behaviors

### Customer & Operator Separation
* **Admin Login (`/admin/login`):** Validates credentials using Supabase Auth, queries `admin_users` to confirm active staff status, and redirects verified staff members to `/admin`. All non-staff attempts trigger Access Denied.
* **Customer Login (`/login`):** Serves customers. If an authenticated administrator/operator lands on or attempts to access `/login`, they are dynamically intercepted and routed directly to `/admin` instead of customer areas.
* **Legacy Endpoint (`/staff-access`):** Safe client-side redirect routes any existing bookmarks or legacy queries directly to the new target (`/admin/login`).

### Protection of `/admin` Pages
* **Unauthenticated Access:** Automatically intercepted by `requireAdminLayoutAccess()` and redirected to `/admin/login`.
* **Non-Admin Authenticated Access:** Non-admin users attempting to access `/admin` sub-paths are redirected to their respective role-based dashboards (e.g., `/portal/studio` for studio owners, `/portal/store` for vendors, or `/customer` for customers).
* **Missing Profile Redirection:** If an authenticated session lacks a profile record, they are routed to `/profile/repair` to prevent infinite redirect loops.

---

## 3. Files Changed

* **`lib/route-guards.ts`**: Updated layout guard target to `/admin/login` from `/staff-access`.
* **`app/login/page.tsx`**: Prevented admins from landing on `/customer` areas by checking `admin_users` and profile roles on mount, password login, and OTP verification.
* **`app/staff-access/page.tsx`**: Converted to client-side redirect pointing to `/admin/login`.
* **`app/admin/login/page.tsx`**: Created a beautiful, localized administrative console for platform operators.
* **`docs/GEARBEAT_PATCH_126B_ADMIN_LOGIN_BOUNDARY_FIX.md`**: Created this documentation.

---

## 4. Verification & Testing Checklist

- [ ] **Unauthenticated Access to `/admin`:**
  - Verify navigating to `/admin` redirects to `/admin/login`.
- [ ] **Legacy Path Redirect:**
  - Verify `/staff-access` redirects immediately to `/admin/login`.
- [ ] **Authorized Admin Login:**
  - Verify active admin logs in at `/admin/login` and lands on `/admin`.
- [ ] **Unauthorized Admin Login:**
  - Verify customer account trying to log in at `/admin/login` fails with "Access denied".
- [ ] **Admin Landing on `/login`:**
  - Verify logged-in admin attempting `/login` gets redirected to `/admin`.
- [ ] **Non-Admin Access to `/admin`:**
  - Verify logged-in customer/owner attempting to visit `/admin` gets redirected to their dashboard.

---

## 5. Next Steps

No additional patches are needed for auth isolation. Boundaries between customer paths, partner consoles, and admin dashboards are now fully secure.
