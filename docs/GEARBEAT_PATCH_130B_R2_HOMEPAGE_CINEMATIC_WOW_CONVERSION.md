# Patch 130B-R2 - Homepage Cinematic WOW Conversion

## Why R2 Was Needed

Patch 130B was rejected because the homepage still felt too flat, card-heavy, and conventional. R2 starts again from the restored old homepage and rebuilds the visual presentation around a stronger cinematic conversion journey.

## Visual Changes

- Rebuilt the homepage hero into a full dark studio atmosphere with layered gold lighting.
- Added the approved emotional headline: "Book the space. Buy the gear. Create the sound."
- Added the Arabic hero line: "احجز المكان، اشترِ المعدات، وابدأ الإبداع"
- Added stronger CTA buttons for studio booking and marketplace exploration.
- Added a large animated gold sound-wave ribbon across the hero.
- Integrated a glowing pulse orb into the wave system so the visual feels connected and alive.
- Reworked pathway, studio, gear, trust, ecosystem, and final CTA sections around larger cinematic surfaces instead of flat grids.

## WOW / Cinematic Design Decisions

- Used fewer, larger visual surfaces with deeper lighting and stronger hierarchy.
- Made the hero the main first-3-seconds impression.
- Replaced small generic cards with angled/depth-based pathway panels and immersive preview panels.
- Added gold shimmer only to the key hero phrase.
- Used dark glass, royal-gold borders, radial glow, and soft shadows to keep the GearBeat identity premium.

## Conversion Journey Notes

The homepage now guides visitors through:

1. Immediate emotional positioning in the hero.
2. Clear actions to book studios or explore marketplace products.
3. Four premium pathways: Book Studios, Marketplace, Certified Studios, Rewards.
4. Studio preview panels that invite browsing before booking.
5. Gear discovery panels that invite marketplace exploration.
6. Trust and safety strip using safe non-overclaiming language.
7. Final account/support CTA.

## Motion Details

- CSS keyframes only.
- No Three.js.
- No WebGL.
- No video background.
- No animation library.
- Motion includes:
  - sound-wave movement
  - pulse orb breathing
  - subtle floating cards
  - hover glow
  - fade-up section entrance
  - key gold text shimmer
- `prefers-reduced-motion: reduce` disables decorative animations.

## Mobile Behavior

- Mobile layout stacks cleanly with headline first, then the connected orb/wave visual, then CTAs.
- CTAs become full-width tap targets.
- Cards collapse to single-column layouts.
- The Arabic hero line is constrained to reduce awkward wrapping.
- Motion remains lightweight because it uses CSS-only primitives.

## Rollback Method

This patch is designed to be rollback-friendly by reverting the single Patch 130B-R2 commit.

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
