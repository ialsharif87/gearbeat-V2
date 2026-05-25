# Patch 135A - Security & Release Readiness Operating Plan

## 1. Current Production Status After Patch 134B

GearBeat V2 is currently in a strong visual and pilot-readiness state after the merged Patch 132B, Patch 133B, and Patch 134B series.

- Patch 132B polished the homepage with premium iconography, mobile animation dampening, RTL alignment improvements, and Arabic hero copy parity.
- Patch 133B polished the Marketplace page with compact layout density, safe preview/sandbox marketplace copy, restored pilot-safe CTAs, and documentation safety corrections.
- Patch 134B polished the Studios page with compact hero/trust layout, cleaner studio cards, secondary AI Discovery placement, reduced badge overload, compact filters, and RTL/select spacing improvements.
- Vercel Production is reported as Current/Ready.
- Local verification before this operating plan showed the application is build-ready and typecheck-ready for the current codebase.

This patch is documentation-only. It does not change app code, API routes, authentication, payment logic, database files, middleware, environment variables, package files, or UI components.

## 2. Build-Ready and Pilot/Investor-Demo Ready, Not Commercial/Live-Payment Ready

GearBeat V2 is suitable for controlled pilot, investor-demo, and internal readiness review because:

- The primary web app compiles and typechecks.
- The recent public-facing polish work is scoped to visual/layout/copy improvements.
- Marketplace and Studios copy consistently uses preview, pilot, sandbox, and pre-live language.
- Manual and pilot payment language remains visible where transactional flows are incomplete.
- The mobile mirror app is suitable for demo validation of the current web experience.
- Git state was clean before Patch 135A work began.

GearBeat V2 is not approved for commercial launch or live payment activation because critical release gates remain open:

- Dependency audit findings must be triaged and patched.
- Tap webhook handling is not production-hardened.
- Tap charge creation must be tied to server-side source-of-truth records before live use.
- Broad service-role usage must be audited route by route.
- Lint warning volume is too high for a confident release gate.
- Metadata, environment documentation, and CSP posture need production alignment.

## 3. Current Release Risks

### A. npm audit vulnerabilities

The dependency audit identified vulnerabilities in the web app dependency tree, including issues involving Next.js, Supabase auth dependencies, PostCSS, uuid, and ws. The mobile Expo mirror also has moderate audit findings through Expo/PostCSS/uuid dependency chains.

Release impact:

- This blocks commercial release approval until reviewed and remediated or formally accepted.
- The Next.js middleware/App Router advisory is especially relevant because GearBeat uses middleware for Supabase session refresh and subdomain/root routing.

Required follow-up:

- Patch 135B must perform a dependency audit and update plan before production hardening closeout.

### B. Tap webhook is not ready for live production

The current Tap webhook route accepts a POST body, reads `id`, `status`, and `metadata`, and updates booking payment state through `createAdminClient`.

Production blockers:

- No webhook signature verification.
- No HMAC/shared-secret validation.
- No idempotency ledger for duplicate Tap retries.
- No source-of-truth validation against a stored checkout payment session.
- No amount or currency validation against the internal booking/order record.
- No audit-first raw event log before mutation.

Release impact:

- Live Tap activation is blocked.
- The webhook must remain treated as sandbox/pre-live only until hardened.

### C. Tap create-charge must not trust client-provided values

The current Tap charge route reads `bookingId`, `amount`, and `studioId` from the request body after user authentication.

Production blockers:

- The amount must be loaded from a server-side booking or checkout session, not trusted from the client.
- The booking or checkout session must be verified as owned by the authenticated user.
- The studio/payment destination must be validated through server-side records.
- The payment request must be tied to a canonical `checkout_payment_sessions` record before gateway redirection.

Release impact:

- This route cannot be used for live money movement until it is rewritten around server-side source-of-truth records.

### D. Broad service-role/createAdminClient usage needs route-by-route audit

GearBeat uses `createAdminClient` across many pages, API routes, helpers, admin surfaces, customer surfaces, marketplace flows, studio flows, cron routes, and vendor API routes.

This pattern is acceptable only when each usage is protected by the correct boundary:

- Admin-only routes must use admin guards.
- Customer routes must verify ownership.
- Owner/studio routes must verify owner access.
- Vendor routes must verify vendor identity or API key permission.
- Cron routes must require a strong `CRON_SECRET`.
- Public read routes must return only intentionally public data.

Release impact:

- Service-role usage is a high-trust pattern and must be audited before commercial release.

### E. High lint warning count

The current lint run passes with no errors but reports a high warning count. The warnings are concentrated around:

- `any` usage.
- unused variables/imports.
- `<img>` usage where `next/image` may be preferred.
- React hook dependency warnings.

Release impact:

- This does not block pilot demo operation.
- It does reduce confidence for a commercial release gate and should be triaged by risk area, starting with API, admin, auth, payment, and finance files.

### F. Missing metadataBase warning

The production build emits a warning that `metadataBase` is not set for resolving OpenGraph/Twitter images, causing Next.js to fall back to `http://localhost:3000`.

Release impact:

- This can affect social preview URLs, public launch polish, and SEO correctness.
- It should be fixed in a small app metadata patch before a final release gate.

### G. `.env.example` missing Tap and OTP variables

The current `.env.example` documents core Supabase, Resend, site URL, cron, generic payment gateway, SMS, and analytics variables. It does not yet explicitly document variables used by the current code paths and future gates:

