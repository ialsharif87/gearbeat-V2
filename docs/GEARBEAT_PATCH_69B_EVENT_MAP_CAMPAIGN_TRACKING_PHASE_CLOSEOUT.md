# GearBeat Patch 69B — Event Map + Campaign Tracking + Phase 69 Closeout

## Patch Status

Patch 69B documents the event tracking map, campaign tracking structure, launch measurement plan, and Phase 69 closeout for GearBeat V2.

This patch is documentation/planning only.

No analytics scripts, cookies, environment variables, application code, API routes, backend logic, Supabase changes, SQL, RLS, authentication changes, server actions, package changes, or tracking implementation were added.

---

## Phase 69 Purpose

Phase 69 prepares GearBeat for launch measurement before soft launch, marketing campaigns, PR activity, creator campaigns, partner onboarding, and future paid acquisition.

The goal is to define what GearBeat should measure before implementing analytics tools such as:

- Google Analytics 4
- Google Search Console
- Microsoft Clarity
- Optional future PostHog

This phase does not activate tracking. It only defines the measurement structure and decision gates.

---

## Measurement Principles

GearBeat analytics must be built around business outcomes, not vanity metrics.

The core measurement goals are:

1. Understand how visitors move through public pages.
2. Measure intent to book studios.
3. Measure marketplace browsing and checkout intent.
4. Measure ticketing discovery interest.
5. Measure partner onboarding intent.
6. Track join studio and join seller conversion paths.
7. Measure support/contact demand.
8. Track legal/trust page engagement.
9. Attribute traffic from PR, creators, partners, and campaigns.
10. Prepare a clean analytics foundation before paid marketing.

---

## Event Naming Convention

Recommended format:

`gb_[area]_[action]`

Examples:

- `gb_home_cta_click`
- `gb_studio_card_click`
- `gb_booking_intent_click`
- `gb_marketplace_product_click`
- `gb_cart_intent_click`
- `gb_ticket_discovery_click`
- `gb_partner_cta_click`
- `gb_join_studio_start`
- `gb_join_seller_start`
- `gb_support_contact_click`
- `gb_legal_page_view`

Event names should remain:

- Lowercase
- English
- Snake case
- Stable over time
- Short but descriptive
- Not tied to temporary campaign names

---

## Recommended Global Event Parameters

Use these parameters where relevant:

- `source_page`
- `destination_page`
- `user_type`
- `item_type`
- `item_slug`
- `city`
- `category`
- `campaign`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `language`
- `flow_type`
- `cta_label`

Do not send sensitive personal data into analytics events.

---

## Public Homepage Events

### Event: `gb_home_cta_click`

Purpose:
Measure homepage conversion interest.

Recommended parameters:

- `source_page`: `/`
- `destination_page`
- `cta_label`
- `user_type`
- `language`

Example CTAs:

- Explore Studios
- Visit Marketplace
- Discover Tickets
- Become a Partner
- Join as Studio
- Join as Seller

---

## Studio Discovery Events

### Event: `gb_studio_card_click`

Purpose:
Measure which studio cards attract interest.

Recommended parameters:

- `source_page`: `/studios`
- `item_type`: `studio`
- `item_slug`
- `city`
- `category`
- `language`

### Event: `gb_studio_filter_intent`

Purpose:
Future event for filter usage once real filters are implemented.

Recommended parameters:

- `source_page`: `/studios`
- `city`
- `category`
- `language`

No real filter analytics should be implemented until filters are production-ready.

---

## Booking Intent Events

### Event: `gb_booking_intent_click`

Purpose:
Measure user intent to start a studio booking.

Recommended parameters:

- `source_page`
- `item_type`: `studio`
- `item_slug`
- `city`
- `cta_label`
- `language`

Important:
This event should only measure intent. It must not imply a paid booking unless real backend booking/payment source of truth exists.

---

## Marketplace Browsing Events

### Event: `gb_marketplace_product_click`

