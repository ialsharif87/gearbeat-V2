# 🛠️ GearBeat V2 — Developer Brief & Action Plan

> **For:** Backend/Full-stack Developer continuing work on GearBeat V2
> **Stack:** Next.js 15 (App Router) + Supabase (Auth/Postgres/RLS) + TypeScript + Resend
> **Status:** Pre-launch / Active development
> **Goal of this brief:** Document all critical issues found in the current codebase and provide a prioritized action plan to fix the foundation before adding more features.

---

## 1. Project Overview (as observed in the code)

GearBeat is a two-sided marketplace for Saudi Arabia / GCC:

- **Studio booking marketplace** — customers book recording / podcast / rehearsal studios.
- **Gear marketplace** — vendors sell music & audio equipment to customers.

**User roles:**
- `customer` — books studios, buys gear
- `owner` — lists & manages studios
- `vendor` — sells gear
- `admin` — 6 sub-roles: `super_admin`, `operations`, `support`, `content`, `sales`, `finance`

**Key flows already implemented (partially):**
- Auth with role separation (Supabase Auth + `profiles` / `admin_users` / `vendor_profiles` tables)
- Studio listing, detail page, booking request
- Customer dashboard, owner dashboard, vendor dashboard, admin dashboard
- Bilingual UI (AR / EN) via `<T en="" ar="" />` component
- Account deletion request flow with admin review
- Review request automation via daily cron + Resend
- Audit logging (partial)
- Owner finance / payouts / commissions / bank accounts
- Vendor onboarding + product creation

**Project understanding:** This is a development/staging build. Payment integration, full checkout, and several flows are intentionally stubbed. The brief below focuses on **architecture, data integrity, security primitives, and what's structurally missing** — NOT on completing the stubbed payment/checkout work, which is owned by the team and tracked separately.

---

## 2. 🔴 CRITICAL — Must Fix Before Anything Else

These are blockers — they break the app, the schema, or basic security.

### 2.1 Auth layer is split across two contradictory files

**Problem:**
- `lib/auth.ts` queries a `users` table that does **not exist** in the schema.
- `lib/route-guards.ts` queries `profiles` (which is what the rest of the app uses).
- Only `app/customer/page.tsx` uses the broken `requireRole()` from `lib/auth.ts`.

