# Patch 86A — Academy Legal, Live Lesson & Minor Safety Positioning

## 1. Task Objective
Establish the public-facing legal, safety, and regulatory positioning for GearBeat Academy. This patch clarifies the live-only learning model, instructor verification standards, and minor safety requirements while explicitly stating the lack of official government accreditation to manage regulatory expectations.

## 2. Academy Policy Implementation (`app/legal/academy-policy/page.tsx`)
- **Academy Positioning**: Defined as a marketplace for live, interactive music and audio learning.
- **Live Lesson Model**: Clarified that all sessions are live and synchronous; no pre-recorded courses or automated learning paths are offered in the current MVP.
- **Instructor Verification**: Defined "GearBeat-verified instructors" as professionals vetted for experience and credentials, distinguishing this from government endorsement.
- **Regulatory Transparency**: Explicitly stated that GearBeat Academy is a private commercial marketplace and does not claim accreditation from the Ministry of Culture, Music Commission, GEA, or NeLC.
- **Certification Transparency**: Clarified that no accredited certificates or government-recognized qualifications are currently offered.
- **Minor Safety**: Established student age requirements (18+) for independent accounts and mandatory parent/guardian consent/supervision for minors.
- **Conduct & Rules**: Defined professional conduct for video calls, prohibited unauthorized session recording, and established rescheduling/cancellation principles.

## 3. UI & Navigation Updates
- **Academy Landing Page**: Updated `app/academy/page.tsx` with explicit trust, safety, and regulatory positioning sections.
- **Legal Hub**: Integrated the Academy Policy into `app/legal/page.tsx`.
- **Global Footer**: Added a direct link to the Academy Policy in `components/footer.tsx`.

## 4. Verification Plan

### Automated Tests
- `npm.cmd run build` (Ensures no breaks in static generation or bundling).

### Manual Verification
- Verify `/academy` correctly displays the updated safety sections.
- Verify `/legal/academy-policy` renders correctly in both English and Arabic.
- Verify the "Academy Policy" link exists in the Legal Hub and Footer.
- Verify no wording implies official government accreditation.

## 5. No-Risk Scope Confirmation
- This is a UI and legal-documentation-only patch.
- No backend logic, database schemas, or API integrations (Zoom/Meet) were added.
- No changes to payments, orders, or real-world instructor verification workflows.
- Maintained GearBeat's premium dark identity and bilingual support.
