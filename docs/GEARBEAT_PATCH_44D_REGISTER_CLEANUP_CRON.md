# GEARBEAT PATCH 44D — REGISTER PENDING PAYMENT CLEANUP CRON

## 1. Overview
This patch activates the "Stale Booking Cleanup" automated task by registering it with the Vercel Cron scheduler. This ensures that studio slots blocked by abandoned `pending_payment` bookings are automatically released every 15 minutes.

## 2. Configuration Changes

### Vercel Deployment Configuration: `vercel.json`
- **Added Cron Entry:**
    - **Path:** `/api/cron/bookings/cleanup-stale`
    - **Schedule:** `0 3 * * *` (Daily at 03:00 UTC)
- **Hobby Compatibility:** Vercel Hobby accounts are limited to daily cron jobs. This schedule ensures deployment success while providing a baseline cleanup fallback.
- **Outcome:** The background cleanup logic implemented in Patch 44B is now officially scheduled for automatic invocation in production.

## 3. System Impact
- **Inventory Recovery:** Abandoned bookings older than 60 minutes will be purged daily. 
- **Note on Frequency:** A 15-minute cleanup interval (ideal for fast recovery) requires Vercel Pro or an external scheduler (e.g., GitHub Actions, Upstash). Daily cleanup is acceptable only as a temporary MVP-safe fallback to prevent indefinite blocking.
- **Security:** The Vercel Cron scheduler will automatically provide the `CRON_SECRET` needed to pass the `isAuthorizedCronRequest` check in the route.
- **Resource Usage:** Minimal. The cleanup route performs a single bulk update on indexed columns (`status`, `payment_status`, `created_at`).

## 4. Verification
- **Build/Lint:** `npm run lint` and `npm run build` must pass to ensure the JSON configuration doesn't break deployment.
- **Manual Check:** The `/api/cron/bookings/cleanup-stale` path matches the file structure established in Patch 44B.

## 5. Files to Preserve
Do not modify API route logic, SQL migrations, RLS policies, authentication, OTP, UI components, or payment provider integrations.
