# Patch 94A — Unified Discovery Taxonomy + Intent-to-Filter Mapping Pack

## 1. Executive Summary
This document defines a **Unified Discovery Taxonomy** for GearBeat V2, providing the structural foundation for mapping natural language user intent to specific database filters across all platform verticals. It ensures that "Ask GearBeat" operates on a consistent, cross-category tag system.

---

## 2. Unified Discovery Taxonomy

### 2.1 Standard Tag Groups (Cross-Vertical)
These tags apply to all entities (Studios, Products, Services, Lessons, Events).

| Tag Group | Values (Examples) | Database Field (Target) |
| --- | --- | --- |
| **City** | Riyadh, Jeddah, Dubai, Abu Dhabi, London | `location_city` |
| **Budget** | Budget, Standard, Premium, Elite | `price_tier` |
| **Category** | Podcast, Mixing, Mastering, Vocal, Drum, Synth | `category_slug` |
| **Skill Level** | Beginner, Intermediate, Professional, Elite | `skill_level` |
| **Use Case** | Music, Corporate, Film, Gaming, Social Media | `use_case` |
| **Language** | Arabic, English, Bilingual | `language` |
| **Verified** | Certified, Verified, Pending | `verified_status` |

---

## 3. Intent-to-Filter Mapping Pack

### 3.1 Mapping Rules (Natural Language -> Filters)

| User Intent Example | Extracted Metadata | Resulting Filter Action |
| --- | --- | --- |
| **"I need a beginner home studio setup"** | `Level: Beginner`, `Vertical: Marketplace`, `Use Case: Home Studio` | `Vertical: Marketplace` + `Skill Level: Beginner` + `Category: Bundles` |
| **"I want a studio for podcast recording"** | `Category: Podcast`, `Vertical: Studios` | `Vertical: Studios` + `Feature: Podcast Equipment` |
| **"I need mixing and mastering"** | `Category: Post-Production`, `Vertical: Services` | `Vertical: Services` + `Type: Mixing/Mastering` |
| **"Show me live music workshops"** | `Type: Workshop`, `Vertical: Tickets` | `Vertical: Tickets` + `Category: Live Workshop` |
| **"أحتاج استوديو في الرياض للبودكاست"** | `City: Riyadh`, `Category: Podcast`, `Vertical: Studios` | `Vertical: Studios` + `City: Riyadh` + `Feature: Podcast` |

---

## 4. Discovery Quality & Safety Rules
To maintain the GearBeat "Benchmark for Trust," the following rules apply to all AI/Smart Discovery recommendations.

1. **No Data, No Claim**: AI must not recommend a partner unless the partner has a 100% complete "Discovery Profile" (Tags + Valid Fields).
2. **Strict Availability**: Recommendations must only show items with "Ready" or "Available" status. No fake availability claims.
3. **Price Transparency**: AI must use the `price_from` or `listing_price` fields directly. No fake pricing or discounts.
4. **Verified Priority**: Search results must always rank **GearBeat Certified** partners higher than non-certified partners.
5. **Fallback Honesty**: If a query is too specific (e.g., "U47 microphone for $10"), the system must suggest the closest verified alternative or state "No Certified Matches Found."

---

## 5. Future Implementation Checklist

### 5.1 Data Field Readiness
- [ ] Add `ai_tags` JSONB column to `studios`, `products`, `services`, `academy_lessons`, and `events`.
- [ ] Implement `discovery_profile_complete` boolean flag for partners.

### 5.2 Admin & Partner Requirements
- [ ] Admin Dashboard: Tagging tool for bulk classification of equipment and skills.
- [ ] Partner Portal: "Discovery Readiness" meter to encourage tag completion.

### 5.3 Technical Pipeline
- [ ] Intent Parser: Readiness for semantic analysis of multi-lingual queries.
- [ ] Mapping Engine: Rule-based translation of intent chips to URL parameters.

---

## 6. No-Risk Scope Confirmation
- This is a documentation-only taxonomy and mapping framework.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
