# Patch 93B — Smart Filter UI Preview / Intent Chips & Advanced Filters Layout Plan

## 1. Executive Summary
This document establishes the **Smart Filter UI Preview** for GearBeat V2. It implements a non-functional presentational layer that introduces the "Ask GearBeat" discovery pattern. This UI allows users to see how natural language intent and guided chips will coexist with advanced manual filters.

---

## 2. UI Pattern: Intent-First Discovery

### 2.1 The "Ask GearBeat" Block
- **Visual**: A premium search-style container with a gold-tinted glow and a subtle sparkle icon.
- **Copy**: "Describe what you need..." (English) / "صف لنا ما تحتاجه..." (Arabic).
- **Placeholder**: "e.g. Mixing engineer in Riyadh, Home studio bundle, etc."

### 2.2 Guided Intent Chips
Intent chips are vertically optimized and scrollable, providing one-tap shortcuts to common filtered views.

| Vertical | Intent Chips |
| --- | --- |
| **Marketplace** | Beginner gear, Pro audio, Home studio, Accessories |
| **Studios** | Recording, Mixing, Podcast, Rehearsal |
| **Services** | Mixing, Mastering, Production, Voice-over |
| **Tickets** | Live events, Workshops, Studio sessions, Community |
| **Academy** | 1-on-1 lessons, Group classes, Voice, Production |

---

## 3. Layout Hierarchy: Advanced Filters
To maintain power-user functionality, existing filters are relocated but preserved.
- **Desktop**: Filters remain in a collapsible sidebar or an "Advanced Filters" expandable header.
- **Mobile**: Filters are moved to a "Filter" button that triggers a bottom-sheet (drawer).
- **Labeling**: Clear distinction between "AI Discovery" (Natural Language) and "Manual Filters" (Dropdowns/Checkboxes).

---

## 4. Implementation Guidelines (Phase 93B)
- **Non-Functional**: Search bar and chips do not trigger backend queries or change database state.
- **Bilingual**: Full support for English and Arabic labels in the UI preview.
- **Styling**: Adheres to the GearBeat premium dark identity (Black, Gold, Slate-900).
- **Feedback**: Hover states on chips to demonstrate interactivity.

---

## 5. Prohibitions & Constraints
- **NO LIVE AI**: No real AI processing or LLM calls are implemented.
- **NO REAL FILTERS**: Existing filter logic and URL parameters are not modified.
- **NO FAKE INVENTORY**: No placeholder results or fake "Recommended" items.
- **NO DATABASE MUTATION**: This is a purely client-side UI preview.

---

## 6. No-Risk Scope Confirmation
- This is a UI-only presentational preview and documentation.
- No app code, components, routes, or API files were refactored.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
