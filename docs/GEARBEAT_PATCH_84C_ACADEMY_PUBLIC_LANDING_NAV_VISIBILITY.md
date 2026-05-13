# Patch 84C — Academy Public Landing Page + Navigation Visibility

## 1. Task Objective
Create a public pre-live Academy landing page and integrate it into the GearBeat navigation and footer. This patch establishes the "Academy" as a core commercial vertical while maintaining strict pre-live boundaries.

## 2. Academy Page Implementation (`app/academy/page.tsx`)
- **Design**: Premium GearBeat dark/gold identity.
- **Bilingual**: Full Arabic/English support.
- **Content**:
  - **Vertical Positioning**: Online and in-person creative learning (Music, Voice, Audio Production, Podcast).
  - **Lesson Types**: 1:1 lessons, group classes, school/private cohorts, online, and in-person sessions.
  - **Durations**: Standard 1, 2, and 3-hour booking options.
  - **Trust & Safety**: Instructor vetting standards and a dedicated Parent/Guardian note for minor safeguarding.
  - **Pre-live Boundary**: Explicit messaging that Academy is in the onboarding phase, with no live payments or bookings active.
  - **CTAs**: "Join Academy Waitlist", "Become an Academy Instructor", and "Request Instructor Info" (linking to existing safe paths).

## 3. Navigation & Footer Integration
- **Header**: Added "Academy" to the main `navLinks` in `components/site-header.tsx`.
- **Footer**: Added "Academy" to the Platform column in `components/footer.tsx`.

## 4. Verification Plan

### Automated Tests
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`

### Manual Verification
- Verify `/academy` route renders correctly in both languages.
- Verify "Academy" link in header and mobile drawer.
- Verify "Academy" link in footer.

## 5. No-Risk Scope Confirmation
- This is a UI and documentation-only patch.
- No database changes, instructor records, or live booking logic.
- No payment gateway or video API (Zoom/Meet) integration.
- No AI or Academy-specific backend actions.
