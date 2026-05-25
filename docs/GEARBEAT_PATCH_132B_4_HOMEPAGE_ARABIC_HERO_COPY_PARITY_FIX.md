# Patch 132B-4 — Homepage Arabic Hero Copy Parity Fix

This document details the copy parity corrections applied to the homepage hero headline to ensure a seamless bilingual experience.

---

## Changes Implemented

### 1. Bilingual Hero Headline
- Wrapped each individual segment of the hero headline `<h1>` with `<T>` translation tags:
  - **Line 1**: English `"Book the space."` maps to Arabic `"احجز المكان."`.
  - **Line 2 (Gold Accent)**: English `"Buy the gear."` maps to Arabic `"اشترِ المعدات."` (inheriting `.gold-shimmer` styling).
  - **Line 3**: English `"Create the sound."` maps to Arabic `"اصنع الصوت."`.
- Fixed the previous bug where the Arabic page variant was rendering hardcoded English words.

### 2. RTL Spacing & Punctuation Validation
- Validated that the period (`.`) at the end of each Arabic segment aligns correctly on the left side of the text in RTL mode under the `[dir="rtl"]` layout context.
- Verified that the Arabic headline scales correctly without overlapping or creating massive vertical spacing gaps.

---

## Future Rule for Homepage Copy Modifications

> [!IMPORTANT]
> **Bilingual Layout Validation Rule**:
> Any future homepage headline, typography, or hero copy modifications **MUST** validate both the English (LTR) and Arabic (RTL) layout rendering, spacing, and character heights before merging changes. Doing so prevents layout-breaking mismatches or text overflows in either language direction.

---

## Scope Verification
- **Modified files**: `app/page.tsx`
- **Created files**: `docs/GEARBEAT_PATCH_132B_4_HOMEPAGE_ARABIC_HERO_COPY_PARITY_FIX.md`
- **Unmodified files**: No site-header, footer, database logic, auth boundaries, API endpoints, or routing mechanisms were changed.
