# Patch 128C — Customer Bookings Page Runtime Fix

## Route Confirmed

- Customer bookings route: `/customer/bookings`
- Existing booking review route: `/customer/bookings/[id]/review`

## Root Cause

The customer bookings page queried legacy/display-only booking field candidates directly from `public.bookings`:

- `date`
- `total_price`
- `amount`

The local schema foundation and migrations confirm the canonical customer booking fields are:

- `booking_date`
- `start_time`
- `end_time`
- `total_amount`
- `currency_code`

When PostgREST receives a `select` containing a column that is not present in the deployed table, the entire query fails. The page then threw `bookingsError.message`, which caused `/customer/bookings` to fail at runtime instead of showing a safe empty or partial state.

The page also linked booking cards to `/customer/bookings/{id}`, but the existing customer route is `/customer/bookings/{id}/review`.

## Fix

- Narrowed the bookings select list to confirmed, canonical display fields.
- Added a safe studio-join fallback:
  - first try bookings with related studio display data;
  - if the relationship query fails, log a safe warning and render booking rows without studio details.
- Preserved premium 128B page styling and empty state.
- Added a booking ID guard before rendering the review CTA.
- Updated the booking CTA to point to `/customer/bookings/[id]/review`.

## Safety Boundaries

- No SQL was run.
- No Supabase CLI, Supabase MCP, or database writes were used.
- No `.env` files were edited.
- No auth, admin, partner, seller, payment provider, booking mutation, or marketplace mutation logic was changed.
- No fake bookings were added.

## Testing Result

- Typecheck: passed with `npm.cmd run typecheck`.
- Build: passed with `npm.cmd run build`.
- Local unauthenticated smoke check was attempted with `next start -p 3001`, but this workspace runtime is missing `SUPABASE_SERVICE_ROLE_KEY`, so the request was blocked by environment configuration before customer page verification could complete.
