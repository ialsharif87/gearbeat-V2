# GEARBEAT PATCH 40 — AVAILABILITY UI PRICING UPDATE

## 1. Overview
This patch introduces the owner-facing management UI for granular day and time-based pricing rules. Studio owners can now define specific price tiers for different time blocks within the same day (e.g., peak hours), leveraging the database schema established in Patch 39.

## 2. Changes Applied

### UI: `components/studio-availability-manager.tsx` [MODIFY]
- **Pricing Rule State:** Added `PricingRule` type and state management for granular pricing tiers.
- **Tiers Management Section:** Implemented a new "Time-based Pricing Tiers" section following the Exceptions section.
- **Add/Remove Logic:** Added forms and logic to add new tiers (validating start/end times and non-negative pricing) and remove existing ones.
- **Premium Design:** Integrated the UI with the existing GearBeat dark aesthetic, utilizing `gb-card`, `gb-button`, and `gb-input` styles.
- **Multi-language Support:** All labels and messages support both English and Arabic.

### API: `app/api/portal/studios/availability/update/route.ts` [MODIFY]
- **Payload Support:** Updated the route to accept and normalize `pricingRules`.
- **Atomic Save:** Implemented a delete-and-reinsert pattern for `studio_availability_pricing_rules` during the atomic save operation.
- **Security Enforcement:** Reused the strict server-side ownership verification (`userOwnsStudio`) to ensure owners can only modify pricing for studios they legally control.

### Page: `app/portal/studio/availability/page.tsx` [MODIFY]
- **Data Loading:** Updated the server component to fetch existing pricing rules from `studio_availability_pricing_rules` for the selected studio.
- **Props Integration:** Correctly passes `initialPricingRules` to the `StudioAvailabilityManager`.

## 3. Ownership & Security Model
- **Strict Verification:** Ownership is verified using `owner_auth_user_id`, `owner_id`, or `user_id` before any database write occurs.
- **Server-Side Only:** Pricing rules are managed via the Admin Client only after explicit authentication and ownership validation on the server.
- **No Public Exposure:** The RLS policies implemented in Patch 39 remain in effect, ensuring that pricing rules are only accessible to the studio owner in this patch.

## 4. Limitations & Future Work
- **Conflict Validation:** Overlapping time tiers for the same day are currently allowed by the UI/API; future work could include client-side or server-side overlap prevention.
- **Booking Engine:** The booking engine and checkout flow currently do not utilize these granular rules for price calculation. Integration into the customer flow is reserved for a future patch.
- **Currency Selection:** While the schema supports it, the current UI defaults to 'SAR'. Future updates could allow selecting different currencies per tier.

## 5. Verification Results
- **Lint Result:** Passed (0 errors, 505 warnings).
- **Build Result:** Successful (Exit code: 0).
- **No Side Effects:** Confirmed that no booking calculation, payment logic, or public pricing display was modified.
