# GearBeat Security Checklist

## Must fix first

- Remove `lib/auth.ts` if it queries a non-existing `users` table.
- Remove all use of client-provided role metadata for access control.
- Make login and forgot-password errors generic to prevent email enumeration.
- Protect all cron endpoints with `CRON_SECRET` and reject requests if the secret is missing or too short.
- Audit every `createAdminClient()` usage.
- Add RLS policies for SELECT, INSERT, UPDATE, DELETE on all user-facing tables.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Mask national ID, Iqama, CR, VAT, and IBAN in admin UI.

## Run before deployment

```bash
npm run lint
npx tsc --noEmit
node scripts/check-admin-client-usage.mjs
```
