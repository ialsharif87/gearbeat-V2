# GearBeat Patch 126E: Account Status Constraint & Admin Lifecycle Alignment Fix

## Root Cause

Admin studio lead approval attempted to upsert `profiles.account_status = "approved"` in `app/admin/leads/actions.ts`.

Production enforces `profiles_account_status_check`, so the profile write failed with:

`new row for relation "profiles" violates check constraint "profiles_account_status_check"`

`approved`, `pending`, and `rejected` are business approval states. They must stay on lead/application/vendor records, not on `profiles.account_status`.

## Allowed `profiles.account_status` Values

Confirmed by read-only database constraint inspection:

- `active`
- `pending_deletion`
- `deleted`
- `suspended`

## Files Changed

- `app/admin/leads/actions.ts`
- `app/admin/leads/[id]/page.tsx`
- `app/admin/sellers/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/vendors/page.tsx`
- `app/portal/login/page.tsx`
- `app/portal/store/layout.tsx`
- `lib/route-guards.ts`
- `docs/GEARBEAT_PATCH_126E_ACCOUNT_STATUS_CONSTRAINT_ADMIN_LIFECYCLE_FIX.md`

## Invalid Statuses Found And Fixed

- `app/admin/leads/actions.ts`
  - Fixed invalid profile write: `approved` -> `active`.
  - Studio application approval remains on `studio_applications.status = "approved"`.
- `app/admin/sellers/page.tsx`
  - Removed synthetic `account_status = "approved"` from approved seller leads that have not signed up.
  - Seller profile status updates are now limited to `active` or `suspended`.
- `app/admin/users/page.tsx`
  - Admin user lifecycle actions now validate profile status against the DB-allowed set before writing.
  - User deletion action now marks the profile as `deleted` instead of deleting auth/profile records from this page.
- `app/admin/vendors/page.tsx`
  - Vendor suspension now maps to `profiles.account_status = "suspended"`.
  - Vendor approval/rejection/pending states stay on `vendor_profiles.status`.
- `app/portal/login/page.tsx`
  - Removed legacy checks for invalid profile statuses `pending` and `under_review`.
  - Vendor pending/rejected/suspended routing now uses `vendor_profiles.status`.

## Final Lifecycle Mapping

- Active usable account -> `profiles.account_status = "active"`
- Suspended or blocked account -> `profiles.account_status = "suspended"`
- Deletion requested -> `profiles.account_status = "pending_deletion"`
- Deleted account marker -> `profiles.account_status = "deleted"`
- Lead/application approval -> `provider_leads.status` or `studio_applications.status`
- Vendor approval lifecycle -> `vendor_profiles.status`

## Admin Leads Approval Behavior

- Approving a studio lead creates or updates the profile with `account_status = "active"`.
- Business approval remains on `studio_applications.status = "approved"`.
- Request update and rejection actions update `provider_leads.status` only.
- Admin lead action failures return user-safe messages and log safe diagnostic details with `console.warn`.
- Raw database constraint text is not surfaced through browser alerts.

## Account Delete/Suspend Behavior

- Admin user suspend/activate writes only DB-allowed values.
- Admin user delete marks a non-admin profile as `deleted`; it does not delete the auth user.
- Admin accounts are blocked from deletion through the admin user management page.
- Vendor suspension sets both the business status to `vendor_profiles.status = "suspended"` and the profile status to `suspended`.

## Role Alignment

- Customer role remains `customer`.
- Studio owner roles supported by existing routes are `owner` and `studio_owner`.
- Seller/vendor role remains `vendor`.
- Admin access remains governed by `admin_users.admin_role`, including `admin` and `super_admin`.
- Role values are not written to or inferred from `profiles.account_status`.

## Schema/RLS Migration Needed

No schema or RLS migration is needed for this patch.

The existing production constraint is valid. The application code now writes only allowed profile account status values and keeps business workflow states on their own tables.

## Fresh Test Checklist

1. Admin login completes and lands on `/admin`.
2. Approve lead: profile status remains `active`, application/lead status carries approval.
3. Reject lead: no profile status write is attempted.
4. Request changes: no profile status write is attempted.
5. Suspend account if supported: profile status becomes `suspended`.
6. Customer signup: profile status is `active`.
7. Studio owner signup: profile status is `active`; onboarding state remains outside `profiles.account_status`.

## Safety Confirmations

- No real users were deleted.
- No users were created during this patch work.
- No SQL writes were executed.
- No Supabase db push was executed.
- No Supabase migration files were changed.
- No payment, rewards, wallet, referral, booking, marketplace order, or marketplace payment logic was changed.
