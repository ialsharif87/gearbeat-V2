# Patch 130B-R4.1 - Homepage Continuous Cinematic Journey Fix

## Summary

Patch 130B-R4.1 keeps the R4 homepage direction but fixes the remaining visual crowding and section separation. The homepage now reads as one continuous dark/gold studio journey instead of separate blocks.

## What Changed

- Reduced the hero headline scale to the requested range:
  - base: `2.65rem`
  - small screens: `3rem`
  - medium screens: `3.75rem`
  - extra large screens: `4.7rem`
- Removed the Arabic hero line from the English hero so English and Arabic are not stacked together.
- Added a page-level cinematic journey shell using the existing `public/brand/studio-placeholder.jpg` as a soft fixed background.
- Moved gold haze, rhythm-line texture, and studio glow to the full homepage background instead of keeping the atmosphere isolated in the hero.
- Removed hard visual breaks from major sections by softening section backgrounds and replacing separators with subtle gradient bridges.
- Kept the Ask GearBeat rail, integrated pulse orb/wave, current CTA hrefs, and existing homepage sections.

## Continuous Journey Notes

The homepage sections now sit on top of the same dark studio atmosphere. Section-specific backgrounds are subtle overlays rather than separate page blocks, so the visual rhythm carries from hero to pathways, studios, gear, trust, ecosystem, and final CTA.

## Mobile Behavior

- The hero headline remains strong but no longer oversized.
- The hero stacks cleanly as copy, beat visual, Ask GearBeat rail, and CTAs.
- Section spacing uses a more consistent mobile-friendly rhythm.

## Motion & Performance

- Motion remains CSS keyframes only.
- No video, Three.js, WebGL, or new dependency was added.
- Reduced-motion handling remains in place for decorative motion.

## Rollback

Rollback is simple: revert the single Patch 130B-R4.1 commit.

## Safety Confirmation

This patch is UI-only.

No changes were made to:

- SQL
- Supabase
- API routes
- Auth logic
- Payment logic
- Backend logic
- Booking/order/marketplace business logic
- Database or migrations
- `.env` files
- Mobile app files
