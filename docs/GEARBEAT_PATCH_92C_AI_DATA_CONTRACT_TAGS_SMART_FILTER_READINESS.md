# Patch 92C — AI Data Contract, Tags & Smart Filter Readiness

## 1. Executive Summary
This document establishes the **AI Data Contract** and **Tag Taxonomy** for GearBeat V2. It defines the structured metadata required to enable the "Ask GearBeat" AI Discovery layer to map natural language intent to precise product, studio, and service filters.

**Final Verdict**: **AI DATA CONTRACT READY — SMART FILTERS PLANNED, NO LIVE AI OR BACKEND IMPLEMENTATION YET**.

---

## 2. Shared Tag Taxonomy
To ensure cross-vertical discovery, the following standard tags must be implemented in the database metadata for all entities.

| Tag Category | Values (Examples) | Scope |
| --- | --- | --- |
| **City** | Riyadh, Jeddah, Dubai, Abu Dhabi, London | Global |
| **Budget** | Budget, Standard, Premium, Elite | All |
| **Category** | Podcast, Mixing, Mastering, Vocal, Drum, Synth | All |
| **Duration** | Hourly, Half-Day, Full-Day, Multi-Day | Studios/Services |
| **Skill Level** | Beginner, Intermediate, Professional, Elite | Academy |
| **Use Case** | Music, Corporate, Film, Gaming, Social Media | All |
| **Language** | Arabic, English, Bilingual | All |
| **Verified Status** | Certified, Verified, Pending | All |

---

## 3. Vertical-Specific Data Requirements

### 3.1 Studios
- **Equipment List**: JSON object of verified gear (e.g., `{"monitors": ["ATC SCM25A"], "consoles": ["Neve 8424"]}`).
- **Acoustic Profile**: Tags like `Dry`, `Live`, `Diffused`.
- **Availability JSON**: Real-time slot mapping for instant AI booking confirmation.

### 3.2 Marketplace
- **Condition**: New, Used-Certified, Open-Box.
- **Shipping**: Local, GCC-Wide, Global.
- **Warranty**: Manufacturer, GearBeat-Backed, None.

### 3.3 Academy & Services
- **Teacher Bio**: Semantic tags for teaching style (e.g., `Practical`, `Theory-Focused`).
- **Service SLA**: Turnaround time (e.g., `24-Hour`, `3-Day`).

---

## 4. Intent-to-Filter Mapping Rules

| Natural Language Intent | AI Extraction Rule | Target Filter |
| --- | --- | --- |
| "Under $100" | Match `price < 375 SAR` | `price_range` |
| "In Riyadh" | Match `city == 'Riyadh'` | `location` |
| "Neve console" | Match `equipment contains 'Neve'` | `gear_search` |
| "Masterclass" | Match `type == 'Workshop'` | `academy_type` |

---

## 5. Ranking & Recommendation Safety Rules
- **Rule 1: Internal-Data-First**: Recommendations must prioritize "GearBeat Certified" partners over general verified partners.
- **Rule 2: No Hallucination**: If a specific gear piece isn't found, the AI must offer "Closest Alternative" or state "Not Found" instead of guessing.
- **Rule 3: Transparency**: AI must state *why* it recommended an item (e.g., "Recommended because it has a Neve console and is within your $200 budget").

---

## 4. Technical Readiness Checklist
- [ ] **Metadata Schema**: Update Supabase tables to support `ai_tags` JSONB column.
- [ ] **Vector Embeddings**: Plan for generating embeddings for studio equipment and service bios.
- [ ] **Admin Tagging UI**: Readiness for staff to manually verify/correct AI-generated tags.
- [ ] **Search API**: Expansion of search routes to accept semantic intent parameters.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only data contract and taxonomy framework.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
