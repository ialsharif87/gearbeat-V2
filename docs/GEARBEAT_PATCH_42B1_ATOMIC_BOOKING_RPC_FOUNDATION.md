# GEARBEAT PATCH 42B1 — ATOMIC BOOKING RPC FOUNDATION

## 1. Overview
This patch implements the database foundation for atomic booking creation. It introduces a Postgres function (RPC) that uses advisory locking to serialize booking attempts for a specific studio and date, ensuring that overlapping bookings are prevented at the database level.

## 2. Changes Applied

### Database Migration: `supabase/migrations/patch_42b_atomic_booking_rpc.sql` [NEW]
- **Status Check Update:** Ensured the `bookings_status_check` constraint includes the `pending_payment` status, which is the initial state for new bookings.
- **RPC Function:** Added `public.create_studio_booking_v1` with the following features:
    - **Advisory Locking:** Uses `pg_advisory_xact_lock` on the hash of the studio ID and booking date to prevent race conditions during concurrent creation attempts.
    - **Conflict Validation:** Checks for overlapping bookings with active statuses (`pending_payment`, `pending`, `confirmed`, `paid`, `accepted`) within the same transaction.
    - **Atomic Insert:** Inserts the new booking only if no conflict is found.
    - **Security:** Set to `SECURITY DEFINER` to bypass RLS for internal checks, but restricted execution permissions to the `service_role` only.

## 3. Implementation Details
- **Fields Matched:** The RPC arguments and insertion logic match the fields used in the current booking creation API (`app/api/studios/bookings/create/route.ts`).
- **Conflict Range:** `(start_time < p_end_time) AND (end_time > p_start_time)` logic is applied.
- **Return Type:** Returns a JSONB object with `ok`, `booking_id` (on success), or `error` and `message` (on failure/conflict).

## 4. Safety & Scope
- **Foundation Only:** This patch only adds the database function. It does not connect the app/API to this function yet.
- **No Destructive Changes:** No tables or columns were renamed or dropped. No existing data was modified.
- **No Side Effects:** Existing application logic, payment flows, and UI remain untouched.

## 5. Verification Results
- **Lint Result:** Passed (0 errors, 503 warnings).
- **Build Result:** Successful (Exit code: 0).
