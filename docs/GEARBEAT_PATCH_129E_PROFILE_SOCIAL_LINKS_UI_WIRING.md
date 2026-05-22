# Patch 129E - Profile Social Links UI Wiring

## Objective

Enable the existing `/profile` social links area to load and save customer social links through the Patch 129D customer API.

## UI Pages And Components Changed

- `app/profile/page.tsx`
  - Replaced the disabled social links placeholder with the wired social links client component.
  - Kept the existing profile identity/contact form behavior unchanged.

- `app/profile/ProfileSocialLinksClient.tsx`
  - Added the client-side social links editor for `/profile`.

## API Endpoint Used

- `GET /api/customer/social-links`
  - Loads the authenticated customer's saved links.

- `PUT /api/customer/social-links`
  - Saves the authenticated customer's social links.
  - Sends `{ links: [...] }` only.
  - Does not send or expose `user_id`.

## Supported Platforms

- Instagram
- TikTok
- X / Twitter
- YouTube
- LinkedIn
- Facebook
- Website

## UI Behavior

- Shows a loading state while links load.
- Shows editable URL fields for each supported platform.
- Shows per-link clear buttons when a field has a value.
- Allows clearing all links by saving with every field empty.
- Shows success and user-safe error states.
- Preserves Arabic and English labels/messages through the existing `T` component.
- Keeps the GearBeat dark/gold customer account card styling.

## Validation Alignment

The UI keeps the payload aligned with the API validation rules:

- Empty fields are ignored.
- Non-empty links must start with `http://` or `https://`.
- Each URL is capped at 300 characters.
- Each supported platform appears at most once.
- Optional handle data is not exposed in the UI yet and is sent as `null`.

## Safety Boundaries

- No API routes were edited.
- No backend implementation was changed.
- No migrations were edited.
- No SQL was executed.
- No Supabase CLI or Supabase MCP was used.
- No `.env` files were edited.
- No auth, payment, admin, partner, seller, booking, marketplace, or order logic was changed.

## Next Recommended Patch

Patch 129F should add a light end-to-end smoke checklist for profile social links after deployment, including save, clear, Arabic/English copy, and authenticated-only access checks.
