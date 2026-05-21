# Patch 129A — Customer Social Links Data Model Audit

## Objective

Audit the current customer/profile implementation and recommend the safest data model for customer social links before any schema, API, or UI implementation work.

This is an audit/planning patch only. No SQL was executed, no Supabase CLI/MCP commands were run, and no database writes were performed.

## Files Inspected

- `app/profile/page.tsx`
- `app/profile/repair/ProfileRepairClient.tsx`
- `app/customer/page.tsx`
- `app/customer/*`
- `app/api/customer/profile/ensure/route.ts`
- `lib/customer-profile.ts`
- `supabase/migrations/20260519000000_foundation_dependency_bootstrap.sql`
- `supabase/migrations/20260519000003_forward_foundation_column_backfills.sql`
- `docs/GEARBEAT_PATCH_21_PROFILE_SCHEMA_AUDIT.md`
- `docs/GEARBEAT_PATCH_128B_CUSTOMER_ACCOUNT_PAGES_PREMIUM_UI_LOCALIZATION.md`

## Current Implementation Summary

The current customer profile implementation uses `public.profiles` as the durable customer profile record, with some mirrored Auth metadata for name, phone, role, and identity information.

The main profile page at `/profile` currently:

- Selects `id`, `auth_user_id`, `email`, `full_name`, `phone`, `role`, identity fields, account status fields, and timestamps from `profiles`.
- Updates Supabase Auth user metadata for name, phone, role, and identity fields.
- Upserts `profiles` with `auth_user_id`, `email`, `full_name`, `phone`, `role`, identity fields, `account_status`, and `updated_at`.
- Shows the Patch 128B Social Links section as disabled UI/readiness-only fields.

The customer profile ensure path currently:

- Lives at `app/api/customer/profile/ensure/route.ts`.
- Calls `ensureCustomerProfileForUser` in `lib/customer-profile.ts`.
- Upserts profile identity/contact/preference fields only.
- Does not create or update social links.

## Schema Findings

No customer social links persistence was found in the current profile/customer schema scan.

The current `public.profiles` foundation includes:

- `id`
- `auth_user_id`
- `email`
- `full_name`
- `phone`
- `role`
- `phone_verified`
- `email_verified`
- `identity_verification_status`
- `identity_type`
- `identity_number`
- `identity_locked`
- `account_status`
- `country_code`
- `phone_country_code`
- `phone_e164`
- `membership_number`
- `referral_code`
- `referred_by_code`
- `preferred_currency`
- `preferred_language`

The following were not found as `profiles` columns, separate customer tables, API fields, or save-enabled UI fields:

- Instagram
- TikTok
- X / Twitter
- YouTube
- LinkedIn
- Facebook
- Website
- `social_links`
- `customer_social_links`

One unrelated `website text` field appears in `supabase/migrations/20260519000001_founder_full_journey_sql_gap_fill.sql`, but it is not part of the customer `profiles` model found in the active foundation/backfill profile schema.

## UI Findings

Patch 128B added the visible Social Links section in `app/profile/page.tsx`, but the fields are intentionally disabled:

- Instagram
- TikTok
- X / Twitter
- YouTube
- LinkedIn
- Facebook
- Website

The UI copy says the fields are prepared for a future profile update and are not saved yet. This matches the current schema and save logic reality.

## Save/Update Support Matrix

| Field | Current UI | Current API/server support | Current schema support |
| --- | --- | --- | --- |
| Instagram | Disabled placeholder | No | No |
| TikTok | Disabled placeholder | No | No |
| X / Twitter | Disabled placeholder | No | No |
| YouTube | Disabled placeholder | No | No |
| LinkedIn | Disabled placeholder | No | No |
| Facebook | Disabled placeholder | No | No |
| Website | Disabled placeholder | No customer profile support | No customer profile support |

## Data Model Options

### Option A — Add Columns To `profiles`

