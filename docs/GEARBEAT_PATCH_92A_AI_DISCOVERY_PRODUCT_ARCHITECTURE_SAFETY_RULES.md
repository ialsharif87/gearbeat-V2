# Patch 92A — AI Discovery Product Architecture & Safety Rules

## 1. Executive Summary
This document defines the **AI Discovery Architecture** and **Safety Framework** for GearBeat V2. The AI Discovery layer is designed to act as an intelligent concierge that simplifies complex filtering across Studios, Marketplace, Services, and Academy. This framework ensures that any future AI implementation adheres to strict data-integrity and anti-hallucination rules.

**Final Verdict**: **AI DISCOVERY ARCHITECTURE READY — NO LIVE AI IMPLEMENTATION YET**.

---

## 2. AI Discovery Role
The AI concierge is a **natural language interface** to the existing GearBeat product catalog.
- **Goal**: Reduce "filter fatigue" by converting complex user intent (e.g., "I need a vintage-sounding studio in Riyadh with a Neve console for under $200/hr") into precise database queries.
- **Positioning**: Assistive discovery, not a replacement for manual browsing or expert human support.

---

## 3. Supported Verticals & Intent Mapping

### 3.1 Verticals
- **Studios**: Booking availability, equipment list, location, and tier.
- **Marketplace**: Verified gear, category, price range, and shipping status.
- **Services**: Specialized audio services (Mixing, Mastering, Session Musicians).
- **Academy**: Masterclasses, workshops, and certified instructor sessions.
- **Tickets**: Exclusive industry event access.

### 3.2 User Intent Examples
- "Show me high-end microphones available for shipping to Jeddah."
- "Find a mixing engineer specialized in Analog hardware."
- "Are there any Neve-based studios in the UAE for a weekend session?"

---

## 4. Safety & Anti-Hallucination Rules

### 4.1 Data-First Constraint
- **Rule 1**: AI must NEVER claim a product, studio, or service exists if it is not in the GearBeat verified database.
- **Rule 2**: AI must NEVER generate fake prices, fake availability dates, or fake ratings.
- **Rule 3**: If data is missing (e.g., a studio hasn't listed its monitors), the AI must state "Specific monitor details not listed" rather than assuming.

### 4.2 Fallback Disclaimer
- When responding to general audio questions (e.g., "How do I mic a drum kit?"), the AI must include a disclaimer: *"This is general advice. For professional session planning, we recommend booking a GearBeat Certified Studio."*

### 4.3 Transactional Blockers
- **Rule 4**: AI must NEVER authorize a booking or payment directly. It must provide a link to the official GearBeat Checkout/Booking flow.

---

## 5. Technical Readiness Requirements

### 5.1 Required Data Fields (Pre-Launch)
- **Vector Metadata**: Descriptive tags for studios (e.g., "Warm," "Vintage," "Modern").
- **Equipment Standardization**: Canonical names for gear to prevent "Neve 1073" vs "1073 Preamp" confusion.
- **Location Geocoding**: Precise coordinates for proximity-based discovery.

### 5.2 Future Infrastructure
- **Vector DB Integration**: For semantic similarity (e.g., "Find me a sound like Studio X").
- **LLM Guardrails**: Middleware to filter out non-audio-related queries.
- **Admin Feedback Loop**: Dashboard for admins to review and correct AI discovery paths.

---

## 6. Prohibitions & Constraints
- **NO LIVE AI SDK**: No packages (OpenAI, Anthropic, LangChain) may be added in this patch.
- **NO API KEYS**: No production or sandbox AI keys may be committed.
- **NO BACKEND ROUTES**: No `/api/ai` or similar discovery routes may be created.
- **NO DATABASE MUTATION**: The AI architecture is strictly read-only for discovery.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only product architecture and safety framework.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
