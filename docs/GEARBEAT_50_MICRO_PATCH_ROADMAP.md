# GEARBEAT 50-MICRO-PATCH ROADMAP

This document outlines the granular stabilization plan for GearBeat V2.

## Patch 01 — Roadmap and technical audit document
- **Goal:** Establish clear micro-patch strategy.
- **Inspect:** Project root.
- **Change:** Create roadmap file.
- **Migration:** No | **Risk:** Low
- **Test:** File existence.

## Patch 02 — Verify build, npm, lint, and project scripts
- **Goal:** Ensure environment is ready for deployment/CI.
- **Inspect:** `package.json`, environment PATH.
- **Change:** Fix environment blockers.
- **Migration:** No | **Risk:** High (Env specific)
- **Test:** `npm run build`.

## Patch 03 — Client/server import safety audit
- **Goal:** Find instances of server-only keys in client files.
- **Inspect:** `app/`, `components/`.
- **Change:** Identify leakage points.
- **Migration:** No | **Risk:** Medium

## Patch 04 — Fix countries server/client split
- **Goal:** Move country-fetching to server-only logic.
- **Inspect:** `lib/countries.ts`, `lib/countries-server.ts`.
- **Change:** Isolate server-side fetching.
- **Migration:** No | **Risk:** Medium

## Patch 05 — Fix locations server/client split
- **Goal:** Isolate location data fetching.
- **Inspect:** `lib/locations.ts`, `lib/locations-server.ts`.
- **Change:** Enforce server boundaries.
- **Migration:** No | **Risk:** Medium

## Patch 06 — Protect Supabase admin/server utilities
- **Goal:** Enforce `server-only` guards on sensitive utils.
- **Inspect:** `lib/supabase/`.
- **Change:** Add `import "server-only"`.
- **Migration:** No | **Risk:** Low

## Patch 07 — Signup page safe public data loading
- **Goal:** Remove direct server imports from signup client page.
- **Inspect:** `app/signup/page.tsx`.
- **Change:** Switch to API route or server component wrapper.
- **Migration:** No | **Risk:** Medium

## Patch 08 — Studios page safe server data loading
- **Goal:** Ensure studio listing doesn't leak admin configs.
- **Inspect:** `app/studios/page.tsx`.
- **Change:** Audit props and data fetching.
- **Migration:** No | **Risk:** Medium

## Patch 09 — Auth pages inventory and password fields audit
- **Goal:** Map all password inputs across the site.
- **Inspect:** Login, signup, reset, staff portals.
- **Change:** List targets for toggle component.
- **Migration:** No | **Risk:** Low

## Patch 10 — Add reusable password visibility component
- **Goal:** Create a high-end dark UI password input.
- **Inspect:** `components/ui`.
- **Change:** New component with eye toggle.
- **Migration:** No | **Risk:** Low

## Patch 11 — Add password toggle to login page
- **Goal:** Implement toggle on `/login`.
- **Inspect:** `app/login/page.tsx`.
- **Change:** Replace standard input with new component.
- **Migration:** No | **Risk:** Low

## Patch 12 — Add password toggle to portal login
- **Goal:** Implement toggle on `/portal/login`.
- **Inspect:** `app/portal/login/page.tsx`.
- **Change:** UI update.
- **Migration:** No | **Risk:** Low

## Patch 13 — Add password toggle to staff access
- **Goal:** Implement toggle on `/staff-access`.
- **Inspect:** `app/staff-access/page.tsx`.
- **Change:** UI update + theme alignment.
- **Migration:** No | **Risk:** Low

## Patch 14 — Add password toggle to signup/reset pages
- **Goal:** Finalize toggle rollout.
- **Inspect:** Signup and Reset paths.
- **Change:** UI consistency.
- **Migration:** No | **Risk:** Low

## Patch 15 — Trusted devices schema plan only
- **Goal:** Design the SQL structure for device trust.
- **Inspect:** Auth requirements.
- **Change:** Document schema.
- **Migration:** No | **Risk:** Low

