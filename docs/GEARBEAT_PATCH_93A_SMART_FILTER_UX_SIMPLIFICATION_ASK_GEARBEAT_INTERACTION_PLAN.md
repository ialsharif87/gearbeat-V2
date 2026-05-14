# Patch 93A — Smart Filter UX Simplification & Ask GearBeat Interaction Plan

## 1. Executive Summary
This document defines the **Smart Filter UX Simplification** strategy for GearBeat V2. The goal is to transition from a complex manual filtering model to an AI-first discovery model using "Ask GearBeat". This plan ensures that while the AI layer becomes the primary entry point, existing advanced filters remain accessible for precision power-users.

---

## 2. The Problem: Filter Complexity
Currently, discovering specific audio assets (Studios with specific gear, Marketplace items with specific conditions, Academy levels) requires significant manual effort across multiple dropdowns and checkboxes. This creates:
- **Cognitive Load**: Users must know exactly which category a tool belongs to.
- **Mobile Friction**: Deep filter menus are difficult to navigate on small screens.
- **Discovery Drop-off**: Users may miss hidden gems because they didn't apply the right filter combination.

---

## 3. New Discovery Hierarchy (UX Flow)

### Tier 1: Ask GearBeat (Primary)
- **UI**: A prominent, natural-language search bar at the top of vertical pages (Studios, Marketplace, etc.).
- **Copy**: "Describe what you need..." / "صف لنا ما تحتاجه..."
- **Interaction**: Users type intent (e.g., "Riyadh podcast studio under $150").

### Tier 2: Suggested Intent Chips (Guided Discovery)
- **UI**: Horizontally scrollable chips below the search bar.
- **Examples**: "Podcast Ready," "Vintage Analog," "Beginner Friendly," "Same Day Shipping."
- **Benefit**: Guided shortcuts for common user needs.

### Tier 3: Basic Filters (Immediate Refinement)
- **UI**: 2-3 essential visible filters (e.g., City, Price Range).
- **Positioning**: Always visible for quick manual adjustment.

### Tier 4: Advanced Filters (Secondary/Collapsed)
- **UI**: A "Filters" button that opens a side-panel or expandable area.
- **Content**: Detailed technical filters (Specific gear brands, technical certifications, lesson duration).

---

## 4. Vertical-Specific UX Rules

| Vertical | Primary AI Intent Focus | Key Filters (Visible) |
| --- | --- | --- |
| **Marketplace** | Gear Condition & Shipping | Category, Price, Brand |
| **Book Studios** | Gear Inventory & Vibe | City, Price, Gear |
| **Academy** | Skill Level & Outcome | Level, Instrument, Language |
| **Tickets** | Event Type & Access | Event Date, Venue |
| **Services** | Professional Outcome | Specialty, Turnaround |

---

## 5. Mobile UX & Accessibility
- **Sticky Search**: The "Ask GearBeat" bar sticks to the top during scroll for instant query modification.
- **Drawer Filters**: Advanced filters open in a bottom-sheet on mobile for better thumb-reach.
- **Feedback Loop**: When AI extracts a filter (e.g., "Riyadh"), the corresponding manual filter chip is highlighted so the user understands the mapping.

---

## 6. Safety & Hallucination Guardrails
- **No Fake Data**: AI Discovery results must strictly pull from the GearBeat database.
- **Empty State**: If no results match the "Ask GearBeat" query, show: "No exact matches. Would you like to view similar [Category] in [City]?"
- **Verification Badge**: Always display the "Certified" or "Verified" badge on AI-recommended items to maintain trust.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only UX strategy and interaction plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
