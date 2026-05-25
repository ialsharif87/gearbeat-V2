# GearBeat Patch 135E - metadataBase + .env.example Alignment

## Patch status

Patch 135E is a small release-readiness implementation patch after the Patch 135A-135D planning and audit sequence.

This patch fixes the Next.js production metadata warning by adding an explicit `metadataBase` source and aligns `.env.example` with the environment variables already referenced by the application and recent security-readiness plans.

## What changed

### `app/layout.tsx`

- Added a safe `metadataBase` helper for the root metadata export.
- The helper reads from `NEXT_PUBLIC_SITE_URL` when present.
- If `NEXT_PUBLIC_SITE_URL` is missing or invalid, it falls back to:

```txt
https://gearbeat.app
```

- Existing metadata fields were preserved, including title, description, icons, OpenGraph, and Twitter metadata.

### `.env.example`

- Clarified `NEXT_PUBLIC_SITE_URL` as the public canonical URL source for metadata, sitemap/robots URLs, email links, and callback URLs.
- Added missing placeholders for email sender, OTP readiness, and Tap sandbox/live-payment readiness.
- Added comments that explicitly keep Tap live payments disabled until payment hardening and business/legal approval are complete.

## Placeholders added

The following placeholders were added to `.env.example`:

```txt
RESEND_FROM=

OTP_HASH_SECRET=
OTP_PROVIDER=mock
MOCK_OTP_ENABLED=false
NEXT_PUBLIC_MOCK_OTP_ENABLED=false

TAP_ENV=sandbox
TAP_SECRET_KEY=
NEXT_PUBLIC_TAP_PUBLIC_KEY=
TAP_WEBHOOK_SECRET=
TAP_LIVE_PAYMENTS_ENABLED=false
```

`NEXT_PUBLIC_SITE_URL` already existed and was kept as the public site URL variable. Its guidance comments were expanded.

## Why metadataBase was added

Next.js warns in production builds when metadata uses relative OpenGraph/Twitter assets without an explicit `metadataBase`.

GearBeat already uses `NEXT_PUBLIC_SITE_URL` in sitemap, robots, email, and Tap callback-related code paths, so this patch uses that existing public URL convention for metadata as well. The hard fallback is `https://gearbeat.app`.

## Security confirmations

- No real secrets were added.
- No `.env` or real secret file was edited.
- Tap live payments remain disabled and not approved.
- Tap placeholders are documentation/example placeholders only.
- No API route logic changed.
- No payment logic changed.
- No auth logic changed.
- No Supabase client, SQL, RLS, or database logic changed.
- No package or dependency changes were made.
- No middleware or routing logic changed.

## Verification

Commands run:

```txt
git status --short
git diff --name-only
npm.cmd run typecheck
npm.cmd run build
```

Results:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed.
- Build output still includes existing warnings, including Sentry instrumentation migration guidance and existing lint warnings, but no build-blocking errors were introduced by Patch 135E.

## Final verdict

GO for metadataBase and `.env.example` alignment.

NOT GO for live Tap payments.

NOT GO for commercial launch/payment claims.

Recommended next patch: 136A Dependency Security Patch 1, if approved.
