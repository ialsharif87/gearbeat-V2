# GEARBEAT PATCH 44C — PENDING PAYMENT CLEANUP SCHEDULER AUDIT

## 1. Overview
This audit evaluates the scheduling status of the "Stale Booking Cleanup" route implemented in Patch 44B. It identifies whether the cleanup logic is automatically invoked by the platform's cron scheduler to ensure studio slots are released consistently.

## 2. Scheduling Status

### Vercel Cron Configuration
- **File Checked:** `vercel.json`
- **Current Status:** 🔴 **Incomplete**
- **Existing Crons:**
  - `/api/reviews/process` (Scheduled daily at 07:00 UTC)
- **Missing Crons:**
  - `/api/cron/bookings/cleanup-stale` (NOT SCHEDULED)

### Cleanup Route Details
- **Path:** `/api/cron/bookings/cleanup-stale`
- **Auth Behavior:** Requires `CRON_SECRET` via `Authorization: Bearer` or `x-cron-secret` header. Vercel Cron natively supports this when the environment variable is configured.
- **Expiry Logic:** 60-minute window from `created_at`.

## 3. Risks of Missing Schedule
- **Permanent Slot Blocking:** Abandoned `pending_payment` bookings will continue to block studio availability indefinitely unless the endpoint is manually triggered.
- **Operational Failure:** The atomic booking protection (Patch 42B) remains vulnerable to artificial "sold out" states if abandoned bookings are not purged automatically.
- **Dormant Logic:** The code in Patch 44B exists in the codebase but remains dormant and non-functional in production.

## 4. Recommendations for Patch 44D

### Implementation Step
Update `vercel.json` to include the cleanup route in the `crons` array.

### Recommended Frequency
- **Schedule:** `*/15 * * * *` (Every 15 minutes)
- **Rationale:** Since the expiry window is 60 minutes, running every 15 minutes ensures that stale bookings are purged reasonably quickly (max 75 minutes total hold time) without excessive server load.

### Proposed `vercel.json` Update:
```json
{
  "crons": [
    {
      "path": "/api/reviews/process",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/bookings/cleanup-stale",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

## 5. Implementation Constraints
- **Files to Modify:** `vercel.json`
- **Files NOT to Touch:**
  - `app/api/cron/bookings/cleanup-stale/route.ts` (Keep logic as is)
  - SQL Migrations / RLS Policies
  - Authentication / OTP
  - UI Components
  - Payment Provider Logic