Add nullable text columns such as `instagram_url`, `tiktok_url`, `x_url`, `youtube_url`, `linkedin_url`, `facebook_url`, and `website_url` directly to `public.profiles`.

Pros:

- Simple reads and writes from `/profile`.
- Easy to display on the customer account page.
- No join required.

Cons:

- Adds many sparse columns to a table that already mixes identity, account, verification, preferences, rewards, and lifecycle fields.
- Future platforms require more schema changes.
- More likely to expand the existing profile table into a large catch-all table.

### Option B — Separate `customer_social_links` Table

Create a dedicated table with one row per customer and explicit nullable URL columns.

Pros:

- Keeps public profile identity/lifecycle fields separate from optional presentation/contact surfaces.
- Supports clear RLS focused on customer-owned editable social data.
- Allows future moderation/review metadata without bloating `profiles`.
- Easier to evolve into public profile cards, creator portfolios, or customer-facing sharing without touching core profile constraints.
- Cleaner API boundary: `/api/customer/social-links` can own validation and persistence.

Cons:

- Requires one extra read/join when rendering profile data.
- Requires a new table, RLS policies, and API wiring.

### Option C — JSONB `social_links` Field

Add a single `profiles.social_links jsonb` field with keys for each platform.

Pros:

- Flexible for new platforms.
- Minimal schema footprint.
- Simple to add as one column.

Cons:

- Harder to validate with database constraints.
- More error-prone API validation and partial updates.
- Harder to query for moderation, admin review, public profile discovery, and future verification.
- Makes `profiles` carry another mixed-purpose field.

## Recommendation

Recommended option: **Option B — separate `customer_social_links` table**.

Reasoning:

- GearBeat already has sensitive customer profile concerns in `profiles`: identity, account status, deletion lifecycle, phone/email verification, role, and rewards references.
- Social links are optional, public-facing profile adornments. They should not be coupled to account lifecycle or identity verification columns.
- A separate table gives a clean RLS boundary and an obvious future place for moderation fields such as `visibility`, `review_status`, `reviewed_by`, `reviewed_at`, or `last_verified_at`.
- It avoids adding seven sparse fields to `profiles` while still keeping a single-row customer-owned structure that is easy to read and update.

## Draft SQL Only — Do Not Execute

This SQL is a planning draft only. It must be reviewed and converted into a proper migration in a future patch.

```sql
-- DRAFT ONLY. DO NOT EXECUTE IN PATCH 129A.

create table if not exists public.customer_social_links (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  instagram_url text,
  tiktok_url text,
  x_url text,
  youtube_url text,
  linkedin_url text,
  facebook_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_social_links_instagram_url_length check (instagram_url is null or char_length(instagram_url) <= 300),
  constraint customer_social_links_tiktok_url_length check (tiktok_url is null or char_length(tiktok_url) <= 300),
  constraint customer_social_links_x_url_length check (x_url is null or char_length(x_url) <= 300),
  constraint customer_social_links_youtube_url_length check (youtube_url is null or char_length(youtube_url) <= 300),
  constraint customer_social_links_linkedin_url_length check (linkedin_url is null or char_length(linkedin_url) <= 300),
  constraint customer_social_links_facebook_url_length check (facebook_url is null or char_length(facebook_url) <= 300),
  constraint customer_social_links_website_url_length check (website_url is null or char_length(website_url) <= 300)
);

alter table public.customer_social_links enable row level security;

drop policy if exists "Customers can read their own social links" on public.customer_social_links;
create policy "Customers can read their own social links"
  on public.customer_social_links
  for select
  using (auth.uid() = auth_user_id);

drop policy if exists "Customers can insert their own social links" on public.customer_social_links;
create policy "Customers can insert their own social links"
  on public.customer_social_links
  for insert
  with check (auth.uid() = auth_user_id);

drop policy if exists "Customers can update their own social links" on public.customer_social_links;
create policy "Customers can update their own social links"
  on public.customer_social_links
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);
```

