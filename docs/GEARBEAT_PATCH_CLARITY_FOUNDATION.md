# GEARBEAT PATCH CLARITY FOUNDATION

## Purpose
This patch integrates Microsoft Clarity tracking into the GearBeat platform. Microsoft Clarity provides heatmaps, session recordings, and insights into user behavior, complementing the traffic analytics provided by Google Analytics 4.

## Environment Variables
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: The unique Project ID provided by the Microsoft Clarity dashboard.

## Implementation Details
- The Clarity tracking script is managed within the unified `components/analytics.tsx` component.
- The script is loaded conditionally only if the `NEXT_PUBLIC_CLARITY_PROJECT_ID` environment variable is defined.
- Uses `next/script` with the `afterInteractive` strategy to ensure minimal impact on page load performance.
- Extends the existing analytics foundation while maintaining isolation from core business logic.

## Validation Steps
1. **Build Test:** Run `npm run build` to confirm the project compiles without errors.
2. **Conditional Loading Test:**
   - Verify no Clarity script is injected when the Project ID is missing from the environment.
   - Verify the Clarity script is correctly injected (pointing to the specific Project ID) when the environment variable is active.

## No-Risk Scope
- No changes to Supabase schema, RLS, or database migrations.
- No changes to authentication, payment processing, or server actions.
- No changes to existing UI/UX or brand identity.
- No third-party NPM packages added.
