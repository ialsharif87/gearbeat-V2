# GEARBEAT PATCH 125D — CONFIG-BASED PUBLIC FEATURE VISIBILITY CONTROLS

This document outlines the introduction of a centralized public feature flag visibility configuration in Patch 125D.

---

## 1. Configuration File Added

A central, frontend-only configuration file has been created at:
[`lib/public-feature-flags.ts`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/lib/public-feature-flags.ts)

This file defines the feature visibility states, structure, and initial launch configurations for GearBeat’s primary verticals.

---

## 2. Visibility Statuses Defined

We introduced the following formal visibility states:

* **`hidden`**: The feature is completely removed from all public rendering (menus, footer, and homepage).
* **`coming_soon`**: The feature is visible on the homepage as a coming soon card, but does not provide active links or operations.
* **`admin_preview`**: The feature is only accessible under administrative bypass/preview, and listed as coming-soon or under development for the public.
* **`public`**: The feature is fully launched, clickable in navigation header/footer, and has its live public routes active.

---

## 3. Initial Feature States

The config includes entries for the following 5 verticals:

| Feature Key | English Label | Arabic Label | Visibility Status | Header Navigation | Footer Navigation | Homepage Section |
|---|---|---|---|---|---|---|
| `academy` | GearBeat Academy | أكاديمية جيربيت | `coming_soon` | Hidden | Hidden / Placeholder | Visible (Coming Soon) |
| `services` | Professional Services | الخدمات الاحترافية | `admin_preview` | Hidden | Hidden / Placeholder | Visible (Under Dev) |
| `tickets` | Event Ticketing | حجز تذاكر الفعاليات | `coming_soon` | Hidden | Hidden / Placeholder | Visible (Coming Soon) |
| `experiences` | Creative Experiences | التجارب الإبداعية | `coming_soon` | Hidden | Hidden / Placeholder | Visible (Coming Soon) |
| `partner_programs` | Partner Programs | برامج الشركاء | `admin_preview` | Hidden | Hidden / Placeholder | Visible (Under Dev) |

---

## 4. Boundary & Scope Confirmation

* **Homepage Reads From Config:** The **Ecosystem Expansion / Coming Soon at GearBeat** section on the homepage (`app/page.tsx`) now dynamically reads from `lib/public-feature-flags.ts` and renders cards dynamically based on the `showOnHomepage` flag.
* **No Unfinished CTAs Added:** No active links, buttons, or clickable routes were added to these cards. They remain static coming-soon indicators.
* **No Database/Backend Changes:** No database tables, API mutations, Supabase configurations, or SQL queries were touched.
* **No Auth/Payment Changes:** Billing, checkout, auth middleware, and registration controllers remain completely unmodified.

---

## 5. Next Planned Patch

* **Patch 125E — Super Admin Launch Controls Preview**: Provide a secure administrative interface to preview and toggle these feature flag visibility states locally.
