# Patch 135B - Dependency Audit / Update Plan

## 1. Scope

Patch 135B is a documentation-only dependency audit and update plan for GearBeat V2.

No dependencies were updated in this patch. No package files, lockfiles, app code, API routes, auth logic, payment logic, Supabase files, environment files, middleware, routing, or UI components were changed.

This plan follows Patch 135A and keeps the payment/Tap safety gate, service-role audit, metadata/env alignment, and actual dependency update work separated into later patches.

## 2. Current Dependency Risk Summary

GearBeat V2 remains build-ready and typecheck-ready, but dependency security posture requires action before commercial release approval.

Current web dependency findings:

- `npm.cmd audit` reports 12 vulnerabilities: 4 low, 7 moderate, 1 high.
- The high-risk item is a Next.js App Router middleware/proxy bypass advisory that matters because GearBeat uses `middleware.ts` for Supabase session refresh and subdomain/root routing.
- Supabase client dependencies include vulnerable `@supabase/auth-js` through the pinned `@supabase/supabase-js` version.
- PostCSS, uuid, ws, ESLint, ExcelJS/Resend transitive dependencies require triage.

Current mobile dependency findings:

- The mobile Expo mirror reports 11 moderate vulnerabilities.
- The audit fix path suggests `expo@56.0.4`, which is a major Expo SDK jump from SDK 54 and must be treated as a breaking-change upgrade, not a quick patch.

Dependency update posture:

- GO for planning and targeted dependency patching.
- NOT GO for blind `npm audit fix --force`.
- NOT GO for bundling payment, auth, database, middleware, or service-role changes into dependency patches.

## 3. Commands Run

Web root:

```bash
npm.cmd audit
npm.cmd outdated
npm.cmd run typecheck
```

Mobile folder:

```bash
cd mobile
npm.cmd audit
npm.cmd outdated
npm.cmd run typecheck
```

Mobile note:

- `mobile/package.json` does not define a `typecheck` script, so the mobile typecheck command was unavailable for this patch.

## 4. Exact Web `npm audit` Findings

`npm.cmd audit` returned exit code 1 because audit findings exist.

Summary:

```text
12 vulnerabilities (4 low, 7 moderate, 1 high)
```

Exact findings:

```text
@eslint/plugin-kit  <0.3.4
@eslint/plugin-kit is vulnerable to Regular Expression Denial of Service attacks through ConfigCommentParser - https://github.com/advisories/GHSA-xffm-g5w8-qvg7
fix available via `npm audit fix --force`
Will install eslint@9.39.4, which is outside the stated dependency range
node_modules/@eslint/plugin-kit
  eslint  9.10.0 - 9.26.0
  Depends on vulnerable versions of @eslint/plugin-kit
  node_modules/eslint

@supabase/auth-js  <=2.69.1
auth-js Vulnerable to Insecure Path Routing from Malformed User Input - https://github.com/advisories/GHSA-8r88-6cj9-9fh5
fix available via `npm audit fix --force`
Will install @supabase/supabase-js@2.106.2, which is outside the stated dependency range
node_modules/@supabase/auth-js
  @supabase/supabase-js  2.41.1 - 2.49.10 || 2.58.1-canary.0
  Depends on vulnerable versions of @supabase/auth-js
  node_modules/@supabase/supabase-js

brace-expansion  5.0.2 - 5.0.5
Severity: moderate
brace-expansion: Large numeric range defeats documented `max` DoS protection - https://github.com/advisories/GHSA-jxxr-4gwj-5jf2
fix available via `npm audit fix`
node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion

next  9.3.4-canary.0 - 16.3.0-canary.5
Severity: high
Next.js has a Middleware / Proxy bypass in App Router applications via segment-prefetch routes - Incomplete Fix Follow-Up - https://github.com/advisories/GHSA-26hh-7cqf-hhc6
Depends on vulnerable versions of postcss
fix available via `npm audit fix`
node_modules/next

postcss  <8.5.10
Severity: moderate
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output - https://github.com/advisories/GHSA-qx2v-qp2m-jg93
fix available via `npm audit fix`
node_modules/postcss

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix --force`
Will install exceljs@3.4.0, which is a breaking change
node_modules/svix/node_modules/uuid
node_modules/uuid
  exceljs  >=3.5.0
  Depends on vulnerable versions of uuid
  node_modules/exceljs
  svix  1.68.0 - 1.91.1
  Depends on vulnerable versions of uuid
  node_modules/svix
    resend  6.2.0-canary.0 - 6.12.2
    Depends on vulnerable versions of svix
    node_modules/resend

