# Patch 96B — Partner Discovery Data Entry UX & Completeness Rules

## 1. Executive Summary
This document defines the **Partner Data Entry UX** and **Completeness Benchmarks** for GearBeat V2. It establishes how studios, vendors, and instructors should provide structured data to ensure their listings are "Ask GearBeat" ready.

---

## 2. Partner Form Sections (Discovery Optimized)

### 2.1 Basic Identity & Media
- **Title (AR/EN)**: Clear, descriptive name (e.g., "Riyadh Podcast Hub").
- **Visuals**: Minimum 3 images required for discovery-readiness.
- **Location**: Precise city/district tagging.

### 2.2 Intent-Driven Tagging
- **Use Cases**: Multi-select activity tags (e.g., Mixing, Vocal Tracking, Rehearsal).
- **Equipment/Brand Tags**: Partners must select from a pre-approved list of gear and brands to ensure filter accuracy.

### 2.3 Pricing & Availability
- **Price Clarity**: Transparent `price_from` or `session_rate` is mandatory.
- **Availability Status**: Partners must confirm if they use the GearBeat calendar or an external sync.

---

## 3. Completeness Levels (The "Readiness Meter")

| Level | Requirement | Discovery Benefit |
| --- | --- | --- |
| **Draft** | Title + Category. | Private only. |
| **Publish-Ready** | Basic Info + 1 Photo + Price. | Public search visibility. |
| **Discovery-Ready** | Standard Tags + Location + 3 Photos. | Prioritized in vertical filters. |
| **Ask GearBeat-Ready** | Full Intent Mapping + Equipment Metadata. | Included in AI concierge results. |
| **Certified-Ready** | Admin Verification + Pro-Tier Gear. | Featured/Premium placement. |

---

## 4. Partner UX Guidance & Feedback
The partner portal should include real-time feedback to encourage data quality:

- **Missing Fields Checklist**: "To be Ask GearBeat-Ready, you still need to add equipment tags."
- **Progress Meter**: A visual bar showing the path from "Draft" to "Discovery-Ready."
- **Bilingual Helper Text**: 
  - *EN*: "Describe your studio's best use case (e.g., Best for Vocal Recording)."
  - *AR*: "صف أفضل حالات الاستخدام للاستوديو الخاص بك (مثلاً: الأفضل لتسجيل الصوت)."

---

## 5. Safety & Trust Rules (Partner Constraints)
1. **No Self-Claims**: Partners cannot manually check a "Certified" or "Top-Rated" box. These are admin-only.
2. **Verification Priority**: Claims of specific gear (e.g., "Neumann U87") may require admin verification before being indexed for Ask GearBeat.
3. **Accuracy Enforcement**: Repeatedly inaccurate pricing or availability will result in a lower "Discovery Score" or temporary suspension from AI discovery.

---

## 6. Future Implementation Checklist
- [ ] **Partner Dashboard Widget**: "Your Discovery Readiness Score."
- [ ] **Unified Tag Picker**: A multi-lingual autocomplete selector for gear and services.
- [ ] **Admin Review Workflow**: A queue for admins to approve "Discovery-Ready" listings for the "Ask GearBeat" index.

---

## 7. Implementation Boundary
- **Planning Only**: This document is for architectural readiness.
- **No Database Changes**: No migrations or schema updates are authorized in this patch.
- **No Partner Form Refactoring**: No modifications to the live partner codebase were made.
- Build status is verified.

---

## 8. No-Risk Scope Confirmation
- This is a documentation-only partner readiness plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
