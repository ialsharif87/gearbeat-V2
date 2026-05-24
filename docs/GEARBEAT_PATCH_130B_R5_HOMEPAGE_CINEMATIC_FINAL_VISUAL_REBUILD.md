# Patch 130B-R5 - Homepage Cinematic Final Visual Rebuild

## Summary

Patch 130B-R5 rebuilds the public homepage visual layout in a controlled way to better match the approved GearBeat cinematic direction. The homepage now uses a large polished black/gold hero panel, soft studio background imagery, a golden sound-wave ribbon, clear CTAs, premium feature cards, featured studios, marketplace gear previews, trust wording, prepared paths, and a final CTA.

## Visual Changes

- Rebuilt `/` around a large cinematic hero panel instead of the prior uncomfortable composition.
- Kept the hero English-only for now and avoided stacked Arabic/English in the hero.
- Used the existing `public/brand/studio-placeholder.jpg` as a soft studio atmosphere layer with dark overlays.
- Added CSS-only gold haze, pulse orb, and sound-wave ribbon motion.
- Added four premium pathway cards with existing safe routes.
- Added featured studio preview cards and marketplace gear cards with readable premium treatments.
- Added a safe trust strip:
  - Verified listings
  - Manual review readiness
  - Creator-first experience
  - Support-ready journey
- Added prepared paths and a final CTA using safe non-overclaiming copy.

## Header Integration

The shared site header keeps existing links, auth behavior, cart, and language behavior. Its visual shell was softened to use a translucent dark blur and subtle gold bottom edge so the header blends into the cinematic homepage atmosphere instead of reading as a hard black strip.

## Safety Boundaries

This patch is visual/UI-only.

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

## Testing

- Typecheck: passed
- Build: passed
- Lint: passed with existing warnings only

## Rollback

Rollback is simple: revert the single Patch 130B-R5 commit.
