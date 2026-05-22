# Patch 129D - Customer Social Links API + Validation Layer

## Objective

Add the customer-only API and validation layer for the `public.customer_social_links` table without enabling profile UI editing yet.

## API Route Added

- `app/api/customer/social-links/route.ts`

Supported methods:

- `GET /api/customer/social-links`
  - Requires an authenticated Supabase session.
  - Returns the current customer's social links as `{ links: [...] }`.
  - Reads rows from `customer_social_links` scoped to the server-side authenticated user.

- `PUT /api/customer/social-links`
  - Requires an authenticated Supabase session.
  - Accepts `{ links: [...] }`.
  - Replaces the authenticated customer's social links.
  - Allows an empty array to clear all social links.
  - Never accepts or trusts `user_id` from the request body.

## Auth And Session Behavior

The route uses the existing server Supabase helper:

- `createClient()` from `lib/supabase/server`
- `supabase.auth.getUser()` for the authenticated user

The API always uses `user.id` from the server-side Supabase session as `customer_social_links.user_id`. No client-submitted user identifier is accepted.

## Validation Rules

Validation lives in:

- `lib/customer-social-links.ts`

Rules enforced before any database write:

- `links` must be an array.
- Supported platforms only:
  - `instagram`
  - `tiktok`
  - `x`
  - `youtube`
  - `linkedin`
  - `facebook`
  - `website`
- URL is required for each submitted link.
- URL must parse as `http://` or `https://`.
- URL length is capped at 300 characters.
- Optional `handle` is trimmed and capped at 80 characters.
- Duplicate platforms in a single request are rejected.
- Total submitted links cannot exceed the supported platform count.
- Empty array is valid and clears the customer's links.

## RLS Reliance

The API uses the authenticated Supabase client, not the service-role client. Ownership is enforced by the migration's RLS policies:

- Customers can select their own rows.
- Customers can insert their own rows.
- Customers can update their own rows.
- Customers can delete their own rows.

The route also scopes all reads/deletes to `user.id` as a defense-in-depth application boundary.

## What Was Intentionally Not Done

- No profile UI was enabled.
- No profile page fields were edited.
- No API route accepts admin or service-role access.
- No migration file was added or changed.
- No seed data was changed.
- No database commands were run.
- No Supabase CLI or Supabase MCP was used.
- No auth, payment, booking, marketplace, admin, partner, seller, or portal logic was changed.

## Safety Confirmation

- SQL execution: none.
- Supabase CLI: not run.
- Supabase MCP: not used.
- Database writes outside normal application code: none.
- Service role usage: none.
- UI implementation: none.

## Next Recommended Patch

Patch 129E should enable the existing profile social links UI by loading from and saving through `/api/customer/social-links`, while keeping profile identity/contact saves separate from optional social link saves.
