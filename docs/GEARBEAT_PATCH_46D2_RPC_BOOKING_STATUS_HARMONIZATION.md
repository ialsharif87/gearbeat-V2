# GEARBEAT PATCH 46D2 — RPC BOOKING STATUS HARMONIZATION

## 1. Overview
This patch implements the atomic booking RPC synchronization planned in the Patch 46 series. It updates the `create_studio_booking_v1` conflict detection logic to enforce a consistent "Occupied" state across the system.

## 2. Changes

### Database Layer: `supabase/migrations/patch_46d2_rpc_booking_status_harmonization.sql`
- **Updated `create_studio_booking_v1` RPC:**
    - **Added Blocking Statuses:** `pending_review`, `pending_owner_review`, `completed`.
    - **Removed Invalid Status:** `paid` (This was a "logic ghost" as `paid` is a `payment_status`).
- **Final RPC Conflict List:**
    - `pending_payment`
    - `pending`
    - `pending_review`
    - `pending_owner_review`
    - `accepted`
    - `confirmed`
    - `completed`

## 3. Rationale
- **Historical Integrity:** Including `completed` ensures that past bookings are protected from double-booking attempts at the database level.
- **Bypass Protection:** Including `pending_review` and `pending_owner_review` prevents direct API calls from double-booking slots that the UI correctly shows as blocked.
- **Code Hygiene:** Removing `paid` from the `status` check corrects a legacy mismatch between the `status` and `payment_status` columns.

## 4. Preservation
The following were strictly preserved without modification:
- Advisory lock serialization logic.
- Time range validation.
- Insertion and return payloads.
- Security Definer settings and search_path.
- Execution permissions.

## 5. Verification
- **Build/Lint:** `npm run lint` and `npm run build` confirm no regressions in the application code.
- **SQL Integrity:** The migration uses `CREATE OR REPLACE FUNCTION` to ensure a safe, non-destructive update to the existing logic.