ws  8.0.0 - 8.20.0
Severity: moderate
ws: Uninitialized memory disclosure - https://github.com/advisories/GHSA-58qx-3vcg-4xpx
fix available via `npm audit fix`
node_modules/ws
```

## 5. Exact Web `npm outdated` Findings

`npm.cmd outdated` returned exit code 1 because outdated packages exist.

Exact findings:

```text
Package                Current   Wanted   Latest  Location                            Depended by
@eslint/eslintrc         3.3.1    3.3.1    3.3.5  node_modules/@eslint/eslintrc       gearbeat-V2
@sentry/nextjs         10.52.0  10.53.1  10.53.1  node_modules/@sentry/nextjs         gearbeat-V2
@supabase/ssr            0.6.1    0.6.1   0.10.3  node_modules/@supabase/ssr          gearbeat-V2
@supabase/supabase-js   2.49.4   2.49.4  2.106.2  node_modules/@supabase/supabase-js  gearbeat-V2
@types/node            22.15.3  22.15.3   25.9.1  node_modules/@types/node            gearbeat-V2
@types/react            19.1.3   19.1.3  19.2.15  node_modules/@types/react           gearbeat-V2
@types/react-dom        19.1.3   19.1.3   19.2.3  node_modules/@types/react-dom       gearbeat-V2
chart.js                 4.4.3    4.4.3    4.5.1  node_modules/chart.js               gearbeat-V2
eslint                  9.25.1   9.25.1   10.4.0  node_modules/eslint                 gearbeat-V2
eslint-config-next     15.5.16  15.5.18   16.2.6  node_modules/eslint-config-next     gearbeat-V2
next                   15.5.16  15.5.18   16.2.6  node_modules/next                   gearbeat-V2
react                   19.2.5   19.2.5   19.2.6  node_modules/react                  gearbeat-V2
react-chartjs-2          5.2.0    5.2.0    5.3.1  node_modules/react-chartjs-2        gearbeat-V2
react-dom               19.2.5   19.2.5   19.2.6  node_modules/react-dom              gearbeat-V2
resend                  6.12.2   6.12.3   6.12.3  node_modules/resend                 gearbeat-V2
tsx                     4.22.1   4.22.3   4.22.3  node_modules/tsx                    gearbeat-V2
typescript               5.8.3    5.8.3    6.0.3  node_modules/typescript             gearbeat-V2
```

## 6. Exact Mobile `npm audit` Findings

`mobile/npm.cmd audit` returned exit code 1 because audit findings exist.

Summary:

```text
11 moderate severity vulnerabilities
```

Exact findings:

```text
postcss  <8.5.10
Severity: moderate
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output - https://github.com/advisories/GHSA-qx2v-qp2m-jg93
fix available via `npm audit fix --force`
Will install expo@56.0.4, which is a breaking change
node_modules/postcss
  @expo/metro-config  <=0.0.1-canary-20240418-8d74597 || >=0.1.49-alpha.0
  Depends on vulnerable versions of @expo/config
  Depends on vulnerable versions of postcss
  node_modules/@expo/metro-config
    @expo/cli  <=0.0.0-canary-20231123-1b19f96-4 || >=0.0.1-canary-20231125-d600e44
    Depends on vulnerable versions of @expo/config
    Depends on vulnerable versions of @expo/config-plugins
    Depends on vulnerable versions of @expo/metro-config
    Depends on vulnerable versions of @expo/prebuild-config
    node_modules/@expo/cli
      expo  >=41.0.0-alpha.0
      Depends on vulnerable versions of @expo/cli
      Depends on vulnerable versions of @expo/config
      Depends on vulnerable versions of @expo/config-plugins
      Depends on vulnerable versions of @expo/metro-config
      Depends on vulnerable versions of expo-asset
      Depends on vulnerable versions of expo-constants
      node_modules/expo

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix --force`
Will install expo@56.0.4, which is a breaking change
node_modules/uuid
  xcode  >=0.9.2
  Depends on vulnerable versions of uuid
  node_modules/xcode
    @expo/config-plugins  *
    Depends on vulnerable versions of xcode
    node_modules/@expo/config-plugins
      @expo/config  <=0.0.1-canary-20240418-8d74597 || >=3.3.23-alpha.0
      Depends on vulnerable versions of @expo/config-plugins
      node_modules/@expo/config
        expo-constants  <=0.0.1-canary-20240418-8d74597 || 10.1.2 - 55.0.14 || 56.0.0-canary.20260212-4f61309 - 56.0.0-canary.20260506-964f25d
        Depends on vulnerable versions of @expo/config
        node_modules/expo-constants
          expo-asset  <=0.0.1-canary-20240418-8d74597 || 8.6.1 - 55.0.0-canary.20260223-05214f1 || 55.0.3-canary.20260128-67ce8d5 || 55.0.8-canary.20260424-7bedc9d - 55.0.8-canary.20260429-a5e59cf || 55.0.11-canary.20260327-0789fbc - 55.0.11-canary.20260402-9da566b || 56.0.0-canary.20260212-4f61309 - 56.0.0-canary.20260506-964f25d
          Depends on vulnerable versions of expo-constants
          node_modules/expo-asset
      @expo/prebuild-config  *
      Depends on vulnerable versions of @expo/config
      Depends on vulnerable versions of @expo/config-plugins
      node_modules/@expo/prebuild-config
```

