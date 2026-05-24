# Patch 130B-R4 - Homepage Cinematic Layout Correction

## Summary

Patch 130B-R4 surgically corrects the current homepage hero layout after R3. It keeps the cinematic GearBeat direction but fixes the oversized headline, separated AI discovery placement, boxed pulse-orb feeling, and studio atmosphere depth.

## What Changed

- Reduced the hero headline scale so desktop caps around a `text-7xl` feel instead of oversized `text-8xl/text-9xl` proportions.
- Rebuilt the desktop hero into a three-column composition:
  - left: headline, Arabic line, supporting copy, and CTAs
  - center: integrated pulse orb and sound wave
  - right: vertical Ask GearBeat discovery rail
- Converted AI discovery into a right-side vertical rail with:
  - Ask GearBeat
  - Find a vocal room
  - Compare studio prices
  - Plan a podcast setup
  - Discover trusted gear
- Removed the hard framed-card feeling around the pulse orb by using transparent radial glow, open wave fields, and no visible card border.
- Added the existing `public/brand/studio-placeholder.jpg` softly behind the hero with dark overlays, plus CSS-only gold haze and rhythm-line atmosphere.
- Tightened section title scale and body text readability so the rest of the homepage feels more balanced.

## Mobile Behavior

- The hero stacks into headline/copy, beat visual, and the Ask GearBeat rail.
- CTAs remain full-width tap targets on mobile.
- The pulse orb and wave scale down without hard framing.
- Section titles use a smaller mobile range for better reading.

## Motion & Performance

- Motion remains CSS keyframes only.
- No video, Three.js, WebGL, or animation dependency was added.
- The existing reduced-motion handling disables decorative animation.

## Rollback

Rollback is simple: revert the single Patch 130B-R4 commit.

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
