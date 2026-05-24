# Patch 130B - Homepage Cinematic Visual System Foundation

## Summary

Patch 130B upgrades only the GearBeat homepage with a premium cinematic dark/gold visual system. The new homepage foundation introduces:

- A cinematic hero with the approved headline: "Book the space. Buy the gear. Create the sound."
- The Arabic hero line: "احجز المكان، اشترِ المعدات، وابدأ الإبداع"
- Primary CTAs for studio booking and marketplace exploration.
- CSS-only sound-wave motion.
- A pulse orb visual signature.
- Gold glow cards with thin borders, dark overlays, and soft shadows.
- Premium feature cards for Book Studios, Marketplace, Certified Studios, and Rewards.
- Refined Featured Studios preview and Featured Gear preview sections using safe preview language.
- A trust strip that avoids unsupported live payment or inventory claims.
- Continued use of existing public feature flags for controlled-phase ecosystem messaging.

## Rollback Instructions

Rollback option 1:

- Revert the Patch 130B commit.

Rollback option 2:

- Restore `app/page.tsx` from the backup branch:
  - `backup-homepage-before-130b`

Rollback option 3:

- Compare against the rollback reference snapshot:
  - `docs/homepage-backup-before-130b.md`

## Motion And Performance Notes

- Motion uses CSS keyframes only.
- No Three.js, WebGL, video background, or animation library was added.
- The pulse orb and sound-wave bars are lightweight CSS elements.
- `prefers-reduced-motion: reduce` disables the decorative animations.
- The visual system is web-only in this patch, but the design language is token-friendly for future mobile reuse.

## Mobile Responsiveness Notes

- The hero stacks on tablet/mobile with the visual treatment above the copy.
- CTA buttons become full-width on smaller screens.
- Feature, studio, gear, and controlled-phase grids collapse from desktop grids to two-column and then single-column layouts.
- RTL layout support is preserved through existing `T` behavior and targeted RTL CSS helpers.

## Safety Boundary

This patch is UI-only.

Confirmed unchanged by intent:

- No SQL.
- No Supabase CLI.
- No Supabase MCP.
- No API route changes.
- No auth logic changes.
- No payment logic changes.
- No booking, order, or marketplace business logic changes.
- No database or migration changes.
- No `.env` changes.
- No routing changes.

## Homepage Preservation

The current homepage was preserved before implementation through:

- Backup branch: `backup-homepage-before-130b`
- Reference snapshot: `docs/homepage-backup-before-130b.md`

The snapshot is only a rollback/reference artifact and is not part of the runtime homepage implementation.