Purpose:
Measure product interest inside marketplace browsing.

Recommended parameters:

- `source_page`: `/marketplace`
- `item_type`: `product`
- `item_slug`
- `category`
- `language`

### Event: `gb_marketplace_category_click`

Purpose:
Measure category interest.

Recommended parameters:

- `source_page`: `/marketplace`
- `category`
- `language`

---

## Cart / Checkout Intent Events

### Event: `gb_cart_intent_click`

Purpose:
Measure cart or checkout interest without implying live payment.

Recommended parameters:

- `source_page`
- `destination_page`
- `item_type`
- `category`
- `language`

Important:
Until live payments are implemented, these events must be treated as intent-only.

No event should imply:

- Successful payment
- Completed order
- Confirmed checkout
- Automated refund
- Automated payout

---

## Ticketing Discovery Events

### Event: `gb_ticket_discovery_click`

Purpose:
Measure ticketing interest before real ticketing backend/payment activation.

Recommended parameters:

- `source_page`: `/tickets`
- `item_type`: `ticketing_experience`
- `category`
- `city`
- `language`

Ticketing events should remain discovery-only until ticketing inventory, payment, QR, and backend flows are implemented.

---

## Partner Onboarding Events

### Event: `gb_partner_cta_click`

Purpose:
Measure partner landing page conversion.

Recommended parameters:

- `source_page`: `/partner`
- `destination_page`
- `user_type`
- `cta_label`
- `language`

Potential user types:

- `studio_owner`
- `seller`
- `service_provider`
- `teacher`
- `event_organizer`

---

## Join Studio Events

### Event: `gb_join_studio_start`

Purpose:
Measure studio application intent.

Recommended parameters:

- `source_page`
- `destination_page`: `/join/studio`
- `user_type`: `studio_owner`
- `language`

### Event: `gb_join_studio_submit_intent`

Purpose:
Future event for form submission intent.

Important:
Only implement when form tracking is privacy-reviewed and does not expose sensitive application details.

---

## Join Seller Events

### Event: `gb_join_seller_start`

Purpose:
Measure seller onboarding intent.

Recommended parameters:

- `source_page`
- `destination_page`: `/join/seller`
- `user_type`: `seller`
- `language`

### Event: `gb_join_seller_submit_intent`

Purpose:
Future event for seller application submission intent.

Important:
Do not send commercial registration, document URLs, phone numbers, names, emails, bank details, or sensitive seller information to analytics.

---

## Support / Contact Events

### Event: `gb_support_contact_click`

Purpose:
Measure support/contact demand.

Recommended parameters:

- `source_page`
- `destination_page`
- `cta_label`
- `user_type`
- `language`

Use support events to identify confusion in:

- Booking
- Marketplace
- Ticketing
- Partner onboarding
- Legal policies
- Payment readiness

---

## Legal / Trust Engagement Events

### Event: `gb_legal_page_view`

Purpose:
Measure trust and policy engagement.

Recommended parameters:

- `source_page`
- `page_type`
- `language`

Legal/trust pages include:

- `/legal`
- `/legal/terms`
- `/legal/privacy`
- `/legal/booking-policy`
- `/legal/marketplace-policy`
- `/legal/ticketing-policy`
- `/gearbeat-certified`

---

## UTM Campaign Tracking Plan

GearBeat should standardize UTM usage before PR or marketing campaigns.

Recommended UTM structure:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Examples:

### PR Campaign

- `utm_source`: `press`
- `utm_medium`: `pr`
- `utm_campaign`: `soft_launch`
- `utm_content`: `article_name`

### Creator Campaign

- `utm_source`: `creator_name`
- `utm_medium`: `creator`
- `utm_campaign`: `certified_studio_launch`
- `utm_content`: `story_link`

### Partner Campaign

- `utm_source`: `studio_partner`
- `utm_medium`: `partner_referral`
- `utm_campaign`: `studio_onboarding`
- `utm_content`: `qr_stand`

