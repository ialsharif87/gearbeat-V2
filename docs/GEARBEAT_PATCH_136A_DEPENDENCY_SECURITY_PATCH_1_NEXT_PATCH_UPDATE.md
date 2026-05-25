# GearBeat Patch 136A - Dependency Security Patch 1: Next.js Patch-Level Update

## Patch status

Patch 136A performs a narrow web dependency security update for Next.js only.

No broad dependency update was performed. No app code, API routes, auth logic, payment logic, Supabase files, SQL, environment files, middleware, routing, mobile package files, or business logic were changed.

## Dependency changed

Previous Next.js version:

```txt
next 15.5.16
```

New Next.js version:

```txt
next 15.5.18
```

Install command used:

```txt
npm.cmd install next@15.5.18 --save-exact
```

## Why this patch is limited to Next.js only

Patch 135B identified Next.js as the first security-critical web framework dependency to patch because the audit report included a high-severity Next.js App Router middleware/proxy bypass advisory.

This patch intentionally updates only Next.js inside the current 15.5.x line. It does not update React, React DOM, Supabase packages, Expo/mobile packages, TypeScript, ESLint, Sentry, Resend, PostCSS directly, uuid, or ws.

Keeping this patch narrow makes rollback and verification simpler and avoids mixing framework security remediation with auth, payment, API, database, middleware, or mobile upgrade work.

## npm audit before

Command:

```txt
npm.cmd audit
```

Before summary:

```txt
12 vulnerabilities (4 low, 7 moderate, 1 high)
```

Notable before findings:

- `next`: high-severity Next.js Middleware / Proxy bypass in App Router applications via segment-prefetch routes.
- `postcss`: moderate XSS advisory through CSS stringify output.
- `@supabase/auth-js`: Supabase auth routing advisory through the pinned `@supabase/supabase-js`.
- `@eslint/plugin-kit`: ReDoS advisory through ESLint.
- `uuid`: buffer bounds advisory through ExcelJS/Resend/Svix.
- `ws`: uninitialized memory disclosure.
- `brace-expansion`: moderate DoS advisory.

## npm audit after

Command:

```txt
npm.cmd audit
```

After summary:

```txt
12 vulnerabilities (4 low, 8 moderate)
```

Change in audit posture:

- The previous high-severity Next.js audit summary item is no longer present after updating to `next@15.5.18`.
- Remaining findings still require follow-up patches.

Remaining audit findings:

- `@eslint/plugin-kit <0.3.4` through `eslint`.
- `@supabase/auth-js <=2.69.1` through `@supabase/supabase-js`.
- `brace-expansion 5.0.2 - 5.0.5`.
- `postcss <8.5.10`; audit still traces this through `next`.
- `uuid <11.1.1` through `exceljs` and `resend`/`svix`.
- `ws 8.0.0 - 8.20.0`.

Important note:

- `npm audit fix --force` remains unsafe for this project because suggested paths include breaking or undesirable changes such as major/downgrade dependency moves.

## npm outdated before

Command:

```txt
npm.cmd outdated
```

Before Next.js row:

```txt
Package  Current  Wanted   Latest
next     15.5.16  15.5.18  16.2.6
```

Other outdated packages were present before this patch, including `eslint-config-next`, Sentry, Supabase packages, React/React DOM, Resend, tsx, TypeScript, and type packages. They were intentionally not updated in Patch 136A.

## npm outdated after

Command:

```txt
npm.cmd outdated
```

After Next.js row:

```txt
Package  Current  Wanted   Latest
next     15.5.18  15.5.18  16.2.6
```

Remaining outdated packages include:

- `eslint-config-next 15.5.16 -> 15.5.18`
- `@sentry/nextjs 10.52.0 -> 10.53.1`
- `@supabase/ssr 0.6.1 -> 0.10.3`
- `@supabase/supabase-js 2.49.4 -> 2.106.2`
- React and React DOM patch updates
- Resend and tsx patch updates
- TypeScript and major type-package updates

These are deferred to later scoped patches.

## Verification commands and results

Commands run:

```txt
npm.cmd ls next
npm.cmd audit
npm.cmd outdated
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git status --short
git diff --name-only
```

Results:

- `npm.cmd ls next`: passed; root, Sentry, and Speed Insights resolve to `next@15.5.18`.
- `npm.cmd audit`: completed with remaining findings; summary is now `12 vulnerabilities (4 low, 8 moderate)`.
- `npm.cmd outdated`: completed with expected remaining outdated packages; Next.js current/wanted is now `15.5.18`.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed with existing warnings; reported `548 problems (0 errors, 548 warnings)`.
- `npm.cmd run build`: passed on Next.js `15.5.18`.

Build notes:

- Build output included transient `fonts.googleapis.com` DNS retry messages, but compilation completed successfully.
- Build output included the existing Sentry `sentry.client.config.ts` deprecation warning.
- Build output included existing lint warnings during the build validation step.

## Confirmations

- Supabase packages were not updated.
- PostCSS was not directly updated.
- uuid was not updated.
- ws was not updated.
- Expo/mobile packages were not updated.
- React and React DOM were not updated.
- TypeScript was not updated.
- No app code changed.
- No API route changed.
- No auth logic changed.
- No payment logic changed.
- No Supabase file changed.
- No SQL, RLS, or database file changed.
- No env file changed.
- No business logic changed.

## Rollback

Rollback command after this patch is committed:

```txt
git revert <commit_hash>
```

## Final verdict

GO for Patch 136A as a narrow Next.js patch-level security update.

Remaining dependency work is still required before commercial release approval.

Recommended next patch: 136B Dependency Security Patch 2 for the next scoped dependency group, likely Supabase auth/client remediation or a tightly separated web hygiene patch if approved.