## 7. Exact Mobile `npm outdated` Findings

`mobile/npm.cmd outdated` returned exit code 1 because outdated packages exist.

Exact findings:

```text
Package                                    Current   Wanted   Latest  Location                                                Depended by
@react-native-async-storage/async-storage    2.2.0    2.2.0    3.1.0  node_modules/@react-native-async-storage/async-storage  mobile
@types/react                               19.1.17  19.1.17  19.2.15  node_modules/@types/react                               mobile
expo                                       54.0.34  54.0.34   56.0.4  node_modules/expo                                       mobile
expo-status-bar                              3.0.9    3.0.9   56.0.4  node_modules/expo-status-bar                            mobile
react                                       19.1.0   19.1.0   19.2.6  node_modules/react                                      mobile
react-native                                0.81.5   0.81.5   0.85.3  node_modules/react-native                               mobile
react-native-safe-area-context               5.6.2    5.6.2    5.8.0  node_modules/react-native-safe-area-context             mobile
react-native-webview                       13.15.0  13.15.0  13.16.1  node_modules/react-native-webview                       mobile
typescript                                   5.9.3    5.9.3    6.0.3  node_modules/typescript                                 mobile
```

Mobile typecheck script status:

```text
NO_MOBILE_TYPECHECK_SCRIPT
```

## 8. Dependency Classification

### Security-critical

These require direct action before commercial release approval:

- `next`: high-severity middleware/proxy bypass advisory; relevant because GearBeat uses middleware.
- `@supabase/supabase-js` / transitive `@supabase/auth-js`: auth routing vulnerability; relevant because GearBeat relies on Supabase auth/session flows.
- `postcss`: XSS advisory through CSS stringify output; appears through Next and Expo dependency chains.
- `ws`: uninitialized memory disclosure; should be remediated through safe dependency graph updates.
- `uuid`: buffer bounds advisory; appears through ExcelJS/Resend/Svix and Expo/xcode chains.
- `eslint` transitive `@eslint/plugin-kit`: ReDoS advisory; dev-only but should be addressed in the release hygiene pass.

### Framework/runtime critical

These should be updated carefully and tested heavily:

- `next` and `eslint-config-next`: prefer a same-major 15.x patch first if it resolves the advisory; defer Next 16 until a separate upgrade patch.
- `@supabase/supabase-js`: likely needs update toward `2.106.2`; must be tested against `@supabase/ssr`, auth helpers, middleware, server/client/admin clients, and API routes.
- `@supabase/ssr`: latest is `0.10.3`; must be evaluated with `@supabase/supabase-js` update compatibility.
- `react` and `react-dom`: patch from `19.2.5` to `19.2.6` appears low-risk but should be paired with Next compatibility checks.

### Low-risk patch/minor updates

