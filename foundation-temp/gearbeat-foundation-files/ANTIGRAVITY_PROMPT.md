You are working on the GearBeat V2 project.

I have attached a ZIP bundle named `gearbeat-foundation-files.zip`. Your task is to carefully merge these foundation files into the main GearBeat V2 codebase.

Important rules:
1. Do not blindly overwrite existing project files if they already contain custom logic.
2. Compare each file from the ZIP with the current project file.
3. Merge safely and preserve any existing working code.
4. After merging, run the checks and fix any TypeScript, lint, or build errors.
5. Do not add new marketplace features yet. Focus only on foundation repair and security.

Main goals from the audit:

A) Project tooling
- Add or merge `.gitignore`.
- Add `.env.example` with all required env variables.
- Add or merge `next.config.ts` with security headers and Supabase image remote patterns.
- Replace the broken `tsconfig.json` include/path settings with the corrected version.
- Add or merge ESLint/Prettier config.

B) Error handling
- Add `lib/errors.ts`.
- Add `app/error.tsx`, `app/not-found.tsx`, and `app/loading.tsx`.
- Do not refactor all server actions yet, but start replacing future `throw new Error()` with `AppError`.

C) Cron security
- Add `lib/cron-auth.ts`.
- Update these files before any database/email action:
  - `app/api/reviews/create-requests/route.ts`
  - `app/api/reviews/send-emails/route.ts`
- Use:

```ts
import { getCronAuthFailureResponse } from "@/lib/cron-auth";

const authFailure = getCronAuthFailureResponse(request);
if (authFailure) return authFailure;
```

D) Auth repair
- Search the codebase for:

```bash
grep -rn "requireRole\|getCurrentProfile\|from(\"users\")" app lib --include="*.ts" --include="*.tsx"
```

- If `lib/auth.ts` queries a non-existing `users` table, stop using it or delete it.
- Replace its usage with the existing `lib/route-guards.ts` approach that reads `profiles`, `admin_users`, and `vendor_profiles`.
- Fix `app/customer/page.tsx` if it imports the broken `requireRole()`.

E) Login security
- In `app/login/page.tsx`, remove any pre-check that tells whether an email exists.
- Let `signInWithPassword()` fail naturally.
- Always show one generic error:
  - Arabic: `البريد الإلكتروني أو كلمة المرور غير صحيحة`
  - English: `Email or password is incorrect.`

F) Vendor signup security
- In `app/vendor-signup/page.tsx`, remove any client-provided `role` from `user_metadata`.
- Do not grant vendor access directly from signup.
- Vendor profile should be created with `status: "pending"` and only activated after admin approval.
- Role resolution must rely on database tables only, not `user_metadata.role`.

G) Saudi validation
- Add `lib/validation/saudi.ts`.
- Use it gradually in profile, signup, vendor onboarding, bank details, VAT, CR, and IBAN forms.

H) Database documentation
- Add `docs/schema.md`.
- Add `supabase/migrations/README.md` and `supabase/seed.sql`.
- Do not guess the production schema manually.
- Pull the real schema using Supabase CLI:

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db pull
```

I) Checks after changes
Run these commands:

```bash
npm install
npx tsc --noEmit
npm run lint
node scripts/check-admin-client-usage.mjs
npm run build
```

If errors appear, fix them step by step. Explain every file changed and why.

Final output required from you:
1. List all files added.
2. List all files modified.
3. Mention any files you did not change and why.
4. Show the final command results for TypeScript, lint, and build.
5. Do not continue to feature development until the foundation passes.
