# GearBeat Design System Rules

GearBeat is a premium marketplace for high-end music gear, instruments, and recording studio bookings. Our design philosophy is **cinematic, music-inspired, clean, mobile-first, and bilingual (English/Arabic)**. Every interface must radiate premium quality.

---

## 1. Visual Theme & Palette

Our visual space relies on deep contrasts, sophisticated gold highlights, and clean typography. Avoid basic, primary colors.

*   **Backgrounds (The Dark Canvas)**:
    *   Primary Canvas: Deep Pitch Black (`#000000` or `#050505`).
    *   Elevated Surface: Charcoal Gray (`#121212`, `#161616`).
    *   Subtle Borders: Low-opacity slate or dark gold (`rgba(212, 175, 55, 0.1)`).
*   **Accents (The Golden Pulse)**:
    *   Primary Gold: Premium Metallic Gold (`#D4AF37` / `hsl(45, 64%, 53%)`).
    *   Hover/Active Gold: Light Champagne Gold (`#F3E5AB`).
    *   Gradient Accents: Smooth dark metallic gradient (`linear-gradient(135deg, #161616 0%, #000000 100%)`) with clean gold divider lines.
*   **Aesthetics (The Audio Signature)**:
    *   Music-inspired branding: Integrate clean, mathematical sound-wave shapes, audio pulse indicators, and subtle glassmorphic elements.
    *   Never use standard flat shapes where you can use slightly rounded container corners (`border-radius: 8px` or `12px`) and subtle drop shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.8)`).

---

## 2. Typography Rules

*   **Fonts**:
    *   English: Premium sans-serif font (e.g., `Inter` or `Outfit` via Google Fonts).
    *   Arabic: Modern, elegant Kufic/Naskh variant (e.g., `Tajawal` or `Cairo`).
*   **Hierarchies**:
    *   Titles/Headings: Clean, wide spacing, uppercase letter-spacing (for English), medium/semi-bold weight.
    *   Subheadings: Muted gold or soft white (`#A0A0A0`).
    *   Body Text: Highly readable off-white (`#E0E0E0` or `#F5F5F5`). Never use bright `#FFF` for long-form paragraphs to prevent eye strain.

---

## 3. Layout & Mobile-First Spacing

*   **Mobile-First Standard**:
    *   All layouts must be designed for mobile viewports (widths from 320px to 480px) first, then scale up gracefully via media queries to desktop.
    *   **Tap Targets**: Ensure all buttons, links, and interactive elements have a minimum clickable area of **48px x 48px** to prevent tapping errors.
    *   **Padding Bounds**: Maintain standard padding sizes (`16px` on mobile, `24px` to `32px` on desktop) to let elements breathe.
*   **RTL / LTR Bilingual Parity**:
    *   Every visual layout must support bidirectional rendering.
    *   Use logical CSS property values (e.g., `margin-inline-start` instead of `margin-left`, `text-align: start` instead of `text-align: left`).
    *   Verify that custom flex direction and absolute positions mirror cleanly when the document direction is set to `rtl` (`dir="rtl"`).
    *   Do not hardcode pixel-based shifts that break when language changes.
