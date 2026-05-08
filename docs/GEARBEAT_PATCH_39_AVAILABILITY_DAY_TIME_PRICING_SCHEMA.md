# GEARBEAT PATCH 39 — AVAILABILITY DAY/TIME PRICING SCHEMA

## 1. Overview
This patch provides the database schema foundation for advanced day and time-based pricing. While basic day-level pricing existed, this patch introduces a dedicated structure for granular time-based pricing tiers (e.g., peak vs. off-peak hours) and adds currency support to the existing availability framework.

## 2. Schema Findings
- **Existing Support:** `studio_availability_rules` and `studio_availability_exceptions` already supported a single `price_per_hour` field per day or exception range.
- **Identified Gaps:** Missing support for multiple pricing tiers within the same day and lack of explicit `currency` tracking in the availability tables.

## 3. Changes Applied

### New Table: `public.studio_availability_pricing_rules` [NEW]
This table enables multiple price levels for different time ranges on any given day of the week.
- **`id`** (UUID): Primary key.
- **`studio_id`** (UUID): Reference to the studio.
- **`day_of_week`** (INTEGER): 0-6 (Sunday to Saturday).
- **`start_time`**, **`end_time`** (TIME): The duration for which the price applies.
- **`price_per_hour`** (DECIMAL): The hourly rate for this specific tier.
- **`currency`** (TEXT): The currency code (defaults to 'SAR').
- **`is_active`** (BOOLEAN): Status toggle for the rule.

### Existing Tables: `public.studio_availability_rules` & `public.studio_availability_exceptions` [MODIFY]
- Added **`currency`** (TEXT) column to both tables to ensure consistent price tracking across the platform.

### Indexes
- **`idx_studio_availability_pricing_rules_studio_id`**: For studio-specific pricing lookups.
- **`idx_studio_availability_pricing_rules_day_time`**: For optimized price resolution during booking selection.
- **`idx_studio_availability_pricing_rules_active`**: Optimized lookup for currently active pricing tiers.

### RLS Policies
- **Read Access:** Restricted to verified studio owners for now. Public read access is not opened in this patch to maintain privacy during the foundation build.
- **Write Access:** Strictly limited to verified studio owners. The policy matches the multi-column ownership check pattern used in recent security hardening (supporting `owner_auth_user_id`, `owner_id`, and `user_id`).
- **Future Access:** Public/customer pricing read behavior for the booking flow must be added in a separate, controlled patch.

## 4. Backward Compatibility
- **Additive Only:** All changes are additive. Existing availability data remains untouched.
- **Safe Defaults:** New currency columns default to 'SAR' to match current platform behavior.
- **No Logic Changes:** No booking calculation or payment logic was modified in this patch.

## 5. Future Considerations
- **UI Integration:** The owner portal will require a new interface to manage these granular pricing tiers.
- **Price Calculation:** The booking engine's price calculation logic must be updated to resolve the correct price by checking for time-based tiers before falling back to the day-level default.
- **Overlap Validation:** Future API work should ensure that time-based pricing rules for the same day do not have overlapping time ranges.

## 6. Rollback Considerations
- To rollback, the new `studio_availability_pricing_rules` table and the `currency` columns in existing tables can be dropped. Since no existing data was rewritten, the core availability system will revert to its previous day-level pricing state.
