# Patch 20 — OTP provider fallback documentation

## Objective
Document the OTP provider configuration, fallback mechanisms, and security rules for the GearBeat V2 authentication system. This ensures that the transition between development (mock) and production (live) delivery remains secure and available.

## Current Files Inspected
- `lib/otp/provider.ts`: Core generation and hashing logic.
- `lib/otp/mock-provider.ts`: Console logging fallback.
- `lib/otp/types.ts`: API and delivery interfaces.
- `lib/emails.ts`: Email delivery integration.
- `lib/sms.ts`: SMS delivery integration.

## Current OTP Flow Summary
1.  **Generation**: Secure numeric 6-digit code generation using Node.js `crypto`.
2.  **Hashing**: The raw code is immediately hashed using SHA-256 with an HMAC secret (`OTP_HASH_SECRET`). Only the hash is stored in the database.
3.  **Delivery**: Selection is based on the `OTP_PROVIDER` environment variable.
4.  **Fallback**: If no real provider is available or configured, the system defaults to the `mock` provider which logs the code to the server console.
5.  **Exposures**: In development, `MOCK_OTP_ENABLED` can return the raw code in the API response for testing convenience.

## Environment Variables
The following variables control the OTP behavior:
- `OTP_PROVIDER`: The primary delivery method (e.g., `mock`, `resend`, `twilio`).
- `OTP_HASH_SECRET`: The HMAC secret for code hashing. Must be explicitly set in production.
- `MOCK_OTP_ENABLED`: Boolean. If `true`, raw OTPs may appear in development responses.
- `RESEND_API_KEY`: Required if `OTP_PROVIDER` is set to `resend`.
- `UNIFONIC_APP_ID`: Required if SMS delivery is configured via Unifonic.

## Provider Behavior Matrix
| State | Behavior |
| :--- | :--- |
| **Real Provider Configured** | Code is sent via SMS/Email. No raw code in logs/response. |
| **No Provider Configured** | System warns and falls back to `mock` (logs to console). |
| **Mock Provider Enabled** | Raw OTP is returned in API response (Dev only). |
| **Mock Provider Disabled** | OTP is never returned to the client. |
| **Missing Hash Secret** | Production: Throws error. Dev: Falls back to local default. |

## Security Rules (Hard Constraints)
- **Production Guard**: `MOCK_OTP_ENABLED` must be set to `false` in production.
- **Data Privacy**: Raw OTP codes must **never** be logged to production logging systems (Sentry, Vercel Logs).
- **Client Security**: Raw OTP codes must **never** be included in production API responses.
- **Hash Comparison**: Verification must always compare HMAC hashes, never plaintext codes.
- **Time Limits**: OTP sessions must be limited to 10 minutes or less.
- **Service Role**: Database interactions for OTP sessions are restricted to server-side logic using the `adminClient`.

## Production Readiness Checklist
- [ ] `OTP_PROVIDER` is set to a live service (e.g., `resend`).
- [ ] `MOCK_OTP_ENABLED` is explicitly `false`.
- [ ] `OTP_HASH_SECRET` is set to a unique, high-entropy string.
- [ ] Provider credentials (API keys) are validated.
- [ ] Error logging is configured for delivery failures.
- [ ] Verified that no raw OTPs appear in network traces or server logs.

## Future Implementation Roadmap
- **Failover**: Implementation of primary/secondary provider fallback (e.g., fallback to Email if SMS fails).
- **Health Checks**: Automated monitoring of provider API status.
- **Rate Limiting**: Hardening of per-user/per-IP code request limits.

## Explicit Out of Scope
- No modifications to `app/` or `lib/` logic.
- No changes to database schema or migrations.
- No new provider integrations in this patch.