These can likely be grouped in a small hygiene patch if they do not cause lockfile churn beyond expectation:

- `@sentry/nextjs` `10.52.0` -> `10.53.1`
- `resend` `6.12.2` -> `6.12.3`
- `tsx` `4.22.1` -> `4.22.3`
- `react` `19.2.5` -> `19.2.6`
- `react-dom` `19.2.5` -> `19.2.6`
- `react-native-webview` `13.15.0` -> `13.16.1`, only if mobile is in scope.

### Potential breaking-change updates

These must be deferred to isolated upgrade branches unless there is a security emergency:

- `next` `15.5.16` -> `16.2.6`
- `eslint` `9.25.1` -> `10.4.0`
- `typescript` `5.8.3` -> `6.0.3`
- `@types/node` `22.15.3` -> `25.9.1`
- `@supabase/ssr` `0.6.1` -> `0.10.3`
- `expo` `54.0.34` -> `56.0.4`
- `expo-status-bar` `3.0.9` -> `56.0.4`
- `react-native` `0.81.5` -> `0.85.3`
- `@react-native-async-storage/async-storage` `2.2.0` -> `3.1.0`
- `typescript` in mobile `5.9.3` -> `6.0.3`

### Defer / do not update now

Defer these until the critical web security path is stable:

- Expo SDK 56 / React Native 0.85 migration.
- Next 16 migration.
- TypeScript 6 migration.
- ESLint 10 migration.
- Broad type-package major updates.
- Any dependency update that forces app code, API, auth, payment, middleware, or Supabase rewrites in the same patch.

## 9. Specific Package Action Notes

### Next.js

Action required.

Recommended first action:

- Attempt a same-major Next 15 patch update if a patched 15.x version is available.
- Keep `eslint-config-next` aligned with the Next version.
- Do not jump to Next 16 in the first security dependency patch unless Next 15 cannot satisfy the advisory.

Verification focus:

- Middleware session refresh.
- Subdomain/root redirect behavior.
- Auth callback and confirm pages.
- Admin, portal, customer, marketplace, and studios route access.

### Supabase packages

Action required.

Recommended first action:

- Update `@supabase/supabase-js` to a non-vulnerable version in a focused patch.
- Evaluate whether `@supabase/ssr` must move from `0.6.1` to `0.10.3` at the same time.

