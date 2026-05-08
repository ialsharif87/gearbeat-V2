# GEARBEAT PATCH 38 — AVAILABILITY EXCEPTION DATE RANGE SCHEMA

## 1. Overview
This patch provides the database schema foundation for advanced studio availability exceptions. It hardens the existing `studio_availability_exceptions` table by adding classification types, activation status, and consistent naming for time ranges, facilitating future UI and booking logic enhancements.

## 2. Changes Applied

### Table: `public.studio_availability_exceptions` [MODIFY]
The following columns were added to support enhanced exception management:
- **`exception_type`** (TEXT): Allows classifying exceptions (e.g., 'closed', 'custom_hours', 'holiday'). Defaults to 'closed'.
- **`is_active`** (BOOLEAN): Enables soft-toggling of exceptions without deletion. Defaults to `TRUE`.
- **`start_time`** (TIME): Added for semantic consistency with date ranges (alias/extension for `open_time`).
- **`end_time`** (TIME): Added for semantic consistency with date ranges (alias/extension for `close_time`).

### Indexes
- **`idx_studio_availability_exceptions_active`**: Optimized lookup for active exceptions.
- **`idx_studio_availability_exceptions_range`**: Optimized lookup for date-range overlaps and studio-specific queries.
- **`idx_studio_availability_exceptions_type`**: Enables efficient filtering by exception type.

### RLS Policies
- Existing RLS policies from `patch_72` remain in effect, granting owners full control over their studio's exceptions based on the `studio_id` link to the `studios` table.

## 3. Backward Compatibility
- **No Data Rewrite:** No existing rows are modified or rewritten during the migration.
- **Preserved Columns:** `open_time`, `close_time`, and `is_closed` remain untouched and fully functional for existing application logic.
- **Foundation Fields:** `start_time` and `end_time` are added as nullable schema foundation fields for future use by new UI/API versions, ensuring no impact on current production data.
- **API Support:** Current API routes using `open_time`/`close_time` are unaffected.

## 4. Future Considerations
- **UI Integration:** The owner portal `StudioAvailabilityManager` needs to be updated to support the new `exception_type` and `is_active` fields.
- **Conflict Logic:** Booking conflict detection should be updated to account for `is_active = FALSE` and specific `exception_type` behaviors.
- **Overlap Prevention:** Consider adding a database constraint or trigger to prevent overlapping exception ranges for the same studio.

## 5. Rollback Considerations
- To rollback, the newly added columns and indexes can be dropped without affecting the core availability data, as `start_date`, `end_date`, and the original time columns are preserved.