- `TAP_SECRET_KEY`
- `NEXT_PUBLIC_TAP_PUBLIC_KEY`
- future Tap webhook secret variable
- `OTP_HASH_SECRET`
- `OTP_PROVIDER`
- `MOCK_OTP_ENABLED`
- `NEXT_PUBLIC_MOCK_OTP_ENABLED`

Release impact:

- Environment documentation is not aligned with code reality.
- A future environment alignment patch should add placeholders and safety comments without activating live payment behavior.

### H. CSP report-only and unsafe directives

`next.config.ts` defines security headers and a `Content-Security-Policy-Report-Only` header. The CSP currently permits `unsafe-inline` and `unsafe-eval`.

Release impact:

- This is acceptable for a pilot/demo posture where inline styles/scripts still exist.
- It is not a final hardened production CSP posture.
- A staged CSP hardening plan should be created after inline script/style usage is reduced or intentionally documented.

## 4. Recommended Patch 135 Sequence

### Patch 135A - Security & Release Readiness Operating Plan

Purpose:

- Create this documentation-only operating plan.
- Freeze the current readiness reality after 132B, 133B, and 134B.
- Establish what is safe to do next and what remains blocked.

Scope:

- Docs only.
- No code, SQL, auth, payment, API, middleware, environment, package, or UI changes.

### Patch 135B - Dependency Audit / Update Plan

Purpose:

- Triage `npm audit` findings.
- Identify safe upgrade paths for Next.js, Supabase, PostCSS, uuid, ws, Resend/transitive dependencies, and mobile Expo dependency chains.
- Separate low-risk patch updates from breaking changes.

Rules:

- No blind `npm audit fix --force`.
- No dependency update without typecheck, lint, build, and focused route smoke tests.
- Review Next.js and Supabase advisories against GearBeat middleware/auth usage.

### Patch 135C - Tap Live-Payment Disable Gate / Hardening Plan

Purpose:

- Make the Tap live-payment block explicit and enforceable.
- Define whether `/api/tap/webhook` should be disabled, gated, or left sandbox-only until hardening.
- Define the production implementation for signature verification, idempotency, event logging, amount validation, and source-of-truth mapping.

Rules:

- No live Tap activation.
- No production payment claims.
- No live keys.
- No webhook mutation path unless verified and idempotent.

### Patch 135D - Service Role Route-by-Route Audit

Purpose:

- Inventory every `createAdminClient` usage.
- Classify each usage by route type, exposure, role boundary, data sensitivity, and mutation risk.
- Mark each as approved, needs guard, needs RLS conversion, or should be removed.

Rules:

- No service-role expansion.
- No database mutation until the audit is complete.
- Prioritize API, admin, payment, finance, document upload, customer data, and vendor integration routes.

### Patch 135E - metadataBase + `.env.example` Alignment

Purpose:

- Add `metadataBase` to app metadata.
- Align `.env.example` with actual and planned environment variables.
- Document Tap/OTP variables as inactive or gated where appropriate.

Rules:

- No activation of live payment behavior.
- No secrets in committed files.
- No environment value changes.

### Patch 135F - Security Release Closeout Gate

Purpose:

- Confirm dependency posture, Tap/payment lock state, service-role audit status, metadata/env alignment, typecheck/lint/build results, and documentation completeness.
- Produce final GO/NOT GO recommendation for pilot, production demo, and commercial launch separately.

Rules:

- Commercial launch remains blocked unless every high-risk item is closed or explicitly accepted by human approval.

## 5. Explicit Blocked Actions Before Approval

The following actions are blocked until explicit human approval and the required security gates are complete:

- No live Tap activation.
- No Tap production keys.
- No public or investor-facing claims that live payments are active.
- No payment production claims.
- No commercial launch decision.
- No SQL push.
- No RLS changes.
- No Supabase schema changes.
- No Supabase CLI migration execution.
- No auth rewrite.
- No payment/API rewrite.
- No database mutation patch.
- No middleware/routing changes.
- No package update without Patch 135B review.

## 6. Operating Rules for Future Engineering Work

- Preserve GearBeat premium dark/gold visual identity.
- Preserve Arabic/English parity and RTL/LTR layout support.
- Keep commercial copy honest: use pilot, preview, sandbox, deferred, or pre-live language until activation gates are closed.
- Keep backend/payment/security patches separate from visual polish patches.
- Run at minimum `npm.cmd run typecheck` after any code-bearing patch.
- For security/payment/backend patches, also run lint and build unless blocked by a documented reason.
- Show changed files before commit.
- Do not push to `main` directly.

## 7. Final Verdict

### GO

GearBeat V2 is GO for security and release readiness planning.

Patch 135A may be merged as a documentation-only operating plan that defines the next safe sequence of security and release gates.

### NOT GO

GearBeat V2 is NOT GO for live payments or commercial launch.

Live Tap payment activation, payment production claims, SQL/RLS/database pushes, auth/payment/API rewrites, and commercial launch decisions remain blocked until the Patch 135 sequence reaches an approved closeout gate.

## 8. Patch 135A Verification Expectations

Expected changed file:

- `docs/GEARBEAT_PATCH_135A_SECURITY_RELEASE_READINESS_OPERATING_PLAN.md`

Expected unchanged areas:

- App code
- API routes
- Auth logic
- Payment logic
- Supabase files
- SQL migrations
- Middleware
- Routing
- Environment files
- Package files
- UI pages/components

Required verification:

- `git status --short`
- `git diff --name-only`
- `npm.cmd run typecheck`
