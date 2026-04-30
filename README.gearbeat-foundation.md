# GearBeat Foundation Files

This bundle contains starter files to repair the GearBeat V2 foundation before adding more marketplace features.

## Included

- `.gitignore`
- `.env.example`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `prettier.config.mjs`
- `lib/errors.ts`
- `lib/cron-auth.ts`
- `lib/validation/saudi.ts`
- `app/error.tsx`
- `app/not-found.tsx`
- `app/loading.tsx`
- `docs/schema.md`
- `docs/security-checklist.md`
- `docs/MANUAL_CODE_CHANGES.md`
- `scripts/check-admin-client-usage.mjs`
- `supabase/migrations/README.md`
- `supabase/seed.sql`

## Important

Some fixes cannot be safely applied without the live project files. Those are listed in:

`docs/MANUAL_CODE_CHANGES.md`

Ask Antigravity to merge these files carefully, not blindly overwrite custom project files.