## Patch 16 — Trusted devices migration
- **Goal:** Create `trusted_devices` table.
- **Inspect:** Migrations folder.
- **Change:** SQL migration execution.
- **Migration:** Yes | **Risk:** Medium

## Patch 17 — Trusted devices server utilities
- **Goal:** Create logic for hashing device tokens.
- **Inspect:** `lib/device-trust.ts`.
- **Change:** Utility functions for trust lifecycle.
- **Migration:** No | **Risk:** Low

## Patch 18 — Trusted devices cookie logic
- **Goal:** Implement httpOnly secure cookie management.
- **Inspect:** Auth actions.
- **Change:** Cookie setting/reading logic.
- **Migration:** No | **Risk:** Medium

## Patch 19 — New device OTP foundation
- **Goal:** Logic to trigger OTP on unrecognized devices.
- **Inspect:** Login flow.
- **Change:** Conditional redirect to OTP.
- **Migration:** No | **Risk:** Medium

## Patch 20 — OTP provider fallback documentation
- **Goal:** Document production vs development OTP.
- **Inspect:** `docs/`.
- **Change:** Create setup guide.
- **Migration:** No | **Risk:** Low

## Patch 21 — Profile schema audit
- **Goal:** Check for redundant profile fields.
- **Inspect:** Supabase profiles table.
- **Change:** Audit report.
- **Migration:** No | **Risk:** Low

## Patch 22 — profiles.id vs auth_user_id decision
- **Goal:** Standardize on one ID convention.
- **Inspect:** Database structure.
- **Change:** Decision log and code alignment.
- **Migration:** Maybe | **Risk:** High

## Patch 23 — Role naming normalization plan
- **Goal:** Map internal roles to business roles.
- **Inspect:** `lib/types`.
- **Change:** Normalization doc.
- **Migration:** No | **Risk:** Low

## Patch 24 — Role mapping owner to studio_owner
- **Goal:** Rename roles for clarity.
- **Inspect:** Codebase.
- **Change:** Find/replace role strings safely.
- **Migration:** Yes | **Risk:** Medium

## Patch 25 — Role mapping seller to vendor
- **Goal:** Consistency in vendor role naming.
- **Inspect:** Codebase.
- **Change:** Role updates.
- **Migration:** Yes | **Risk:** Medium

## Patch 26 — Dashboard redirect cleanup
- **Goal:** Fix broken redirects after login.
- **Inspect:** Middleware/Login actions.
- **Change:** Clean redirection logic.
- **Migration:** No | **Risk:** Low

## Patch 27 — Admin route guard cleanup
- **Goal:** Ensure admin routes are strictly guarded.
- **Inspect:** `middleware.ts`.
- **Change:** Strict pattern matching for admin.
- **Migration:** No | **Risk:** Medium

## Patch 28 — Super admin override logic
- **Goal:** Allow developers absolute access via `super_admin`.
- **Inspect:** RLS / Guards.
- **Change:** Update checks to include super_admin.
- **Migration:** Maybe | **Risk:** Medium

## Patch 29 — Lock/remove debug and unsafe staff routes
- **Goal:** Clean up experimental admin pages.
- **Inspect:** `app/staff-access`.
- **Change:** Delete/Disable unused routes.
- **Migration:** No | **Risk:** Low

## Patch 30 — Admin application approval audit
- **Goal:** Review studio application workflow.
- **Inspect:** Admin dashboard.
- **Change:** State transition check.
- **Migration:** No | **Risk:** Low

## Patch 31 — Lead-to-studio conversion fix
- **Goal:** Ensure applications correctly create studio records.
- **Inspect:** Approval actions.
- **Change:** Fix data mapping errors.
- **Migration:** No | **Risk:** Medium

## Patch 32 — Contract consistency audit
- **Goal:** Check if studio contracts match approved applications.
- **Inspect:** Contract generation logic.
- **Change:** Discrepancy report.
- **Migration:** No | **Risk:** Low

## Patch 33 — Contract consistency fix
- **Goal:** Align contract data with application data.
- **Inspect:** Database / Components.
- **Change:** Bug fix in generation logic.
- **Migration:** No | **Risk:** Low

