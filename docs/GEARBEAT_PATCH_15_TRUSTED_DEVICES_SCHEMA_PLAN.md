# Patch 15 — Trusted devices schema plan only

## Objective
Plan the future trusted devices database schema and security model. This patch provides the architectural blueprint; no implementation is included in this patch.

## Current State
- **Files**: `lib/device-trust.ts` currently handles the trust logic.
- **Mechanism**: The current approach is purely cookie-based (no database persistence).
- **Storage**: The cookie stores a plaintext `userId:expiry` string.
- **Schema**: No `trusted_devices` table exists in the database.
- **Usage**:
    - `app/login/page.tsx` uses `isDeviceTrusted` to bypass OTP for known devices.
    - `app/portal/login/page.tsx` uses the same logic for provider portals.
- **Limitations**: The current approach does not support server-side device tracking, dashboard revocation by the user, or cryptographic token validation.

## Proposed Table: `public.trusted_devices`
This table will store persistent records of devices that have successfully passed the multi-factor (OTP) verification.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the trust record. |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Owner of the trusted device. |
| `device_token_hash` | `text` | `NOT NULL`, `UNIQUE` | SHA-256 hash of the random token stored in the user's cookie. |
| `device_name` | `text` | | Human-readable name (e.g., "Chrome on Windows"). |
| `browser` | `text` | | Browser name extracted from User-Agent. |
| `os` | `text` | | OS name extracted from User-Agent. |
| `last_ip` | `text` | | Last known IP address used by this device. |
| `created_at` | `timestamptz` | `DEFAULT now()` | When the device was first trusted. |
| `last_used_at` | `timestamptz` | | Timestamp of the last successful trusted login. |
| `expires_at` | `timestamptz` | `NOT NULL` | Expiration date (typically 30 days from creation). |

## Proposed Indexes
- `idx_trusted_devices_user_id`: For fast lookup of all devices belonging to a user (Dashboard UI).
- `idx_trusted_devices_token_hash`: For fast verification of cookies during the login flow.
- `idx_trusted_devices_expires_at`: For periodic cleanup of expired trust records.

## Proposed Security Model
- **Cookie Content**: Store only a cryptographically secure random token (64+ characters) in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
- **Database Storage**: Store only the SHA-256 hash of the token. The raw token is never stored on the server.
- **Verification**: To validate a device, the server hashes the cookie token and matches it against the `device_token_hash` in the database.
- **Persistence**: Trusted devices expire after 30 days of inactivity or absolute age (to be decided in implementation).
- **Activity Tracking**: `last_used_at` is updated automatically upon every successful trusted login.
- **Revocation**: Users can delete records from this table via their dashboard, which immediately invalidates the cookie for future sessions.

## Proposed RLS (Row Level Security)
- **Enable RLS**: Enabled on the `trusted_devices` table.
- **Select Policy**: Users can only view records where `auth.uid() = user_id`.
- **Delete Policy**: Users can only delete records where `auth.uid() = user_id`.
- **Insert/Update**: Restricted to server-side logic (service role) or secure RPCs/Server Actions that are triggered only after a successful OTP verification.

## Future Implementation Plan
- **Patch 16 or later**: Create and execute the SQL migration to initialize the table and RLS.
- **Later Patch**: Refactor `lib/device-trust.ts` to implement SHA-256 hashing and database verification logic.
- **Later Patch**: Implement a "Trusted Devices" management section in the user/provider dashboards.
- **Later Patch**: Integrate the "Trust this device" checkbox and logic into the OTP verification success path.

## Risks
- **Cookie Theft**: If a physical device or browser is compromised, the `httpOnly` cookie can still be used until revoked or expired.
- **User-Agent Spoofing**: Browser and OS info are derived from the User-Agent, which can be manipulated.
- **IP Privacy**: Storing IP addresses must comply with regional privacy regulations (GDPR/NDMO).
- **Revocation UX**: Users need a clear way to identify which device to revoke (naming is important).

## Explicit Out of Scope
- **No SQL Migration**: No database changes are included in this patch.
- **No Code Changes**: `app/` and `lib/` files remain untouched.
- **No Behavioral Changes**: The current cookie-based logic remains operational until future patches.
- **No UI Changes**: No management screens or checkboxes are added yet.