### Paid Campaign

- `utm_source`: `google`
- `utm_medium`: `paid_search`
- `utm_campaign`: `studio_booking_launch`
- `utm_content`: `ad_variant_a`

---

## PR / Creator / Partner Campaign Readiness

GearBeat should measure:

- Traffic from PR articles
- Traffic from creator links
- QR scans from studio partner materials
- Studio profile visits from campaigns
- Booking intent clicks
- Join studio clicks
- Join seller clicks
- Support/contact clicks
- Legal/trust page visits
- Marketplace product interest
- Ticket discovery interest

Campaign dashboards should separate:

- Organic traffic
- PR traffic
- Creator traffic
- Partner referral traffic
- Paid traffic
- Direct traffic

---

## Launch Dashboard Planning

A future launch dashboard should include:

### Acquisition

- Total users
- New users
- Traffic by source
- Traffic by campaign
- Traffic by city where available
- Top landing pages

### Engagement

- Homepage CTA clicks
- Studio card clicks
- Marketplace product clicks
- Ticket discovery clicks
- Partner CTA clicks
- Legal/trust page visits

### Conversion Intent

- Join studio starts
- Join seller starts
- Booking intent clicks
- Cart/checkout intent clicks
- Support/contact clicks

### Trust Signals

- GearBeat Certified page visits
- Legal page visits
- Privacy page visits
- Booking policy visits
- Marketplace policy visits
- Ticketing policy visits

---

## Privacy / Legal Gate

Before implementing analytics, GearBeat must confirm:

- Whether cookie consent is required.
- Whether analytics tools set cookies.
- Whether user consent is required before loading scripts.
- Whether Privacy Policy language covers analytics usage.
- Whether user data is anonymized or minimized.
- Whether analytics events avoid personally identifiable information.
- Whether events avoid sensitive business document data.
- Whether future PostHog/session recording tools require additional consent.

No analytics implementation should be added until this gate is approved.

---

## Implementation Gate Before Future Tracking

Before adding GA4, Clarity, Search Console, or PostHog implementation:

1. Confirm final analytics stack.
2. Confirm privacy policy coverage.
3. Confirm cookie/consent requirements.
4. Confirm event naming convention.
5. Confirm which pages are in scope.
6. Confirm environment variable strategy if needed.
7. Confirm no sensitive data is sent.
8. Confirm production rollout plan.
9. Confirm QA plan.
10. Confirm explicit approval for implementation.

---

## Phase 69 Closeout Summary

Phase 69 established the analytics planning foundation for GearBeat launch measurement.

Completed Phase 69 patches:

- Patch 69A — Analytics Readiness + Measurement Plan
- Patch 69B — Event Map + Campaign Tracking + Phase 69 Closeout

Phase 69 prepared:

- Analytics stack recommendation
- Public conversion journeys
- Event naming structure
- Event parameter structure
- UTM campaign tracking plan
- PR / creator / partner measurement readiness
- Launch dashboard planning
- Privacy/legal implementation gate

---

## Explicit Non-Implementation Confirmation

Phase 69 did not add:

- Analytics scripts
- GA4 implementation
- Microsoft Clarity implementation
- Google Search Console verification
- PostHog implementation
- Cookies
- Consent banner
- Environment variables
- Application code changes
- Component changes
- API routes
- Server actions
- Backend changes
- Supabase changes
- SQL
- RLS
- Database tables
- Authentication changes
- Payment changes
- Package changes

---

## Next Recommended Phase

Next recommended phase:

Phase 70 — Soft Launch Pilot Execution System

Suggested first patch:

Patch 70A — Pilot Operations + Cohort Readiness

Recommended scope:

- Pilot cohort planning
- Studio/vendor/creator pilot readiness
- Support workflow readiness
- Feedback intake readiness
- Issue triage readiness
- Documentation/planning only unless explicitly approved otherwise
