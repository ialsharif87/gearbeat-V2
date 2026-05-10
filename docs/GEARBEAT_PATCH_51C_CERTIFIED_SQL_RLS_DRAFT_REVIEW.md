# GEARBEAT PATCH 51C — CERTIFIED SQL/RLS DRAFT REVIEW

## 1. Overview
This document provides a comprehensive draft review of the SQL schema and Row Level Security (RLS) policies for the **GearBeat Certified** live implementation. This is a technical blueprint intended for review before any actual migrations are executed.

---

## 2. Proposed Database Schema (Draft)

### 2.1 Enums
- `certification_status`: `('pending', 'approved', 'rejected', 'suspended', 'expired')`
- `studio_tier`: `('verified', 'trusted', 'premium', 'elite', 'flagship')`

### 2.2 Tables & Columns

#### `studio_tiers`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` |
| `name` | `studio_tier` | `UNIQUE, NOT NULL` |
| `display_name_en` | `text` | `NOT NULL` |
| `display_name_ar` | `text` | `NOT NULL` |
| `description_en` | `text` | `NULL` |
| `description_ar` | `text` | `NULL` |
| `rank` | `integer` | `NOT NULL, DEFAULT 0` |
| `color_hex` | `text` | `NOT NULL, DEFAULT '#cfa86e'` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

#### `certified_studios`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` |
| `studio_id` | `uuid` | `UNIQUE, NOT NULL, REFERENCES studios(id) ON DELETE CASCADE` |
| `tier_id` | `uuid` | `NOT NULL, REFERENCES studio_tiers(id)` |
| `status` | `certification_status` | `NOT NULL, DEFAULT 'pending'` |
| `trust_score` | `integer` | `CHECK (trust_score >= 0 AND trust_score <= 100), DEFAULT 0` |
| `hardware_verified_at` | `timestamptz` | `NULL` |
| `acoustics_verified_at` | `timestamptz` | `NULL` |
| `business_verified_at` | `timestamptz` | `NULL` |
| `expires_at` | `timestamptz` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |
| `updated_at` | `timestamptz` | `DEFAULT now()` |

#### `qr_verification_links`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` |
| `certified_studio_id` | `uuid` | `UNIQUE, NOT NULL, REFERENCES certified_studios(id) ON DELETE CASCADE` |
| `verification_token` | `uuid` | `UNIQUE, NOT NULL, DEFAULT gen_random_uuid()` |
| `scan_count` | `integer` | `DEFAULT 0` |
| `last_scanned_at` | `timestamptz` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

#### `studio_certification_history`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` |
| `certified_studio_id` | `uuid` | `NOT NULL, REFERENCES certified_studios(id) ON DELETE CASCADE` |
| `previous_status` | `certification_status` | `NULL` |
| `new_status` | `certification_status` | `NOT NULL` |
| `previous_tier_id` | `uuid` | `NULL` |
| `new_tier_id` | `uuid` | `NOT NULL` |
| `changed_by` | `uuid` | `NOT NULL, REFERENCES profiles(id)` |
| `reason_note` | `text` | `NOT NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

---

## 3. RLS Policy Plan (Draft)

### 3.1 `certified_studios`
- **Enable RLS**: Yes.
- **Public Read**: Allow `SELECT` for records where `status = 'approved'` and (`expires_at IS NULL` OR `expires_at > now()`).
- **Owner Read**: Allow `SELECT` for studio owners where `studio_id` matches their own studio.
- **Admin Full**: Allow `ALL` for users with `admin` role.

### 3.2 `studio_tiers`
- **Enable RLS**: Yes.
- **Public Read**: Allow `SELECT` for all users.
- **Admin Full**: Allow `ALL` for users with `admin` role.

### 3.3 `qr_verification_links`
- **Enable RLS**: Yes.
- **Owner Read**: Allow `SELECT` for the specific studio owner.
- **Admin Full**: Allow `ALL` for users with `admin` role.
- **Public Verification**: No direct SQL access. Verification logic must go through a secure Server Action or RPC that validates the `verification_token`.

### 3.4 `studio_certification_history`
- **Enable RLS**: Yes.
- **Admin Read**: Allow `SELECT` for admins.
- **Owner Read**: Allow `SELECT` for the studio owner (audit transparency).
- **Admin Insert**: Allow `INSERT` for admins only.

---

## 4. Security & Business Rules

### 4.1 Data Exposure Limits
- Public verification should only expose: `studio_name`, `tier`, `trust_score`, `verified_dates`, and `status`.
- Internal notes, `verification_token`, and historical `changed_by` IDs must remain hidden from the public.

### 4.2 Admin Mutation Safety
- All status changes must trigger an entry in `studio_certification_history`.
- A database trigger should update `updated_at` on `certified_studios`.
- Downgrading a tier should notify the studio owner via the notification system (future patch).

### 4.3 QR Verification Logic
- QR codes will link to `/gearbeat-certified/[slug]?token=[verification_token]`.
- The frontend will call a secure RPC: `verify_studio_qr(token uuid)`.
- The RPC will increment `scan_count` and return certification details only if valid.

---

## 5. Migration & Safety Checklist

- [ ] Ensure `gen_random_uuid()` extension is available.
- [ ] Verify foreign key constraints against existing `studios` and `profiles` tables.
- [ ] Check index performance for `verification_token` and `studio_id`.
- [ ] Rollback script must drop tables and enums in reverse order of creation.
- [ ] Test RLS with `anon`, `authenticated` (owner), and `service_role` (admin simulation).

---

## 6. Recommendation for Next Patch Sequence

1. **Patch 51D: Certified SQL Migration Execution** (Actually running the reviewed SQL).
2. **Patch 51E: Certified Admin Server Actions** (Binding mutations to the UI).
3. **Patch 51F: Dynamic Public Verification** (Connecting the public page to live data).
4. **Patch 51G: QR Logic & Audit Event Logging**.

---

## 7. Acceptance Checklist
- [x] Schema follows Patch 51A planning.
- [x] RLS strategy protects sensitive tokens and history.
- [x] Public read access is strictly limited to approved/active records.
- [x] Mutation safety (history logging) is documented.
- [x] No SQL/RLS/Database changes were executed in this patch.
