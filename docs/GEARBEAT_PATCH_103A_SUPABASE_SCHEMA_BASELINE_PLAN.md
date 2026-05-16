# GearBeat Patch 103A — Supabase Schema Baseline Plan

## 1. Purpose
GearBeat requires a comprehensive **Schema Baseline** to establish a "Source of Truth" for the database architecture across all environments. 

As the project scales from early-stage development to a live pilot, the lack of a baseline creates risks such as environment drift (Production vs. Staging vs. Local), accidental data loss, and failed deployments due to missing dependencies (Functions, RPCs, or RLS policies). 

This baseline plan ensures that every database change is traceable, tested on staging first, and verified against the current production reality before execution.

## 2. Current Safety Status
Following the implementation of the **DB Reality Gate** (Patch 101B):
- **Manual Control**: The Supabase deployment workflow is now configured for manual dispatch.
- **No Automatic Mutations**: Automatic production database pushes from the `main` branch have been disabled to prevent "renegade" migrations from impacting live data.
- **Strict Adherence**: No new migrations are to be applied until the Schema Baseline is established and approved by the engineering leads.

## 3. Baseline Process (Staging-First)
The baseline will be established using a "Capture, Compare, and Consolidate" approach:

1. **Capture Current Reality**:
   - Export the complete schema from **Production** (Tables, Columns, Constraints, Indexes, Enums, and Views).
   - Export all **RLS Policies** and **Storage Bucket** configurations.
   - Export all **Stored Procedures (Functions/RPCs)** and Triggers.
   - Repeat the process for the **Staging** environment.

2. **Schema Audit & Comparison**:
   - Compare Production/Staging schemas against the `supabase/migrations/**` files and `docs/sql-drafts/**`.
   - Identify **Missing Objects**: Tables or RPCs referenced in code but missing from the repo migrations.
   - Identify **Policy Gaps**: RLS rules present in production but not documented in the codebase.
   - Identify **Drift**: Discrepancies in data types, constraints, or index definitions between environments.
   - Resolve **Duplicate Definitions**: Eliminate conflicting table definitions across SQL drafts.

3. **Consolidation**:
   - Decide which existing drafts and production states belong in the "Canonical Baseline Migration."
   - Create a single source of truth for the initial schema state.

## 4. Required Evidence Before Migration
Before any SQL execution on production, the following evidence must be registered in the patch documentation:
- **Environment Snapshots**: Validated production and staging schema snapshots.
- **Backup Confirmation**: Timestamped confirmation of a full production database backup.
- **Rollback Plan**: Verified SQL script to undo the proposed changes in case of failure.
- **Migration Order**: Documented sequence of scripts if multiple files are involved.
- **Staging Test Results**: Log showing successful execution and data integrity verification on the staging environment.
- **Approval Record**: Written sign-off from the technical lead.

## 5. Migration Safety Gates
The following rules are mandatory for all future database work:
- **No Local Pushes**: `supabase db push` from local developer machines to production or staging is strictly prohibited.
- **Staging Gate**: No migration shall be applied to Production before it has succeeded on Staging.
- **Business Logic Protection**: Any change to `bookings`, `orders`, or `payments` schemas requires a detailed impact assessment and a verified rollback plan.
- **Security Review**: All changes to `service_role` usage, RLS policies, or authentication hooks must undergo a security review to prevent data exposure.
- **Backup Before Destruction**: Any destructive operation (e.g., `DROP TABLE`, `ALTER COLUMN` with data loss) requires explicit written approval and a fresh backup.

## 6. Next Patch Recommendation
**Patch 103B — DB Usage Map from Code**
This recommended next step involves mapping existing application routes and features to their corresponding database tables and RPCs. This documentation-only task will provide the final visibility needed to ensure that the Schema Baseline correctly supports all active production features without changing a single line of code or database structure.
