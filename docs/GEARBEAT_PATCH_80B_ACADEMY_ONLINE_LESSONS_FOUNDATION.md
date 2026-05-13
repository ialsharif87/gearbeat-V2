# GEARBEAT PATCH 80B — ACADEMY / ONLINE LESSONS FOUNDATION

## 1. Overview
This patch establishes the foundation for the **Academy** vertical within GearBeat V2. Academy is defined as an independent commercial vertical focused on paid learning experiences, skill development, and professional mentorship. This is a **documentation-only** foundation to prepare for future implementation.

## 2. Strategic Positioning

### 2.1 Academy vs. Services
| Feature | Academy (Learning) | Services (Utility) |
| --- | --- | --- |
| **Goal** | Knowledge acquisition & skill growth. | Output delivery & professional execution. |
| **Outcome** | Student learns a skill (e.g., Mixing). | Task is completed for user (e.g., Mixed song). |
| **Interaction** | Instructional, interactive, mentor-led. | Transactional, asset-based, provider-led. |
| **Relationship** | Mentor - Student. | Provider - Client. |

### 2.2 Lesson Categories
- **Music Lessons**: Instrumental (Piano, Guitar, Drums), Theory, Composition.
- **Voice Lessons**: Vocal technique, Performance, Speech, Voiceover training.
- **Audio Production Lessons**: DAW mastery (Ableton, Pro Tools, Logic), Mixing, Mastering.
- **Podcast & Audio Skills**: Hosting, Sound design for media, Field recording.
- **School & Student Lessons**: Curriculum-aligned support for music students.
- **Creative Career Lessons**: Business of music, Marketing for artists, Sync licensing.

---

## 3. Operations & Delivery

### 3.1 Lesson Formats
- **1:1 Online Lessons**: Private session via video link.
- **1:1 In-Person Lessons**: Private session at a GearBeat Certified Studio or approved location.
- **Group Online Classes**: Cohort-based learning with multiple students.
- **Group In-Person Classes**: Workshops or masterclasses at physical locations.
- **School/Private Cohorts**: Dedicated sessions for specific institutions or private groups.

### 3.2 Lesson Durations
- **1 Hour**: Standard focus session.
- **2 Hours**: Deep dive or practical workshop.
- **3 Hours**: Intensive masterclass.
- **Custom**: Multi-session bootcamps or flexible blocks (deferred).

### 3.3 Delivery Model
- **Phase 1 (Manual)**: Instructors provide manual video links (Zoom, Google Meet, Microsoft Teams) via GearBeat booking messages.
- **Phase 2 (Integrated)**: Native GearBeat video room or direct API integrations with meeting providers (deferred).

---

## 4. Requirements & Safeguarding

### 4.1 Instructor Profile Requirements
- **Verification**: Identity verification (KYC) required.
- **Credentials**: Proven professional background or educational certifications.
- **Equipment**: Minimum technical standards for online audio delivery.
- **Conduct**: Adherence to the GearBeat Mentor Code of Conduct.

### 4.2 Student Profile Requirements
- **Hardware**: Compatible device and reliable internet connection.
- **Materials**: Necessary instruments or software for the specific lesson.

### 4.3 Minors & Safeguarding
- **Parental Consent**: Mandatory for students under 18.
- **Parental Presence**: Recommended for students under 13 during online sessions.
- **Recordings**: No unauthorized recording of lessons involving minors.
- **Background Checks**: Required for instructors offering "School/Student" category lessons.

---

## 5. User Journeys

### 5.1 Academy Partner / Provider Journey
1.  **Application**: Instructor applies via the Partner Portal.
2.  **Vetting**: GearBeat Admin reviews credentials and audio quality.
3.  **Onboarding**: Instructor completes the Academy orientation.
4.  **Listing**: Instructor creates lesson types, sets availability, and pricing.
5.  **Delivery**: Conducts lesson and marks as completed in the portal.
6.  **Payout**: Receives earnings via the settlement system.

### 5.2 Customer / Student Journey
1.  **Discovery**: Browses Academy by category, instrument, or skill.
2.  **Selection**: Reviews instructor profile, ratings, and availability.
3.  **Booking**: Selects slot and pays (manual bank transfer in pilot).
4.  **Preparation**: Receives meeting link and prep instructions.
5.  **Lesson**: Attends the session.
6.  **Review**: Leaves feedback and rate the instructor.

---

## 6. Technical Boundaries & Readiness

### 6.1 What is READY vs. DEFERRED
- **READY**: Conceptual taxonomy, Journey maps, Category definitions.
- **DEFERRED**: 
  - Academy UI (Browse/Search pages).
  - Lesson booking engine.
  - Instructor database tables (`academy_mentors`, `academy_lessons`).
  - Live Tap payment integration.
  - Video meeting API integrations.

### 6.2 AI Readiness
- **Rule 1**: AI must only recommend instructors from **internal GearBeat data** (Verified Mentors).
- **Rule 2**: AI must **not invent** instructor availability, pricing, or credentials.
- **Rule 3**: External pedagogical advice or general career tips must be clearly labeled as "AI Insights."

### 6.3 Mobile Readiness
- **Mobile-First**: Lesson booking and instructor messaging must be fully responsive.
- **App**: Future native app will focus on **Lesson Reminders** and **Mobile Join** (for online sessions).

---

## 7. Future Dependencies
- **Database**: Tables for `academy_mentors`, `academy_lessons`, `academy_enrollments`, and `academy_reviews`.
- **Legal**: New "Academy User Agreement" and "Student Safeguarding Policy."
- **API**: Integration with Zoom/Google Meet for automated link generation.

---

## 8. QA Readiness & Decisions
- **Decision**: **Academy** must be included in the **Full Journey QA** phase *only after* the following foundational patches are complete:
  - **80B**: (Current) Academy Foundation.
  - **81A**: Marketplace & Fulfillment Hardening.
  - **82A**: Payment Security Gate (Live Payments).
  - **83A**: Conflict Resolution & Support Workflows.
- **QA Scenarios Required**:
  - Minor student booking flow (Consent verification).
  - Instructor availability collision testing.
  - Video link delivery verification.
  - Lesson completion and payout trigger.

---

## 9. No-Risk Scope Confirmation
- This is a documentation-only patch.
- No backend code, database schema, or live Academy logic was modified.
- No live payment or booking implementation was added.
- No changes were made to existing Marketplace or Studio Booking systems.