## RLS Policy Direction

Recommended baseline:

- Enable RLS on `customer_social_links`.
- Allow authenticated customers to select, insert, and update only their own row using `auth.uid() = auth_user_id`.
- Do not allow customer deletes initially; clearing fields should set URLs to `null`.
- Do not expose service-role operations to the browser.
- If admin moderation is added later, use existing server-side admin patterns and admin-only routes rather than broad client policies.

Potential future public-read policy should not be added until the product decides which social links are public. If public profile display becomes a requirement, add explicit `visibility` or per-link visibility controls first.

## Validation Rules

Recommended application validation:

- Accept empty strings and normalize them to `null`.
- Trim whitespace.
- Require `https://` URLs.
- Limit each URL to 300 characters.
- Allow only expected hostnames per platform where practical:
  - Instagram: `instagram.com`
  - TikTok: `tiktok.com`
  - X / Twitter: `x.com`, `twitter.com`
  - YouTube: `youtube.com`, `youtu.be`
  - LinkedIn: `linkedin.com`
  - Facebook: `facebook.com`, `fb.com`
  - Website: any valid `https://` URL, excluding localhost/private-network URLs.
- Store normalized URL strings only, not usernames, unless the UI intentionally switches to username-first inputs.

Recommended database constraints:

- Keep database constraints lightweight: length checks and ownership.
- Prefer application/API validation for platform hostname rules because URL parsing is easier and safer in TypeScript than in SQL check constraints.

## Backend/API Wiring Plan

Recommended next implementation shape:

1. Add a migration in a future patch for `customer_social_links`.
2. Add a server-only validator helper, for example `lib/customer-social-links.ts`.
3. Add customer API routes:
   - `GET /api/customer/social-links`
   - `PUT /api/customer/social-links`
4. Use the existing authenticated customer session from `createClient()`.
5. Upsert only the authenticated user's row.
6. Never accept `auth_user_id` from the client body.
7. Return user-safe validation errors and log safe technical details with `console.warn`.

## UI Wiring Plan

Recommended follow-up UI plan:

1. Keep Patch 128B fields disabled until the schema/API patch is merged.
2. After API support exists, enable fields in `/profile`.
3. Load existing social links server-side or via a customer-only API call.
4. Save through the new customer social-links API, not through the existing profile identity update action.
5. Preserve Arabic/English copy.
6. Add clear success and validation error states.
7. Keep social links separate from identity/security profile save to avoid making optional social fields block critical account updates.

## Risks And Blockers

- Current `profiles` RLS policy in the migration foundation includes public profile read access. Social links should not inherit that exposure accidentally.
- The profile page currently updates both Auth metadata and `profiles`. Social links should avoid Auth metadata entirely.
- Current profile code uses `any`-typed profile rows; a future implementation should add a small typed payload to avoid field drift.
- If public social links become visible on customer-facing profile cards, privacy controls must be defined first.
- Production schema should be inspected with a read-only schema query before applying a future migration, because historical migrations and deployed schema can drift.

## Recommended Next Patch Sequence

1. **Patch 129B — Customer Social Links Schema Draft Migration**
   - Create the migration file only after approval.
   - Add `customer_social_links` table and RLS.
   - No UI changes.

2. **Patch 129C — Customer Social Links API**
   - Add validation helper and customer-only GET/PUT API routes.
   - No UI enablement yet beyond tests.

3. **Patch 129D — Profile Social Links UI Enablement**
   - Enable the Patch 128B social fields.
   - Wire save/load to the customer social-links API.
   - Preserve profile identity save behavior.

## Final Audit Decision

Social links do not currently exist as saved customer profile data. Patch 128B correctly left them as UI/readiness-only. GearBeat should use a dedicated `customer_social_links` table with strict customer-owned RLS and a separate API boundary, rather than adding more optional fields directly to `profiles` or using a JSONB blob.
