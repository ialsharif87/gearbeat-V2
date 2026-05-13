# Patch 84B — Targeted Fixes Pack 1

## 1. Task Objective
Implement only the targeted S2/S3 fixes documented in [GEARBEAT_PATCH_84A_FULL_JOURNEY_QA_MASTER_RUN.md](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/docs/GEARBEAT_PATCH_84A_FULL_JOURNEY_QA_MASTER_RUN.md).

## 2. Issues to Fix

### QA-01 Academy S3
- **Status**: DEFERRED
- **Observation**: Route `/academy` not yet implemented.
- **Action**: No implementation required. Documented as expected/deferred behavior for the current pilot phase.

### QA-02 Tickets S2
- **Area**: `app/tickets/page.tsx`
- **Fix**: Change "View Event" CTA to "Request Access" (or equivalent intent wording).
- **Goal**: Align with pilot/readiness status and avoid premature "checkout" terminology.

### QA-03 Services S2
- **Area**: `app/services/page.tsx`
- **Fix**: Implement a fallback icon helper to ensure all services have a professional icon even if missing in the database.
- **Icons**:
  - `mixing` -> 🎚️
  - `mastering` -> 🎧
  - `production` -> 🎹
  - `voiceover` -> 🎙️
  - `podcasting` -> 📻
  - `rehearsal` -> 🎸

### QA-04 Legal S3
- **Area**: `components/footer.tsx`
- **Fix**: Add missing "Marketplace Policy" link and ensure no typos.
- **Path**: `/legal/marketplace-policy`

### QA-05 Mobile S2
- **Area**: `app/partner/page.tsx`
- **Fix**: Fix horizontal overflow on iPhone SE / small viewports.
- **Action**: Reduce `.hero-title` font-size on small screens and ensure `.container` max-width/padding is safe.

## 3. Implementation Steps

1. **Modify `components/footer.tsx`**:
   - Add `<Link href="/legal/marketplace-policy">{lang === "en" ? "Marketplace Policy" : "سياسة السوق"}</Link>` to the Legal column.
2. **Modify `app/tickets/page.tsx`**:
   - Update CTA text from "View Event" to "Request Access" (with Arabic equivalent "طلب دخول").
3. **Modify `app/services/page.tsx`**:
   - Add a `getServiceIcon` helper to provide fallback emojis for common service slugs.
4. **Modify `app/partner/page.tsx`**:
   - Add a media query for `@media (max-width: 400px)` to reduce `.hero-title` font-size and adjust `.hero-actions` layout.

## 4. Verification Plan

### Automated Tests
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`

### Manual Verification
- Verify footer link exists and works.
- Verify Tickets CTA wording.
- Verify Services icons have fallbacks.
- Verify Partner page hero on small viewport (simulated via DevTools).
