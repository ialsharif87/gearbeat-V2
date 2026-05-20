# GearBeat Patch 127B: Auth Journey Contract Reset

## Objective

Reset GearBeat's visible auth journey contract across public, partner, portal, and admin surfaces without changing database schema, Supabase settings, OTP logic, account status values, payment logic, or subdomain routing.

## Final Intended Auth Contract

### 1. Customer signup and login

Customers use `gearbeat.app` for public/customer account creation and login.

Expected journey:

1. Customer signs up on `gearbeat.app`.
2. Customer confirms email.
3. Customer logs in through `/login`.
4. Customer can access customer profile/dashboard.
5. Customer can browse, book studios, and buy marketplace products.

Customer signup copy must not sound like a studio owner, seller, or partner application.

### 2. Partner application intake

Studio owners and sellers start from `partners.gearbeat.app`, which redirects to `/partners/apply`.

Partner intake is not portal access. It is the start of an application and review lifecycle. Public partner intake must not imply immediate dashboard access, admin access, or approved partner status.

### 3. Studio owner approval flow

Expected journey:

1. Studio owner applies from `partners.gearbeat.app` / `/partners/apply`.
2. If account/application auth is used, the applicant confirms email.
3. Applicant completes required business/legal review steps.
4. Applicant sees clear pending review language: GearBeat reviews within 2 business days.
5. Admin reviews the application.
6. If approved, studio owner receives secure portal access instructions.
7. Studio owner logs in through `portal.gearbeat.app`.
8. Studio owner accesses `/portal/studio` only after approval.

### 4. Seller approval flow

Expected journey:

1. Seller applies from `partners.gearbeat.app` / `/partners/apply`.
2. If account/application auth is used, the applicant confirms email.
3. Applicant completes seller review requirements.
4. Applicant sees pending review language.
5. Admin reviews the application.
6. If approved, seller receives secure seller portal access instructions.
7. Seller logs in through `seller.gearbeat.app`.
8. Seller accesses `/portal/store` only after approval.

### 5. Portal access after approval

Portal login is for approved partners only:

- `portal.gearbeat.app` is for approved studio owners.
- `seller.gearbeat.app` is for approved sellers.
- `/portal/login` must not read like a public signup funnel.
- Non-approved, suspended, rejected, or incomplete partner accounts should remain routed to pending/repair flows already enforced by existing code.

### 6. Admin review lifecycle

Admins use `admin.gearbeat.app` for internal review and lifecycle actions.

Admin responsibilities:

- Review partner applications and leads.
- Approve, request changes, reject, or delete applications according to existing admin flows.
- Do not write invalid `profiles.account_status` values.
- Do not promote customers into partner or admin roles through public signup.
- Do not send plain temporary passwords by email.

### 7. Email confirmation vs OTP vs Magic Link boundaries

- Email confirmation validates the account email after signup.
- OTP/Magic Link login validates a login attempt for an existing account.
- OTP must not be described as application approval.
- Magic Link/OTP must not imply a partner has been approved.
- Admin approval is a separate business lifecycle step and must remain distinct from auth verification.

## Copy and Contract Changes in Patch 127B

- Customer signup now identifies itself as a customer account for booking, profile access, and marketplace shopping.
- Customer signup now sends studio owners and sellers to partner application intake instead of the legacy studio-owner signup path.
- Partner intake copy no longer reads as a future architecture preview.
- Partner intake states that portal access is granted only after admin review and approval.
- Partner intake mentions review within 2 business days.
- Portal login now says it is for approved studio owners and sellers.
- Admin login now says it is internal access only.
- Admin lead approval UI no longer says temporary passwords are sent.
- Studio approval email content no longer includes a plain temporary password and instead directs the applicant to the secure portal password reset/setup path.

## Intentionally Not Changed

- No database tables or migrations were added.
- No Supabase settings were changed.
- No Supabase auth email templates were changed.
- No OTP behavior or token validation logic was changed.
- No account status values were changed.
- No payment, rewards, wallet, referral, booking, marketplace order, or checkout logic was changed.
- No subdomain redirects from Patch 127A/127A-2 were changed.
- No full secure invite implementation was added in this patch.

## Secure Invite Status

The current admin approval code still provisions or updates an auth user with a random initial password as part of the existing flow. Patch 127B removes plain temporary password disclosure from email and UI copy.

A future patch should replace that provisioning step with a first-class secure invitation or set-password flow.

## Smoke Test Checklist

1. `/signup` reads as customer signup.
2. `/studio-owner/signup` does not promise immediate portal access.
3. `/partners/apply` reads as partner application intake and says review occurs within 2 business days.
4. `/login` remains customer/general login.
5. `/portal/login` reads as approved partner access.
6. `/admin/login` reads as internal admin access only.
7. `/portal/studio` still compiles.
8. `/portal/store` still compiles.
9. `/admin` still compiles.

## Safety Confirmation

- No users deleted.
- No SQL executed.
- No Supabase db push executed.
- No `.env` changes.
- No auth schema changes.
- No payment changes.
