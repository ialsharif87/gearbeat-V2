# GearBeat UX Journey Rules

This document outlines the UX core rules that guide a user through the GearBeat marketplace and booking platforms. Every interface page must conform to these rules to ensure clarity, trust, and conversion flow.

---

## 1. The 5-Second UI Trust Rule

Within **5 seconds** of landing on any page on the GearBeat platform, a user must be able to clearly answer these three questions:

```
  +-------------------------------------------------------------+
  |                   The 5-Second UI Gate                      |
  +-------------------------------------------------------------+
  |  1. WHAT IS THIS PAGE?                                      |
  |     - Direct, clear main title / header.                    |
  |                                                             |
  |  2. WHY SHOULD I TRUST IT?                                  |
  |     - Trust indicators, clean typography, secure badges.    |
  |                                                             |
  |  3. WHAT DO I DO NEXT?                                      |
  |     - A single prominent, unambiguous call-to-action (CTA). |
  +-------------------------------------------------------------+
```

### A. What is this page?
*   **Actionable Rule**: Every page must have a single `<h1>` tag with a clear, concise title.
*   **Example**: Instead of a vague headline like "Gear Hub", use "Browse Certified Audio Gear".
*   **Subheadings**: Provide a brief one-line description to anchor the page's context.

### B. Why should the user trust it?
*   **Actionable Rule**: Display trust signals like the "GearBeat Certified" badge, secure payment badges (e.g., Tap Payments, local banks), and clear pricing structures with zero hidden fees.
*   **Visual Polish**: Substandard typography, alignment issues, or broken links instantly destroy trust. Keep layouts perfectly aligned and components polished.

### C. What should the user do next?
*   **Actionable Rule**: Every layout must establish a clear primary CTA.
*   **Visual Hierarchy**: Do not compete primary actions. Use a filled gold button for the primary step and a bordered/transparent button for secondary actions.

---

## 2. Empty States, Errors, and Loading Indicators

A premium journey is defined by how it handles unexpected or transitional states.

*   **Premium Empty States**:
    *   Never display a blank white page when a query returns no results (e.g., empty search, empty booking history, empty cart).
    *   Show a beautiful, custom-designed dark state with a friendly localized description and a helpful action button (e.g., "Reset Filters" or "Browse Popular Studios").
*   **Meaningful Error Handling**:
    *   Instead of standard developer messages like "Error: Code 500", display human-readable, clear instructions.
    *   Explain what went wrong, and provide a clear recovery action (e.g., "Try Again" or "Contact Support").
*   **Smooth Loading Transitions**:
    *   Avoid jerky layout shifts when data fetches are pending. Use premium skeleton components or a subtle gold pulsing wave indicator to manage user expectations.