**Effect:** `/customer` page will always redirect to `/forbidden` once `requireRole` returns `null` (because the `users` table doesn't exist).

**Fix:**
1. **Delete `lib/auth.ts` entirely.**
2. Refactor `app/customer/page.tsx` to read profile from `requireCustomerLayoutAccess()` already running in the parent layout — pass the profile down via the layout, or re-query `profiles` directly.
3. Search the codebase for any other reference to `requireRole`, `getCurrentProfile` from `lib/auth.ts`, or `from("users")` and remove/replace them.

---

### 2.2 Database schema is 65% undocumented

**Problem:**
- `marketplace-foundation.sql` defines **13 tables**.
- The code queries **38 tables** (see grep below).
- 25 tables exist only in production Supabase, with no migration file in the repo.

**Missing tables (no schema in repo):**
```
account_deletion_requests, admin_users, audit_logs, booking_commissions,
bookings, commission_settings, owner_agreements, owner_bank_accounts,
owner_compliance_documents, owner_compliance_profiles, platform_payment_transactions,
platform_payments, platform_payout_items, platform_payouts, platform_refunds,
platform_settlements, profiles, review_requests, reviews, studio_accelerations,
studio_commissions, studio_equipment, studio_feature_links, studio_features,
studio_images, studio_performance_daily, studios
```

**Effect:** No one can stand up a fresh dev/staging environment. No code review can verify queries match the schema. RLS policies for these tables are invisible.

**Fix:**
1. **Export the entire production schema** from Supabase (Dashboard → SQL Editor → `pg_dump --schema-only` or use Supabase CLI).
2. Set up `supabase/migrations/` with `supabase init` + `supabase db pull` (Supabase CLI) so future schema changes are version-controlled.
3. Add `supabase/seed.sql` for local dev seed data.
4. Document each table in `docs/schema.md` (purpose, key relationships, RLS approach).

---

### 2.3 RLS is enabled but the code bypasses it everywhere

**Problem:**
- 43 files use `createAdminClient()` (service role key → bypasses RLS).
- The SQL file enables RLS on `marketplace_*` tables but **only defines SELECT policies** — no INSERT/UPDATE/DELETE policies. So end-user keys can't write at all; the entire write path goes through service role.
- Security depends 100% on manual JS checks. One bad route = full data exposure.

**Fix:**
1. **Audit every `createAdminClient()` call.** For each:
   - If the action is something a user should be able to do for themselves (e.g. read own bookings, update own profile, add to own wishlist), switch to `createClient()` (anon key + RLS).
   - If it's a privileged action (admin moderation, cron, financial calculations), keep `createAdminClient()` but verify the route has a hard `requireAdminRole(...)` or `isAuthorizedCronRequest(...)` gate **before** any DB call.
2. **Write a complete RLS policy set** for every table. Pattern for user-owned rows:
   ```sql
   CREATE POLICY "owner_can_select" ON bookings
     FOR SELECT USING (auth.uid() = customer_auth_user_id);
   CREATE POLICY "owner_can_insert" ON bookings
     FOR INSERT WITH CHECK (auth.uid() = customer_auth_user_id);
   ```
3. Add a CI check (or pre-commit script) that flags new uses of `createAdminClient()` in user-facing routes for review.

---

### 2.4 Vendor signup = privilege escalation

**File:** `app/vendor-signup/page.tsx`

**Problem:** Role is sent from the **client** in `user_metadata`:
```ts
options: { data: { full_name: fullName, role: 'vendor' } }
```
Anyone can sign up as a vendor by hitting the form (or by crafting a direct Supabase Auth call with `role: 'admin'`).

**Fix:**
1. Never trust client-supplied role. Remove `role` from `user_metadata`.
2. Move vendor account creation to a **Server Action** that:
   - Creates the auth user
   - Creates a `vendor_profiles` row with `status: 'pending'`
   - Does NOT grant vendor access until an admin approves it (already supported by `vendor_profiles.status` field).
3. The role-resolution code in `lib/route-guards.ts` should ignore `user_metadata.role` entirely and rely only on database tables (`admin_users`, `profiles`, `vendor_profiles`).

---

### 2.5 Login leaks which emails are registered

**File:** `app/login/page.tsx`

**Problem:**
```ts
if (!existingProfileByEmail && !existingAdminByEmail) {
  redirect(loginRedirectPath({ error: "no_account" }));
}
```
This explicitly tells an attacker which emails exist before checking the password. Classic user-enumeration vulnerability.

**Fix:**
- Remove the pre-check entirely. Let `signInWithPassword()` fail. Always return the same generic error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" / "Email or password is incorrect."
- Same applies to "Forgot password" — always return success message regardless of whether the email exists.

---

### 2.6 Unprotected cron endpoints

**Files:**
- `app/api/reviews/create-requests/route.ts`
- `app/api/reviews/send-emails/route.ts`

**Problem:**
```ts
if (cronSecret && providedSecret !== cronSecret) {
  return 401;
}
```
If `CRON_SECRET` env var is not set, the check is **skipped entirely** — the endpoint is wide open. Anyone can DoS the system, spam users with review emails, or create spurious review_requests rows.

**Note:** `app/api/reviews/process/route.ts` got this right (`isAuthorizedCronRequest` rejects if secret is missing or shorter than 12 chars). Use that pattern everywhere.

**Fix:** Replace the auth check in `create-requests` and `send-emails` with the same `isAuthorizedCronRequest()` helper from `process/route.ts` — extract it into `lib/cron-auth.ts` and import.

---

## 3. 🟠 HIGH PRIORITY — Architectural & Foundational

### 3.1 Missing Next.js error boundaries

There is **no** `error.tsx`, `loading.tsx`, or `not-found.tsx` in the entire app. There are **301 `throw new Error(...)`** calls in server actions.

**Effect:** Any backend error → users see Next.js default error page. No graceful handling, no retry, no actionable message.

**Fix:**
1. Add `app/error.tsx` (top-level) and `app/not-found.tsx`.
2. Add `app/(role)/error.tsx` for each role section (`customer`, `owner`, `vendor`, `admin`) that respects the dashboard layout.
3. Add `app/loading.tsx` files for slow data routes.
4. Create a centralized error utility:
   ```ts
   // lib/errors.ts
   export class AppError extends Error {
     constructor(public code: string, message: string, public httpStatus = 400) {
       super(message);
     }
   }
   ```
   Replace `throw new Error("Booking not found.")` with `throw new AppError("BOOKING_NOT_FOUND", "...")` — the error boundary can render a friendly message based on the code (and Arabic translation).
5. Add a toast/flash-message system for action feedback (currently the user sees an error page even for "validation" errors).

---

### 3.2 Performance: layout-level overfetching

**File:** `app/layout.tsx`

**Problem:** Every page render triggers:
- `auth.getUser()` (in middleware, again in layout)
- 3 parallel admin DB queries (`admin_users`, `profiles`, `vendor_profiles`)
- Then each `(role)/layout.tsx` triggers `requireXxxLayoutAccess()` which **runs the same queries again**.
- Then `app/owner/page.tsx` (and similar) **manually re-runs all three** instead of using its own layout's data.

**Fix:**
1. **Single source of truth** for current-user data. Create `lib/get-session.ts`:
   ```ts
   import { cache } from "react";

   export const getSession = cache(async () => {
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return { user: null, profile: null, adminUser: null, vendorProfile: null };

     const supabaseAdmin = createAdminClient();
     const [{ data: adminUser }, { data: profile }, { data: vendorProfile }] = await Promise.all([
       supabaseAdmin.from("admin_users").select("...").eq("auth_user_id", user.id).eq("status", "active").maybeSingle(),
       supabaseAdmin.from("profiles").select("...").eq("auth_user_id", user.id).maybeSingle(),
       supabaseAdmin.from("vendor_profiles").select("id,status").eq("id", user.id).maybeSingle(),
     ]);
     return { user, profile, adminUser, vendorProfile };
   });
   ```
   `cache()` from React deduplicates within a single request — layout, middleware, and pages all get the same result with one DB hit.
2. Refactor all `requireXxxLayoutAccess` functions to use `getSession()`.
3. Delete the duplicate auth/profile lookup blocks in `app/owner/page.tsx`, `app/vendor/page.tsx`, etc.

---

### 3.3 i18n is fundamentally broken

**File:** `components/t.tsx` + `app/layout.tsx`

**Problems:**
- `<T />` is a **client component** that calls `useSearchParams` + `useEffect` for every text node. A page with 100 strings = 100 hooks running.
- `<html lang="ar" dir="rtl">` is hardcoded in `app/layout.tsx`. English users get hydration mismatch + RTL layout flash.
- Search engines see only Arabic regardless of the `lang=en` query param.
- Switching language requires URL param OR cookie — inconsistent.

**Fix:** Replace the custom `T` component with `next-intl` (recommended) or `next-i18next`:
1. Install `next-intl`.
2. Create `messages/ar.json` and `messages/en.json` with key/value structure.
3. Set the locale at the route level (`app/[locale]/...`) so `<html lang>` and `<html dir>` are correct on the **server**, not after hydration.
4. Migrate `<T en="..." ar="..." />` calls to `t("key")` calls. This is mechanical — script-able.
5. SEO benefit: each locale is a real URL `/ar/studios` and `/en/studios`, with proper `<link rel="alternate" hreflang>`.

---

### 3.4 Booking logic is shallow

**File:** `app/studios/[slug]/book/page.tsx`

**Problems:**
- `hours: 1` is hardcoded — never computed from `start_time` / `end_time`.
- `total_amount = price_from` — not multiplied by hours.
- No conflict detection — two customers can book the same studio for the same hour.
- No check against the studio's working hours (assuming such field exists).
- Time comparison `startTime >= endTime` is string comparison — works for HH:MM but doesn't handle overnight bookings (23:00 → 02:00).

**Fix:**
1. Compute hours: `(endMinutes - startMinutes) / 60` with proper Date handling.
2. Compute `total_amount = pricePerHour * hours`.
3. Add a uniqueness check before insert:
   ```ts
   const { data: conflicts } = await supabase
     .from("bookings")
     .select("id")
     .eq("studio_id", studioId)
     .eq("booking_date", bookingDate)
     .neq("status", "cancelled")
     .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);
   if (conflicts?.length) throw new AppError("BOOKING_CONFLICT", "...");
   ```
   Even better: enforce at the DB level with an EXCLUDE constraint on a `tstzrange`.
4. Add `studio_working_hours` validation (and add the table/columns if missing).
5. Decide and document: do you support overnight bookings? Buffers between bookings? Min/max duration?

---

### 3.5 Saudi-specific validation is missing

**Files:** `app/profile/page.tsx`, `app/signup/page.tsx`, `app/vendor/onboarding/page.tsx`

**Problems:**
- Phone: accepts anything ≥ 8 chars. KSA mobile = `+9665XXXXXXXX` or `05XXXXXXXX` (9 digits after country code, starts with 5).
- National ID: accepts anything ≥ 5 chars. Real format = 10 digits, starts with 1 (Saudi) or 2 (Iqama).
- Iqama: 10 digits starting with 2.
- CR (Commercial Registration): 10 digits.
- VAT: 15 digits ending in `00003`.
- `identity_number` is stored as **plain text** in the `profiles` table. This is PII under PDPL (Saudi data protection law) and should be encrypted at rest or hashed-with-pepper if used only for verification.

**Fix:**
1. Create `lib/validation/saudi.ts` with regex + Zod schemas for: mobile, national ID, iqama, passport, CR, VAT, IBAN.
2. Apply at every form submission boundary (server actions).
3. For `identity_number`: either
   - Store only a salted hash (if it's only for verification), or
   - Encrypt with `pgcrypto` (`pgp_sym_encrypt`) using a key from KMS / env var, OR
   - Move to a separate, more restricted table with stricter RLS.
4. Add column-level masking in any admin views that display IDs (`xxx-xxxx-1234` pattern).

---

### 3.6 Project tooling files missing

The repo is missing:
- `.gitignore` — risk of committing `.env.local`, `.next/`, `node_modules/`, etc.
- `.env.example` — no documentation of required env vars (we counted at least 6: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REVIEW_FROM_EMAIL` / `REVIEW_EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`).
- `next.config.js` — no security headers, no image optimization config, no production tweaks.
- ESLint / Prettier config — no enforcement of code style.
- `README.md` is 2 lines.

**Fix — minimum acceptable:**
1. `.gitignore` covering Next.js, Node, OS files, `.env*`.
2. `.env.example` with every var, commented.
3. `next.config.ts` with at minimum:
   ```ts
   images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
   async headers() {
     return [{
       source: "/:path*",
       headers: [
         { key: "X-Frame-Options", value: "DENY" },
         { key: "X-Content-Type-Options", value: "nosniff" },
         { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
         { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
         // CSP — start in report-only mode
       ],
     }];
   },
   ```
4. `eslint.config.mjs` with `next/core-web-vitals` + `@typescript-eslint/recommended`. Add `no-explicit-any` as a warning.
5. README expanded: setup steps, env vars, scripts, architecture overview, link to schema docs.

---

### 3.7 Asset optimization

**Problems:**
- `public/brand/` = 5.5 MB total.
- Logos as SVG range from 842 KB → 1.3 MB (almost certainly contain raster data embedded as base64; a real SVG of a logo should be < 20 KB).
- Globally `<img>` tags used 10x; `next/image` used only 1x.
- `app/globals.css` is 6,429 lines / 119 KB, loaded on every page.

**Fix:**
1. Re-export logos from the design source as **clean SVG** (path data only, no embedded raster). Target < 30 KB per logo.
2. Replace all `<img>` tags with `<Image>` from `next/image`. Configure remote patterns for Supabase storage.
3. Audit `globals.css`:
   - Move component-specific styles into CSS Modules (one per component) or migrate to Tailwind.
   - Eliminate the 492 inline `style={{}}` instances — they prevent caching, theming, and breakpoints.
4. Run Lighthouse / WebPageTest. Set perf budgets in CI.

---

### 3.8 TypeScript config is broken

**File:** `tsconfig.json`

```json
"include": ["next-env.d.ts", "*/.ts", "*/.tsx", ".next/types/*/.ts"],
"paths": { "@/": ["./"] }
```

`*/.ts` matches `something/.ts` literally — it should be `**/*.ts`. `@/` should be `@/*`. As written, TS doesn't type-check most files and `@/...` imports don't resolve.

**Fix:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Run `npx tsc --noEmit` after fixing. Expect a large list of errors from the 53 `any` usages and from server-action throw types — fix incrementally.

---

### 3.9 Pin dependency versions

**File:** `package.json`

Every dep is `"latest"`. Any `npm install` could pull a breaking version.

**Fix:** Pin to specific versions you've tested:
```json
"@supabase/ssr": "^0.5.0",
"@supabase/supabase-js": "^2.45.0",
"next": "^15.0.0",
"react": "^19.0.0",
...
```
Add `package-lock.json` to git.

---

### 3.10 The 1,744-line file

**File:** `app/admin/bookings/[id]/page.tsx`

Contains: page UI + 3 server actions (`updateBookingStatus`, another, `updateAdminNotes`) + business logic + DB queries + role checks. Untestable, unreviewable.

**Fix:** Extract by responsibility:
- `app/admin/bookings/[id]/page.tsx` — UI only, calls server actions.
- `app/admin/bookings/[id]/actions.ts` — server actions, marked `"use server"` at the top.
- `lib/bookings/admin.ts` — pure business-logic functions (status transitions, validation, settlement calculations) — testable.
- `lib/bookings/queries.ts` — DB query helpers.

Apply the same split to other oversized files:
- `app/admin/studio-payouts/page.tsx` (1,557 lines)
- `app/admin/bookings/page.tsx` (1,496 lines)
- `app/admin/studio-payments/page.tsx` (939 lines)

---

## 4. 🟡 MEDIUM PRIORITY — Polish & Hygiene

### 4.1 Eliminate `any`
53 instances of `any` / `as any` in the app folder, mostly in `cart-context.tsx` and admin server actions. Define proper types — most map directly to DB rows.

### 4.2 N+1 query in WishlistButton
`components/wishlist-button.tsx` runs `auth.getUser()` + a wishlist query for **every product card**. On a 20-product page → 40 queries.
**Fix:** Fetch the user's full wishlist once in the server component, pass `isWished` as a prop.

### 4.3 Sequential queries on studio detail page
`app/studios/[slug]/page.tsx` runs studio → images → features → equipment → reviews **serially**. Wrap the four dependent queries in `Promise.all()`.

### 4.4 Audit logging is sparse
Only 5 files call `createAuditLog()`. Critical actions without audit:
- Profile changes (name, phone, identity)
- Studio create/update/delete
- Booking create/cancel by customer
- Vendor approval / rejection
- Product create/update/delete
- Commission rate changes

**Fix:** Add audit calls to every mutation server action. Consider centralizing as a wrapper:
```ts
withAudit("studio_updated", async () => { ... })
```

### 4.5 Auth hardening
- Add **rate limiting** on `/login`, `/signup`, `/forgot-password` (use Upstash Redis or Vercel rate-limit; current code has none).
- Add **CAPTCHA** (hCaptcha or Cloudflare Turnstile) on signup.
- Require **email verification** before activating accounts (`account_status: 'pending_verification'` until verified).
- Bump password minimum to 8 chars + require complexity (or use HIBP API to reject pwned passwords).

### 4.6 Validation library
No Zod/Yup/Valibot. All validation is hand-rolled. Standardize on **Zod**:
```ts
const BookingSchema = z.object({
  studioId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(2000).optional(),
});
```
Use it in every server action via `BookingSchema.parse(formDataObj)`.

### 4.7 Vendor onboarding has no slug uniqueness check
Two vendors with similar Arabic names → identical slug → DB constraint error → ugly crash.
**Fix:** Generate slug, check uniqueness, append `-2` / `-3` / random suffix if taken. Same for product slugs.

### 4.8 Vendor product creation is incomplete
- No image upload (table exists: `marketplace_product_images`).
- No inventory/stock entry (table exists: `marketplace_inventory`).
- No multi-variant UI (table exists: `marketplace_product_variants`).
- No price validation (negative / zero).
**Fix:** Add a multi-step wizard or single form covering all four.

### 4.9 Broken nav link
`/how-it-works` is in the site header but the route doesn't exist. Either build the page or remove the link.

### 4.10 Dead files in the repo
- `fix_colors.js` and `fix_colors.ps1` — one-time scripts left in root.
- `public/test.txt` — empty file.
- 6,429-line `globals.css` with comments suggesting style rewrites happened multiple times.
**Fix:** Move scripts to `scripts/` folder if useful; delete otherwise.

### 4.11 No tests
Zero unit, integration, or e2e tests. At minimum:
- **Vitest** for `lib/` pure functions (validation, business logic, money math).
- **Playwright** for critical e2e flows: signup → login → book studio, vendor signup → product create.
- Run in CI on every PR.

---

## 5. ❓ Open questions for product / business

These I couldn't infer from the code. Please clarify:

1. **Payments** — which gateway is planned? (Moyasar, HyperPay, Tap, Tabby/Tamara, PayTabs, Stripe?) The `platform_payments` table has a `gateway` column but every record we've seen is `"manual"`.
2. **Currency** — code assumes SAR. Will you support multi-currency for the GCC expansion?
3. **VAT** — Saudi VAT is 15%. Some places have `tax_amount: 0` hardcoded. Is VAT being calculated elsewhere or pending?
4. **Refunds** — `platform_refunds` table is queried but we didn't see the refund UX. Customer-initiated, owner-initiated, or admin-only?
5. **Communications** — only email (Resend) is wired. Will you add SMS (for OTP, booking reminders)? WhatsApp Business?
6. **Reviews moderation** — is there a manual review queue before publishing, or auto-publish + admin moderation post-hoc?
7. **Studio approval flow** — `status: 'approved'` + `verified: true` + `booking_enabled: true` + `owner_compliance_status: 'approved'` are all required. Is there a documented onboarding workflow that walks owners through all four?
8. **Multi-tenancy** — any plans to allow studio chains (one owner, many studios with sub-managers)? Schema currently has 1 owner per studio via `owner_auth_user_id`.

---

## 6. ✅ Recommended order of work (sprints)

### Sprint 1 — Foundation Repair (1-2 weeks)
- Fix `lib/auth.ts` / `route-guards.ts` conflict (§2.1)
- Export full DB schema + set up Supabase migrations (§2.2)
- Fix vendor signup privilege escalation (§2.4)
- Fix login user enumeration (§2.5)
- Fix unprotected cron endpoints (§2.6)
- Fix tsconfig (§3.8) + pin dependencies (§3.9)
- Add `.gitignore`, `.env.example`, `next.config.ts`, README (§3.6)

### Sprint 2 — Architecture (2 weeks)
- Centralize session loading with `cache()` (§3.2)
- Add error/loading/not-found boundaries + AppError pattern (§3.1)
- Audit and tighten RLS policies; reduce `createAdminClient()` usage (§2.3)
- Set up Zod + apply to top 10 most-used forms (§4.6)
- Split the 1,744-line file (§3.10)

### Sprint 3 — Domain Correctness (1-2 weeks)
- Booking logic: hours calc, conflict detection, working hours (§3.4)
- Saudi validation (phone, ID, CR, VAT, IBAN) + PII encryption (§3.5)
- Vendor product flow: images, inventory, variants (§4.8)
- Audit logging on all mutations (§4.4)

### Sprint 4 — i18n + Performance (1-2 weeks)
- Migrate to `next-intl` with locale routing (§3.3)
- Asset optimization + `next/image` everywhere (§3.7)
- Move from inline styles + giant `globals.css` to Tailwind or CSS Modules (§3.7)
- Promise.all the studio detail queries; fix WishlistButton N+1 (§4.2, §4.3)

### Sprint 5 — Hardening (1 week)
- Rate limiting, CAPTCHA, email verification, password strength (§4.5)
- Initial test suite (Vitest + Playwright) (§4.11)
- Lighthouse pass; perf budgets; security headers in production

---

## 7. Useful greps for the developer

```bash
# Find all admin client uses
grep -rn "createAdminClient\|supabaseAdmin" app/ --include="*.tsx" -l

# Find all `throw new Error` for the AppError migration
grep -rn "throw new Error" app/ --include="*.tsx"

# Find all `any` usage
grep -rn ": any\|as any" app/ --include="*.tsx"

# Find all inline styles
grep -rn "style={{" app/ --include="*.tsx"

# Find all <img> tags to migrate to <Image>
grep -rn "<img " app/ components/ --include="*.tsx"

# List all DB tables referenced by code
grep -rhn 'from("' app/ lib/ --include="*.ts" --include="*.tsx" \
  | grep -oE 'from\("[a-z_]+"\)' | sort -u
```

---

## 8. Definition of Done for "foundation is solid"

Tick when complete:

- [ ] Every page in the app loads without redirecting to `/forbidden` for a valid logged-in user.
- [ ] `supabase db reset && supabase db push` recreates the full schema from migrations alone.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run lint` passes.
- [ ] Every server action validates its input through a Zod schema before touching the DB.
- [ ] Every cron endpoint rejects requests when `CRON_SECRET` is missing.
- [ ] Every `<img>` tag has been replaced with `<Image>`.
- [ ] The site loads correctly in both Arabic and English with the right `<html lang>` and `<dir>`, no hydration warnings.
- [ ] Lighthouse Performance ≥ 80 on `/` and `/studios` for mobile.
- [ ] At least one Playwright e2e test passes for: signup → email verify → book studio.

---

*Generated as part of the GearBeat V2 codebase audit. All issues are reproducible from the code in `gearbeat-V2-main.zip`.*
