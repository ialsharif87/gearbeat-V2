# Patch 96A — Admin Discovery Data Entry Requirements & Field Map

## 1. Executive Summary
This document establishes the **Admin Data Entry Map** for GearBeat V2, specifically focusing on the fields required to power future "Ask GearBeat" AI discovery and structured smart filtering. It defines the mapping between partner-supplied data and discovery-ready metadata.

---

## 2. Field Map Groups

### 2.1 Basic Identity & Vertical
- **Internal ID**: Unique record identifier.
- **Vertical Type**: Studio, Marketplace, Service, Ticket, Academy.
- **Slug/URL**: Permanent public link.

### 2.2 Discovery Metadata (The AI Core)
These fields are essential for mapping user intent to results.

| Group | Field Name | Description |
| --- | --- | --- |
| **Category** | `category_slug` | Standard taxonomy category (e.g., `recording-studio`). |
| **Tags** | `ai_tags` | JSONB array of intent-driven tags (e.g., `#podcast`, `#neve`). |
| **Skill Level** | `skill_level` | `beginner`, `intermediate`, `professional`, `elite`. |
| **Use Case** | `use_case` | Activity-based tagging (e.g., `mixing`, `vocal-recording`). |
| **City** | `location_city` | Primary city for discovery (e.g., `Riyadh`). |
| **Budget** | `price_tier` | `budget`, `standard`, `premium`, `elite`. |

### 2.3 Quality & Readiness Scoring
- **Admin Quality Score (0-10)**: Subjective admin rating of data fidelity.
- **Discovery Readiness Score (%)**: Automated percentage based on mandatory field completion.
- **Ask GearBeat Badge**: Boolean flag indicating if the record is safe for AI recommendations.

---

## 3. Required vs. Optional Fields

### 3.1 Publish-Ready (Minimum for Site Visibility)
- Title (AR/EN)
- Base Price
- 1 Primary Image
- Category

### 3.2 Ask GearBeat-Ready (Minimum for AI Recommendation)
- All Publish-Ready fields.
- Min 5 `ai_tags`.
- Use Case mapping.
- Verified Availability status.
- Admin Quality Score >= 7.

---

## 4. Admin Validation Rules
The Admin UI must enforce the following rules to prevent discovery pollution:

1. **Tag Hygiene**: No duplicate tags or generic terms (e.g., "good," "nice").
2. **Pricing Clarity**: Prices must be absolute numbers, not "Starting at" without a base.
3. **Media Verification**: Images must be manually approved as high-quality and relevant.
4. **Academy Safety**: Instructor Suitability tags (e.g., "Child-Safe," "Pro-Only") are mandatory for Academy lessons.

---

## 5. Future Implementation Plan (UI Requirements)
- **Tag Selector**: Multi-select interface with autocomplete based on unified taxonomy.
- **Readiness Panel**: Real-time checklist of missing fields for Discovery/AI readiness.
- **Quality Score Panel**: Slider for admin to rate the partner's overall data quality.

---

## 6. Implementation Boundary
- **Planning Only**: This document is for architectural readiness.
- **No Database Changes**: No migrations or schema updates are authorized in this patch.
- **No Backend Logic**: No validation code or AI routes were added.
- Build status is verified.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only administrative readiness plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
