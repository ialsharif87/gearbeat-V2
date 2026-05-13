# GEARBEAT PATCH SEO-SITEMAP-CANONICAL-FIX

## Issue
The sitemap and robots.txt files were generating URLs using the `https://gearbeat.com` domain instead of the production `https://gearbeat.app` domain. This affects SEO indexing and canonicalization.

## Root Cause
Hardcoded `baseUrl` in `app/sitemap.ts` and hardcoded sitemap URL in `app/robots.ts` were pointing to the `.com` domain. Additionally, the global layout metadata had the `.com` domain for OpenGraph.

## Files Changed
- `app/sitemap.ts`: Updated `baseUrl` to `https://gearbeat.app`.
- `app/robots.ts`: Updated sitemap reference to `https://gearbeat.app/sitemap.xml`.
- `app/layout.tsx`: Updated OpenGraph URL to `https://gearbeat.app`.

## Validation Steps
1. Run `npm run build`.
2. Inspect `sitemap.xml` in the build output to ensure all `<loc>` entries use `gearbeat.app`.
3. Inspect `robots.txt` to ensure the sitemap path uses `gearbeat.app`.

## Scope & Risk
- **Risk:** Low. This only affects SEO metadata and does not touch application logic, database, or payments.
- **Scope:** Documentation and SEO configuration only.
