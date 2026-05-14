# Patch 97B — Smart Discovery API & Data Contract Planning

## 1. Executive Summary
This document defines the **Future API Data Contract** for the GearBeat Smart Discovery system. It establishes the request/response shapes required for the "Ask GearBeat" concierge and unified vertical search, ensuring architectural readiness without implementing live backend services.

---

## 2. API Data Contract (Proposed)

### 2.1 Discovery Request Shape
```json
{
  "query": "I need a podcast studio in Riyadh for 2 hours",
  "vertical": "studios",
  "filters": {
    "city": "Riyadh",
    "category": "podcast",
    "budget_range": "standard",
    "duration": 120
  },
  "lang": "en",
  "user_context": {
    "intent_type": "booking"
  }
}
```

### 2.2 Discovery Response Shape
```json
{
  "status": "success",
  "results": [
    {
      "id": "studio-abc-123",
      "title": "Riyadh Voice Hub",
      "category": "Podcast Studio",
      "price": 250,
      "price_unit": "hour",
      "rating": 4.8,
      "verified_status": "certified",
      "source_url": "/studios/riyadh-voice-hub",
      "ai_summary": "Highly rated for high-end podcasting and vocal isolation."
    }
  ],
  "intent_chips": ["Professional Mixing", "Vocal Booth", "24/7 Access"],
  "meta": {
    "source_grounding": "verified_internal_only",
    "readiness_level": "Ask GearBeat-Ready"
  }
}
```

---

## 3. Source-Grounding Rules
To prevent AI hallucinations and maintain GearBeat's luxury trust standards, the following rules are mandatory for the future API:

1. **Mapping to Source**: Every recommended item must correspond to a primary `id` in the GearBeat production database.
2. **No Generated Content**: The API must never generate names, prices, availability, or features that do not exist in the source record.
3. **Admin Verification**: Results must be filtered by `discovery_readiness_score >= 80` before being featured in Ask GearBeat.

---

## 4. API Behavior States
The future API must handle the following states gracefully:

- **Success**: Returns verified records with high confidence.
- **Partial Match**: Returns records matching > 50% of intent tags with a "Broad Match" warning.
- **Empty State**: Returns no records but provides "Next Best Action" (e.g., contact a concierge or broaden filters).
- **Incomplete Profile**: Excludes partners who have not met the "Discovery-Ready" completeness level.

---

## 5. Security & Compliance
- **Public-Safe Fields**: The API response must exclude sensitive partner data (PII, bank info, internal notes).
- **Rate Limiting**: Future implementations must include per-IP and per-user rate limiting to prevent taxonomy scraping.
- **RLS Integration**: All queries must inherit Supabase Row Level Security (RLS) to ensure data privacy.

---

## 6. Implementation Boundary
- **Planning Only**: This document is for architectural readiness.
- **No API Implementation**: No `route.ts` or controllers were created.
- **No Database Changes**: No migrations or schema updates are authorized in this patch.
- Build status is verified.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only API and data contract plan.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
