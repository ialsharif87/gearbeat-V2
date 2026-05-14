# Patch 94B — Admin Tagging & Data Quality Readiness Plan

## 1. Executive Summary
This document establishes the **Data Quality Standards** and **Admin Tagging Protocols** for GearBeat V2. It ensures that all platform data (Studios, Marketplace, Services, Tickets, Academy) meets the high-fidelity requirements needed for "Ask GearBeat" and smart discovery.

---

## 2. Admin Tagging Requirements

### 2.1 Studio & Service Tagging
- **Core Category**: Must be selected (e.g., Recording Studio, Mixing House).
- **Technical Use Case**: Tagging for specific activities (e.g., Vocal Tracking, ADR, Masterclass).
- **Equipment Accuracy**: Manual verification of "Certified" gear (e.g., Neve 1073, ATC SCM25A).

### 2.2 Marketplace & Academy Tagging
- **Product Condition**: Strict tagging for Used-Certified vs. Open-Box.
- **Skill Level Alignment**: Ensuring Academy lessons are correctly tagged for Beginner, Intermediate, or Pro.
- **Language Proficiency**: Tagging instructors and service providers by supported languages (AR/EN).

---

## 3. Data Quality Groups & Validation

| Quality Group | Requirement | Admin Action |
| --- | --- | --- |
| **Pricing Clarity** | No "Price on Request" for standard services. | Flag listings with missing `price_from`. |
| **Media Quality** | Min 3 high-res photos for Studios/Marketplace. | Reject low-quality or blurry uploads. |
| **Availability** | Real-time calendar link or manual status. | Disable listings with expired availability. |
| **Verification** | ID and Business CR check. | Apply "Verified" or "Certified" badge. |
| **Tag Hygiene** | No duplicate or misspelled tags. | Clean up `ai_tags` JSONB column regularly. |

---

## 4. Profile Completeness Scoring (PCS)
To drive data quality, partners receive a PCS score based on their data input.

- **Min Publish-Ready (40%)**: Basic title, price, and 1 photo. (Visible in general search).
- **Discovery-Ready (70%)**: All standard tags applied + 3 photos + valid location. (Prioritized in filters).
- **Ask GearBeat-Ready (90%)**: Technical equipment list + verified availability + bilingual copy. (Included in AI discovery).
- **Certified-Ready (100%)**: Manual admin audit passed + top-tier gear + premium response rate. (Featured placement).

---

## 5. Partner-Facing Guidance (Summary)
- **Studios**: "Focus on your unique equipment and room acoustics. Users search for 'Neve sound' or 'dry vocal booth'."
- **Vendors**: "Tag by brand and sub-category precisely (e.g., 'Interface' -> 'Thunderbolt 3')."
- **Instructors**: "Clearly define the *outcome* (e.g., 'By the end of this lesson, you will master side-chaining')."

---

## 6. Future Implementation Checklist

### 6.1 Admin Fields & Tools
- [ ] **Tag Manager**: A dedicated UI to manage the global taxonomy.
- [ ] **Audit Trail**: Tracking which admin verified a piece of equipment or a studio.

### 6.2 Validation Rules (Future)
- [ ] Auto-rejection of listings with < 200 characters in description.
- [ ] Mandatory image aspect ratio enforcement.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only data quality and admin readiness plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
