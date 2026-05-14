# Patch 95A — Public Discovery Experience Audit & Polish Plan

## 1. Executive Summary
This document audits the current **Public Discovery Experience** in GearBeat V2 and outlines a **Polish Plan** to refine the interaction between the "Ask GearBeat" AI Discovery layer and existing manual filters.

---

## 2. Discovery Experience Audit

### 2.1 Homepage
- **Status**: Hero discovery entry points established. AI Discovery preview added after hero.
- **Audit**: Strong cinematic entry, but requires better guiding text to differentiate between "Ask GearBeat" and manual search.

### 2.2 Vertical Discovery (Marketplace, Studios, etc.)
- **Status**: "SmartDiscoveryPreview" component added to vertical headers. Intent chips implemented.
- **Audit**: Good visual consistency. Filters are still prominent but need to feel like "Advanced Tools" rather than the only option.

### 2.3 Mobile & Bilingual Readiness
- **Status**: Basic responsiveness and Arabic/English microcopy established.
- **Audit**: Mobile drawer for filters is planned but needs UI presentational polish. Arabic labels are accurate but need consistent font scaling.

---

## 3. UI Polish Rules

1. **Ask GearBeat Placement**: Must always sit above manual filters as the "Primary Concierge."
2. **Intent Chips**: Should use verb-driven language (e.g., "Find," "Book," "Shop") to guide intent.
3. **Advanced Filters**: Should be collapsed by default or separated by a "Manual Filters" label to reduce cognitive load.
4. **Empty States**: Must provide helpful " concierge-style" advice instead of a blank "No results."
5. **No Claims**: Copy must state "UI Preview" or "Experimental" to manage user expectations regarding live AI.

---

## 4. Per-Page Improvement Plan (95B Readiness)

| Page | Planned Improvement (UI-Only) |
| --- | --- |
| **Homepage** | Add "Describe your sound..." microcopy to hero search. |
| **Marketplace** | Implement "Advanced Filters" toggle to hide/show complex dropdowns. |
| **Studios** | Add intent chips for "Vocal Recording" and "Podcast Hub." |
| **Academy** | Refine instructor intent chips (e.g., "Beginner Voice," "Pro DAW Mastery"). |
| **Tickets** | Add "Events Near Me" and "Online Masterclasses" chips. |

---

## 5. Microcopy Library (AR/EN)

| Use Case | English | Arabic |
| --- | --- | --- |
| **Ask GearBeat Entry** | "Describe what you need..." | "صف لنا ما تحتاجه..." |
| **Intent Chip (Marketplace)** | "Pro Audio" | "أجهزة احترافية" |
| **Intent Chip (Studios)** | "Vocal Studio" | "استوديو غناء" |
| **Empty State Guidance** | "No exact matches. Try broadening your query." | "لا يوجد تطابق دقيق. جرب توسيع البحث." |
| **Advanced Filters Toggle** | "Manual Filters" | "فلاتر يدوية" |
| **Disclaimer** | "Experimental AI Discovery Preview" | "معاينة تجريبية لاكتشاف الذكاء الاصطناعي" |

---

## 6. Implementation Recommendation
- **Safe for 95B**: All UI changes (toggles, chips, microcopy, layout hierarchy).
- **Blocked**: Real-time filtering based on chips, backend AI routes, vector search database changes.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only experience audit and polish plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
