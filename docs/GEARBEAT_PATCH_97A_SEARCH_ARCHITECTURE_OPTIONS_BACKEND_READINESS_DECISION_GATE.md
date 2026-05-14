# Patch 97A — Search Architecture Options & Backend Readiness Decision Gate

## 1. Executive Summary
This document outlines the **Future Search Architecture Options** for GearBeat V2, establishing a decision gate for the transition from presentational UI to a functional, data-driven Smart Discovery system. It ensures that any backend implementation adheres to strict safety, cost, and data-fidelity constraints.

---

## 2. Search Architecture Options

| Option | Name | Description | Data Dependency | UX Impact |
| --- | --- | --- | --- | --- |
| **A** | **Legacy Filters** | Basic PostgreSQL `WHERE` clauses on existing fields. | Low | Functional but rigid. |
| **B** | **Structured Discovery** | Tag-based filtering using the unified `ai_tags` JSONB. | High (Taxonomy) | Fast, relevant, guided. |
| **C** | **Hybrid Search** | Option B + basic full-text search (pg_trgm). | Medium | Handles typos/keywords. |
| **D** | **Vector Search** | Semantic search using embeddings (pgvector). | Very High | "Vibe-based" search. |
| **E** | **Ask GearBeat (AI Layer)** | LLM-powered intent parsing + Option B/C results. | Elite (Verified) | Premium Concierge. |

---

## 3. Recommended Staged Roadmap

### Stage 1: Structured Data Foundation (Current Phase)
- Implement Admin/Partner tagging UI (Planned in Phase 96).
- Populate the database with verified taxonomy tags.
- **Goal**: Zero fake claims, 100% verified internal data.

### Stage 2: Backend Search Service
- Create a unified search endpoint that accepts intent chips as parameters.
- Implement "Rank by Trust" (Certified partners first).
- **Goal**: High-speed discovery without AI complexity.

### Stage 3: LLM Intent Parsing
- Integrate a stateless AI layer to translate natural language to Stage 2 filters.
- **Goal**: Functional "Ask GearBeat" concierge.

---

## 4. Prerequisites & Decision Gate
The transition to **Stage 2 (Implementation)** is **BLOCKED** until the following benchmarks are achieved:

1. **Taxonomy Completion**: > 80% of active listings must be at "Discovery-Ready" level.
2. **Ranking Rules**: Executive approval of the partner scoring and recommendation weights.
3. **Safety Protocol**: Final audit of the "No Hallucination" guardrails for LLM responses.
4. **Source Grounding**: Confirmation that the system *only* recommends internal verified records.

---

## 5. Prohibitions (Post-97A)
The following remains **STRICTLY PROHIBITED** until Stage 2 is formally approved:
- No AI API keys or SDKs in the production environment.
- No database migrations for vector search or new search indices.
- No backend search routes or API controllers.
- No fake price, stock, or availability claims.

---

## 6. Final Decision Gate Status
- **Current Verdict**: READY for architectural planning; NOT APPROVED for implementation.
- **Next Step**: Complete the data population phase before requesting backend implementation approval.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only architectural decision gate.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
