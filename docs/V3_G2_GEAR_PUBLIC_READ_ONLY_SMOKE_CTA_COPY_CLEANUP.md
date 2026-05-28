# V3-G2 — Gear Public Read-Only Smoke + CTA/Copy Cleanup

This patch reviews and cleans up the public Gear Directory / Marketplace experience to align with a strictly read-only and pre-live pilot sandbox model.

---

## 1. Patch Summary and Status
- **Status**: Completed.
- **Scope**: Public Gear discovery and copy safety.
- **Objective**: Standardize listing cards and details, ensuring all transactional calls are either deactivated or explicitly bounded by sandboxed pilot descriptions.

---

## 2. Routes/Components Inspected
- [`app/gear/page.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/gear/page.tsx) — Landing gear marketplace previews.
- [`app/gear/products/page.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/gear/products/page.tsx) — Gear filter and grid catalog.
- [`app/gear/products/[slug]/page.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/gear/products/[slug]/page.tsx) — Detailed specifications view.
- [`app/marketplace/page.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/marketplace/page.tsx) — Marketplace overview catalog.
- [`components/product-card.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/components/product-card.tsx) — Product item preview card.
- [`components/marketplace-product-card.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/components/marketplace-product-card.tsx) — Vendor authenticated card.
- [`components/add-to-cart-button.tsx`](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/components/add-to-cart-button.tsx) — Sandbox checkout activator.

---

## 3. Smoke-Test Findings
- The catalog uses read-only queries against Supabase tables. No database writes are executed during catalog discovery or filtering.
- Route parameters (`?category=`, `?brand=`, `?q=`, prices, inventory counts) correctly filter sandbox listings without triggering mutations.

---

## 4. CTA/Copy Safety Review
- Public-facing buttons on listing views that formerly prompted "Add to Cart" have been audited and replaced with informational navigations.
- Warnings clarifying the sandbox and demo boundaries are consistently rendered on interactive pages in both Arabic and English.

---

## 5. What Changed, if Anything
- **`components/product-card.tsx`**: Replaced the `<AddToCartButton />` with a direct `<Link />` saying `"View Details"` (Arabic: `"عرض التفاصيل"`). This makes catalog directory grids cleanly informational rather than commerce-focused.
- **`app/gear/products/[slug]/page.tsx`**: Replaced `<AddToCartButton />` and `"Buy Now"` actions with a disabled button clearly labeled `"Request Availability (Coming Soon)"` (Arabic: `"طلب توفر (قريباً)"`), locking catalog interactions safely.

---

## 6. What Intentionally Remains Disabled/Pre-Live
- Financial processing (deferred checkout and webhook handlers) remains disabled.
- Live order submissions and stock deductions are mocked or locked behind pre-live flags.

---

## 7. Arabic/English Notes
- Dual-locale labels remain intact across all modifications using `<T />` and standard CSS document directionality styles.
- Custom terms utilize localized phrasing:
  - English: `"Request Availability (Coming Soon)"` / `"View Details"`
  - Arabic: `"طلب توفر (قريباً)"` / `"عرض التفاصيل"`

---

## 8. Build Result
- Pre-existing compilation errors in untracked Figma preview configurations exist (`Can't resolve '../../components/figma-preview/Footer'`), but our directory modifications compile cleanly.

---

## 9. Remaining Risks
- **Testing cart flows**: If users manually navigate to `/marketplace/cart` or try to trigger `/api/marketplace/cart/add`, they will encounter the sandbox barriers. Ensure these mock APIs stay locked down in upcoming patches.

---

## 10. Next Recommended Patch
- **Name**: `V3-G3 — Gear Data Contract & Migration Readiness Pack`
- **Scope**: `docs/planning-only` definition of database entities and RLS policies for future Gear marketplace systems.
