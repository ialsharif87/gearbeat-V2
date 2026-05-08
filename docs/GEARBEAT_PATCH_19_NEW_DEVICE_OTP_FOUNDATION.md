# Patch 19 — New device OTP foundation

## Objective
Establish the server-side foundation for enforcing multi-factor (OTP) verification on unrecognized devices. This patch introduces the necessary utility logic without enabling global enforcement to prevent production breakage.

## Current Resumption Gap
As of Patch 18, the system can securely register and verify trusted devices. However, the current login flow automatically redirects users to their dashboards if a session exists, even if the device is not trusted. This allows a session-theft attacker to bypass MFA if they possess a valid session cookie but no trusted device token.

## Proposed Future Flow (Patch 20+)
1.  **Server-Side Guard**: `lib/auth-guards.ts` will use `getDeviceTrustStatusForUser` to identify untrusted sessions.
2.  **Conditional Redirect**: Logged-in users on untrusted devices will be redirected to `/login?mfa=1`.
3.  **Client-Side Transition**: The login page will detect `mfa=1` or the untrusted state and automatically switch to OTP mode.

## Redirect Loop Risks
- **Caution**: We must ensure that `/login` does not redirect to `/dashboard` while `/dashboard` redirects back to `/login` due to lack of trust.
- **Solution**: The login page session check (`useEffect`) must explicitly verify `isDeviceTrusted` before performing any auto-redirects.

## Changes Introduced
- **Helper**: `getDeviceTrustStatusForUser(userId)` in `lib/auth-guards.ts`.
- **Types**: `DeviceTrustCheckResult` added to support structured trust reporting.

## Rollout Plan
- **Patch 19**: Utility foundation (Completed).
- **Patch 20**: Update Login/Portal Login `useEffect` to honor device trust.
- **Patch 21**: Enable server-side enforcement in `lib/auth-guards.ts`.
- **Patch 22**: Audit and cleanup of any remaining bypasses.
