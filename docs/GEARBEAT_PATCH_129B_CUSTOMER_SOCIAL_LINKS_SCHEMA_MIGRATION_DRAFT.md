# Patch 129B — Customer Social Links Schema Migration Draft

This document outlines the schema draft migration created for customer social links in GearBeat V2.

## 1. Migration File Added

- **File Path**: [20260522000001_customer_social_links.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260522000001_customer_social_links.sql)
- **Objective**: Establishes the relational schema, indices, check constraints, and RLS policies for `public.customer_social_links`.

## 2. Table Purpose & Structure

The `public.customer_social_links` table is designed to support optional, customer-owned presentation/contact profiles separately from the primary identity/verification profile fields stored in `public.profiles`.

### Columns Summary

| Column Name | Data Type | Default / Nullability | Description / Relationships |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, `gen_random_uuid()` | Unique link record identifier. |
| `user_id` | UUID | NOT NULL, REFERENCES `auth.users(id) ON DELETE CASCADE` | References the user/customer account ownership. |
| `platform` | TEXT | NOT NULL | Social network type (e.g. `'instagram'`, `'tiktok'`, etc.). |
| `url` | TEXT | NOT NULL | Full profile URL starting with standard protocol. |
| `handle` | TEXT | NULL | Optional username handle associated with the link. |
| `visibility` | TEXT | NOT NULL, `'public'` | Controls whether the link is visible on public cards. |
| `moderation_status` | TEXT | NOT NULL, `'approved'` | Readiness/moderation field (`'pending'`, `'approved'`, `'rejected'`). |
| `created_at` | TIMESTAMPTZ | NOT NULL, `now()` | Timestamp of record creation. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, `now()` | Timestamp of last record update. |

## 3. Constraints Summary

- **Single Link per Platform**: A unique constraint `customer_social_links_user_platform_key` on `(user_id, platform)` prevents customers from adding duplicate social links for the same platform.
- **Allowed Platforms Check**: The check constraint `customer_social_links_platform_check` enforces that `platform` must be one of:
  - `instagram`
  - `tiktok`
  - `x`
  - `youtube`
  - `linkedin`
  - `facebook`
  - `website`
- **Safe URL Checking**:
  - `customer_social_links_url_length`: Enforces URL length `<= 300` characters.
  - `customer_social_links_url_format`: Enforces that the URL must begin with either `https://` or `http://`.

## 4. Row-Level Security (RLS) Summary

RLS is enabled on the table. Five defensive policies are declared (wrapped in PostgreSQL `IF NOT EXISTS` check queries to prevent configuration conflicts on migration reruns):

1. **Customers can select own social links**: Allows authenticated users to view only their own records (`auth.uid() = user_id`).
2. **Customers can insert own social links**: Allows authenticated users to insert records mapping only to their own accounts (`auth.uid() = user_id`).
3. **Customers can update own social links**: Allows authenticated users to edit records mapping only to their own accounts (`auth.uid() = user_id`).
4. **Customers can delete own social links**: Allows authenticated users to remove their own social records (`auth.uid() = user_id`).
5. **Admins can manage all customer social links**: Grants full SELECT/INSERT/UPDATE/DELETE/ALL privileges to authenticated users whose `auth_user_id` is an active admin in `public.admin_users`.

## 5. Performance Index Optimization

- **User Index**: Index `idx_customer_social_links_user_id` on `user_id` optimizes lookups of all links for a single customer.
- **Platform Index**: Index `idx_customer_social_links_platform` on `platform` optimizes global social queries or analytics.
- **Unique Constraint Index**: The unique constraint automatically registers an optimized unique index on `(user_id, platform)` in PostgreSQL.

## 6. What Was Intentionally Not Done

- **No updated_at Triggers**: Deferred because the codebase has no database-level timestamp updating triggers or helpers on custom tables. Instead, updates are handled at the application/API level.
- **No Complex Text/Regex Check Constraints**: Kept constraints simple and lightweight (length + `LIKE` prefix check) to avoid engine compatibility issues and follow existing project SQL conventions. Validation rules (hostnames, characters) are intended to live inside the API route validation layer.

## 7. Safety & Execution Confirmation

- **No SQL Execution**: No database commands or writes were executed.
- **No Supabase CLI/MCP**: No Supabase CLI commands or MCP tools were invoked.
- **Local-Only Draft**: The migration file resides purely as a local schema draft under `supabase/migrations/` ready to be applied during the next database migration phase.

## 8. Next Recommended Patch

- **Patch 129C — Customer Social Links API Integration**: Implement typescript validators and API endpoints at `app/api/customer/social-links` to read and upsert records using Supabase server actions or server-side clients.
