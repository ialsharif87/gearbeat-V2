# Manual code changes required

These changes depend on the current project files, so they should be applied carefully by Antigravity after reading the existing code.

## 1. Auth conflict

- Delete or stop using `lib/auth.ts` if it queries `from("users")`.
- Replace any import of `requireRole` or `getCurrentProfile` from `lib/auth.ts`.
- Use `lib/route-guards.ts` and database-backed role resolution instead.
- Search:

```bash
grep -rn "requireRole\|getCurrentProfile\|from(\"users\")" app lib --include="*.ts" --include="*.tsx"
```

## 2. Cron routes

In these routes:

- `app/api/reviews/create-requests/route.ts`
- `app/api/reviews/send-emails/route.ts`

Add this before any database or email call:

```ts
import { getCronAuthFailureResponse } from "@/lib/cron-auth";

const authFailure = getCronAuthFailureResponse(request);
if (authFailure) return authFailure;
```

## 3. Login security

In `app/login/page.tsx`:

- Remove email pre-checks against `profiles` or `admin_users`.
- Let `signInWithPassword()` fail naturally.
- Always show one generic error:
  - Arabic: `البريد الإلكتروني أو كلمة المرور غير صحيحة`
  - English: `Email or password is incorrect.`

## 4. Vendor signup

In `app/vendor-signup/page.tsx`:

- Remove `role` from `user_metadata`.
- Do not grant vendor access immediately.
- Create vendor profile as `status: "pending"` through a server action.
- Role checks must rely on database tables, not metadata.

## 5. Package versions

Do not leave dependencies as `latest` in `package.json`.
Pin versions and commit `package-lock.json`.

## 6. Verify

Run:

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
```
