# GEARBEAT PATCH 59B — MARKETPLACE + STUDIO DISCOVERY FILTERS READINESS

## 1. Phase 59B Overview
This patch establishes the UX/UI foundation and expectation for advanced filtering across the GearBeat platform, specifically targeting the `/studios` and `/marketplace` discovery flows. By defining the UI intent now, we ensure a unified architecture for state management and layout handling in the upcoming technical implementation.

**Safety Boundary:** This patch is strictly UI/documentation-only. No real filter logic, database queries, URL parameter parsing, or API modifications were made.

---

## 2. Studio Discovery Filter Categories (Future State)
To provide a premium booking experience, the future Studio Filter architecture must support:
- **Location:** City, District, or "Near Me" (Geolocation).
- **Studio Type:** Recording, Podcast, Rehearsal, Production.
- **Price Range:** Minimum to Maximum hourly rate (`min_price`, `max_price`).
- **Availability:** Date and time slot picker.
- **Trust Indicators:** Verified only, GearBeat Certified, Minimum Google/TripAdvisor Rating.
- **Equipment & Services:** Specific gear categories (e.g., Microphones, Interfaces), Mixing/Mastering included.
- **Logistics:** Capacity (number of people), Parking, Accessibility.
- **Language Support:** Engineer languages (Arabic, English, etc.).

---

## 3. Marketplace Filter Categories (Future State)
For the global gear marketplace, filtering must match e-commerce best practices:
- **Taxonomy:** Category, Sub-category, Brand.
- **Price Range:** `min_price` to `max_price`.
- **Condition:** Brand New, Open Box, Refurbished, Used.
- **Seller Type:** Official Retailer, Verified Vendor, Private Seller.
- **Logistics:** In Stock Only, Local Pickup Available, Express Delivery.
- **Discovery Promoted:** New Arrivals, Featured, Top Rated.

---

## 4. Mobile Filter Drawer Readiness
The current web forms are functional on desktop but consume too much vertical space on mobile. The future UX (Phase 59+) will introduce a **Mobile Filter Drawer**:
- **Trigger:** A sticky "Filters (X)" button anchored to the bottom of the viewport on mobile devices.
- **Interaction:** Tapping opens a full-screen or bottom-sheet modal (`<dialog>` or standard React portal).
- **Real-time UX:** "Show X Results" button updates dynamically as filters are toggled, preventing unnecessary page reloads.

---

## 5. Arabic/English and RTL/LTR Considerations
- **Layout Swapping:** Checkbox arrays and range sliders must correctly flip orientation in RTL mode.
- **Translation Completeness:** All filter labels, placeholders, and error states must be wrapped in the `<T />` component.
- **URL Parameters:** Query parameters will remain English/ASCII (e.g., `?category=microphones`), but the UI representation will be localized.

---

## 6. SEO and Discoverability Considerations
- **URL Structure:** Filter selections should update the URL search parameters to allow users to bookmark or share specific searches (e.g., "Podcast studios in Riyadh under 150 SAR/hr").
- **Canonical Tags:** Ensure heavy filter parameter combinations do not create duplicate content penalties for search engines.

---

## 7. Admin Filter Governance Notes
- The Super Admin portal must have capabilities to manage the taxonomies (e.g., adding a new `marketplace_categories` or `equipment_brands` entry).
- These tables must remain dynamic so the filter UI builds itself from the database rather than hardcoded enums.

---

## 8. Explicit Implementation Boundaries
- **No Refactoring Live Logic:** This patch added UI placeholders only.
- **No URL Manipulation:** No Next.js `useRouter` or `useSearchParams` logic was added.
- **No Database Changes:** No SQL, RLS, or migrations were introduced.

---

## 9. QA Checklist
- [x] Studio discovery page UI updated with placeholder safely.
- [x] Marketplace page UI updated with placeholder safely.
- [x] Premium dark/gold identity preserved.
- [x] Multilingual text wrapped in `<T>` tags.
- [x] Existing forms and components continue to function.
- [x] `npm run build` succeeds without errors.