Verification focus:

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/admin.ts`
- `middleware.ts`
- login, signup, password reset, admin login, portal login, and customer profile flows.

### PostCSS

Action required, but likely resolved through Next/Expo framework updates rather than direct app dependency updates.

Web:

- PostCSS is transitive through Next.
- A safe Next patch should be attempted before adding direct overrides.

Mobile:

- PostCSS is transitive through Expo/Metro.
- Fix path points toward Expo 56, which is a breaking SDK migration and should be deferred to a mobile-specific patch.

### uuid

Action required, but do not downgrade `exceljs`.

Web:

- Audit suggests `npm audit fix --force` would install `exceljs@3.4.0`, a breaking downgrade. Do not use that path.
- Prefer updating `resend`/`svix` and/or dependency overrides only after impact review.

Mobile:

- uuid comes through Expo/xcode dependency chain.
- Treat as part of the Expo SDK migration plan, not a quick fix.

### ws

Action required.

Recommended:

- Resolve through safe transitive dependency updates where possible.
- Avoid adding a direct dependency unless absolutely necessary and documented.

### Expo and related packages

Action required, but deferred from the first web security patch.

Recommended:

- Keep mobile as a separate dependency patch because Expo 54 -> 56 and React Native 0.81 -> 0.85 can affect WebView behavior, build tooling, native config, and preview APK workflows.
- Add a mobile typecheck script before or during the mobile dependency patch.

## 10. Recommended Patch Sequence

### Patch 135C - Payment/Tap Safety Gate

Keep separate.

Purpose:

- Confirm Tap live-payment disable gate.
- Decide whether `/api/tap/webhook` should be blocked, gated, or sandbox-only until hardening.
- No dependency updates in this patch.

### Patch 135D - Service Role Route-by-Route Audit

Keep separate.

Purpose:

- Inventory `createAdminClient` usage and classify ownership/guard safety.
- No dependency updates in this patch.

### Patch 135E - metadataBase + `.env.example` Alignment

Keep separate.

Purpose:

- Add `metadataBase`.
- Align documented env vars for Tap/OTP without activating live payments.
- No dependency updates unless a tiny package-free metadata/env patch remains docs/config only.

### Patch 136A - Dependency Patch 1: Web Security Critical

Recommended first actual dependency update patch.

Candidate scope:

- Next 15 patch line and matching `eslint-config-next`.
- `@supabase/supabase-js` and potentially `@supabase/ssr`.
- Small same-range security fixes that npm can apply without force.

Rules:

- Do not use `npm audit fix --force`.
- Do not jump to Next 16 unless same-major remediation is impossible.
- Do not include mobile Expo updates.
- Do not include payment/auth/API rewrites.

### Patch 136B - Dependency Patch 2: Web Hygiene + Mobile Plan

Candidate scope:

- Sentry patch.
- Resend patch.
- tsx patch.
- React/React DOM patch.
- Evaluate `exceljs`, `uuid`, `ws`, and dev-tooling remediation.
- Decide whether mobile Expo dependency work becomes 136B or a separate 136C.

Rules:

- Keep TypeScript 6, ESLint 10, Next 16, and Expo 56 as isolated upgrade decisions.

## 11. Rollback Strategy for Future Dependency Updates

Before each actual dependency update patch:

- Start from a clean branch.
- Record current `git rev-parse --short HEAD`.
- Record current `npm.cmd audit` and `npm.cmd outdated`.
- Update only the intended package group.
- Commit the dependency update separately from any compatibility code fixes.

If verification fails:

- Revert the dependency commit with `git revert <commit>`.
- Do not hand-edit lockfile state as a rollback shortcut.
- If install state is corrupted locally, restore with `git clean` only after explicit approval because it can remove untracked files.
- Re-run `npm.cmd install` from the restored lockfile.
- Re-run typecheck, lint, build, and audit.

Vercel production rollback:

- If a dependency patch reaches production and causes runtime issues, use Vercel Instant Rollback to the previous healthy deployment.
- Then revert the dependency patch in Git and open a follow-up diagnosis patch.

## 12. Required Verification Commands for Future Dependency Update Patches

Web app:

```bash
npm.cmd install
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd audit
npm.cmd outdated
git status --short
git diff --name-only
```

Mobile app, if affected:

```bash
cd mobile
npm.cmd install
npm.cmd audit
npm.cmd outdated
npm.cmd run typecheck
npm.cmd start -- --clear
```

If the mobile package still has no typecheck script when a mobile dependency patch begins, add that as an explicit scoped change in the mobile patch or run local `tsc --noEmit` and document the substitution.

Focused smoke checks after web dependency updates:

- Home page renders.
- Marketplace page renders.
- Studios page renders.
- Login page renders.
- Supabase auth callback/confirm routes still compile.
- Middleware-protected admin/customer/portal redirects still behave.
- API routes compile and typecheck.
- No live Tap behavior is activated.

## 13. Final Verdict

### GO

GO for dependency update planning and a focused Patch 136A web security dependency update.

First update group:

- Next.js same-major patch line plus matching `eslint-config-next`, if available and advisory-safe.
- Supabase JS/auth dependency remediation, with `@supabase/ssr` compatibility review.
- npm-audit-remediable transitive fixes that do not require `--force` and do not cause framework major jumps.

### NOT GO

NOT GO for broad dependency modernization in one patch.

Must defer:

- Next 16 migration.
- Expo 56 / React Native 0.85 migration.
- TypeScript 6 migration.
- ESLint 10 migration.
- Any dependency update requiring auth, payment, API, database, middleware, or routing rewrites in the same patch.
- Any `npm audit fix --force` path that downgrades or major-upgrades packages without review.

## 14. Patch 135B Verification Expectations

Expected changed file:

- `docs/GEARBEAT_PATCH_135B_DEPENDENCY_AUDIT_UPDATE_PLAN.md`

Expected unchanged areas:

- `package.json`
- `package-lock.json`
- `mobile/package.json`
- `mobile/package-lock.json`
- App code
- API routes
- Supabase files
- Env files
- Middleware
- UI pages/components

Required verification:

- `git status --short`
- `git diff --name-only`
- `npm.cmd run typecheck`
