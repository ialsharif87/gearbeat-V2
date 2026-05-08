# GEARBEAT PATCH 09 — Auth pages inventory and password fields audit

## Objective
Map all password inputs across the site and list targets for the upcoming reusable `PasswordInput` toggle component. This audit ensures a consistent security and UX implementation across all authentication entry points.

## Current Project Status
- **Warning Baseline**: 508 warnings, 0 errors.
- **Build Status**: Stable (`npm run build` passing).

## Files Inspected
The following files were audited for `type="password"` inputs and existing visibility toggle logic:
- `app/login/page.tsx`
- `app/signup/SignupClient.tsx`
- `app/portal/login/page.tsx`
- `app/update-password/page.tsx`
- `app/staff-access/page.tsx`
- `app/portal/update-password/page.tsx`
- `app/portal/first-login/page.tsx`
- `components/login-form.tsx`
- `components/signup-form.tsx`

---

## Audit Findings

### 1. Standard Password Input Targets
These files currently use basic HTML `<input type="password">` and lack a visibility toggle. These are priority targets for the new component:
- **`components/login-form.tsx`**: Main login form partial.
- **`components/signup-form.tsx`**: Main signup form partial.
- **`app/staff-access/page.tsx`**: Staff portal access code entry.
- **`app/portal/update-password/page.tsx`**: Provider password update (New/Confirm).
- **`app/portal/first-login/page.tsx`**: Provider onboarding password setup (New/Confirm).

### 2. Inline Toggle Targets
These files have already implemented custom, inline toggle logic. They should be refactored to use the unified component to eliminate code duplication:
- **`app/login/page.tsx`**: Main customer login.
- **`app/portal/login/page.tsx`**: Studio/Vendor portal login.
- **`app/signup/SignupClient.tsx`**: Customer/Owner signup flow.
- **`app/update-password/page.tsx`**: Public password recovery flow.

---

## Risks and Considerations
- **RTL Icon Alignment**: The toggle icon position must correctly switch from right-to-left for Arabic (`ar`) vs English (`en`) support.
- **Validation Consistency**: The new component must transparently forward props like `required`, `minLength`, and `autoComplete`.
- **Form Behavior**: Replacing inputs must not break existing `onSubmit` handlers or state management.
- **Visual Identity**: The component must strictly adhere to GearBeat's premium dark UI design (border colors, focus states, and SVG styles).
- **Logic Duplication**: Success depends on removing the redundant inline state logic and SVGs from the unified pages.

---

## Implementation Roadmap
- **Patch 10**: Create reusable `PasswordInput` component in `components/ui/`.
- **Patch 11**: Pilot implementation on the main customer login page (`app/login/page.tsx`).
- **Patch 12+**: Step-by-step migration of remaining pages identified in this audit.

> [!NOTE]
> No code changes were made in Patch 09. This patch is for audit and documentation purposes only. The `PasswordInput` implementation is out of scope and deferred to Patch 10.