## Patch 34 — Database schema audit document
- **Goal:** Map all tables and relationships.
- **Inspect:** SQL / Schema.
- **Change:** Create `docs/SCHEMA_MAP.md`.
- **Migration:** No | **Risk:** Low

## Patch 35 — Storage buckets and RLS audit
- **Goal:** Ensure private images aren't public.
- **Inspect:** Supabase Storage.
- **Change:** Fix bucket policies.
- **Migration:** No | **Risk:** Medium

## Patch 36 — Availability save error audit
- **Goal:** Find why studio owners can't save hours.
- **Inspect:** `studio-availability.tsx`.
- **Change:** Identify RLS or logic failures.
- **Migration:** No | **Risk:** Low

## Patch 37 — Availability save error fix
- **Goal:** Enable successful availability saving.
- **Inspect:** `lib/studio-availability.ts`.
- **Change:** Correct upsert logic/RLS.
- **Migration:** No | **Risk:** Medium

## Patch 38 — Availability exception date range schema
- **Goal:** Allow studios to close for specific dates.
- **Inspect:** DB / UI.
- **Change:** New table or columns for exceptions.
- **Migration:** Yes | **Risk:** Medium

## Patch 39 — Availability day/time pricing schema
- **Goal:** Support dynamic hourly pricing.
- **Inspect:** `availability_slots` table.
- **Change:** Add pricing columns.
- **Migration:** Yes | **Risk:** Medium

## Patch 40 — Availability UI pricing update
- **Goal:** Let owners set prices in the UI.
- **Inspect:** Owner portal.
- **Change:** Add price fields to calendar.
- **Migration:** No | **Risk:** Low

## Patch 41 — Booking overlap audit
- **Goal:** Test conflict detection.
- **Inspect:** Booking logic.
- **Change:** Report on race conditions.
- **Migration:** No | **Risk:** Medium

## Patch 42 — Booking double-booking protection
- **Goal:** Implement strict atomic slot locking.
- **Inspect:** Supabase Edge / API.
- **Change:** Row-level locking or transaction check.
- **Migration:** No | **Risk:** High

## Patch 43 — Booking status lifecycle cleanup
- **Goal:** Unify booking states (pending, paid, completed).
- **Inspect:** `lib/types`.
- **Change:** Status enum cleanup.
- **Migration:** Yes | **Risk:** Medium

## Patch 44 — Payment server-side amount audit
- **Goal:** Ensure prices are verified on server before checkout.
- **Inspect:** Payment API.
- **Change:** Price recalculation logic.
- **Migration:** No | **Risk:** High

## Patch 45 — Payment webhook/idempotency risk document
- **Goal:** Map production payment requirements.
- **Inspect:** Stripe/HyperPay.
- **Change:** Documentation of missing safeguards.
- **Migration:** No | **Risk:** Low

## Patch 46 — Marketplace route duplication audit
- **Goal:** Resolve Gear vs Marketplace page confusion.
- **Inspect:** `app/gear`, `app/marketplace`.
- **Change:** Identify redundant code.
- **Migration:** No | **Risk:** Low

## Patch 47 — Cart and checkout consolidation plan
- **Goal:** Unify gear and booking carts.
- **Inspect:** State management.
- **Change:** Consolidation strategy doc.
- **Migration:** No | **Risk:** Low

## Patch 48 — Gear to marketplace decision and redirect/cleanup
- **Goal:** Merge gear pages into the marketplace.
- **Inspect:** Filesystem.
- **Change:** Remove `/gear`, setup redirects.
- **Migration:** No | **Risk:** Medium

## Patch 49 — Studio management page improvements
- **Goal:** UX cleanup for studio list in owner portal.
- **Inspect:** Owner portal.
- **Change:** UI/UX tweaks.
- **Migration:** No | **Risk:** Low

## Patch 50 — Final QA, external roadmap, and production readiness checklist
- **Goal:** Final sign-off.
- **Inspect:** Entire app.
- **Change:** Create production checklist.
- **Migration:** No | **Risk:** Low
