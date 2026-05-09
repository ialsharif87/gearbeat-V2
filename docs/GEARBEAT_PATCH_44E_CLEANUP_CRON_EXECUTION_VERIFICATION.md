# GEARBEAT PATCH 44E — PENDING PAYMENT CLEANUP CRON EXECUTION VERIFICATION

## 1. Overview
This audit provides the post-deployment verification procedures for the "Stale Booking Cleanup" cron job. It ensures that the automated task is correctly monitored and that its execution logic maintains the integrity of studio inventory.

## 2. Configuration Parameters
- **Final Cron Path:** `/api/cron/bookings/cleanup-stale`
- **Final Cron Schedule:** `0 3 * * *` (Daily at 03:00 UTC)
- **Hobby Limitation:** The task runs once per 24 hours.

## 3. Vercel UI Verification
1.  Navigate to the **Vercel Project Dashboard**.
2.  Go to **Settings** > **Cron Jobs**.
3.  Confirm that `/api/cron/bookings/cleanup-stale` is listed with the status **Enabled**.

## 4. Execution Monitoring & Logs
Verification of successful execution can be performed via the **Logs** tab in Vercel:
- **Filter:** Search for the path `/api/cron/bookings/cleanup-stale`.
- **Frequency:** Logs should appear once every 24 hours at approximately 03:00 UTC.

### Expected Response Payloads
- **Success (Items Found):**
  ```json
  {
    "ok": true,
    "expiry_window_minutes": 60,
    "affected_rows": 5,
    "cancelled_booking_ids": ["uuid-1", "uuid-2", ...],
    "timestamp": "..."
  }
  ```
- **Success (No Items Found):**
  ```json
  {
    "ok": true,
    "expiry_window_minutes": 60,
    "affected_rows": 0,
    "cancelled_booking_ids": [],
    "timestamp": "..."
  }
  ```

## 5. Verification Checklist

### Safety Verification
- [ ] **Paid Safety:** Verify that no booking with `payment_status = 'paid'` is ever cancelled. The query explicitly uses `.neq("payment_status", "paid")`.
- [ ] **Status Precision:** Verify that only `pending_payment` bookings are affected. The query explicitly uses `.eq("status", "pending_payment")`.
- [ ] **Timing Safety:** Verify that bookings created less than 60 minutes ago are preserved. The query uses `.lt("created_at", expiryDate)`.

### Manual Trigger Procedure (Testing Only)
To trigger the cleanup manually without waiting for the schedule:
1.  Obtain the `CRON_SECRET` from Vercel Environment Variables.
2.  Send a GET request to `https://[your-domain]/api/cron/bookings/cleanup-stale`.
3.  Include header: `x-cron-secret: [CRON_SECRET]`.

## 6. Known Risks & Recommendations
- **Slot Recovery Delay:** Because Vercel Hobby is limited to daily runs, a studio slot could be "locked" for up to 23 hours after the 60-minute payment window has expired.
- **Future Recommendation:** Once the platform moves to a Pro plan or integrates an external scheduler (e.g., GitHub Actions, Upstash), the schedule should be increased to `*/15 * * * *` (Every 15 minutes) for optimal inventory recovery.

## 7. Files to Preserve
Do not modify `vercel.json`, `app/api/cron/bookings/cleanup-stale/route.ts`, or any core system logic.
