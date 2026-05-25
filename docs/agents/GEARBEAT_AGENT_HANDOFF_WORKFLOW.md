# GearBeat Agent Handoff Workflow

This document details the workflow routes, handover responsibilities, and proof validation requirements for agent collaboration. Following these instructions ensures smooth task execution without crossing architectural boundaries.

---

## 1. Collaborative Handover Pathways

Depending on the feature being developed, use one of the two primary handover paths:

### Pathway A: Visual / UI-First (Antigravity First)
Use this pathway when building features that require visual design, styling, layout shifts, or customer-facing pages.

```
  Step 1: ChatGPT (Product Director) -> Write Design Brief (visual specs, styling, copy)
  Step 2: Antigravity (UI Implementer) -> Create layouts, write CSS, position boxes
  Step 3: Codex (Senior Engineer) -> Add TS typings, hook up state triggers, bind api data
  Step 4: Antigravity (Visual QA) -> Run LTR/RTL and mobile-viewport validation tests
```

### Pathway B: Backend / Logic-First (Codex First)
Use this pathway when implementing database migrations, API changes, authentication flows, or payment hooks.

```
  Step 1: ChatGPT (Product Director) -> Define technical data specs & security rules
  Step 2: Codex (Senior Engineer) -> Write migrations, schema typings, and API routes
  Step 3: Antigravity (UI Implementer) -> Build components bound to new API contracts
  Step 4: Codex (PR / Diff Reviewer) -> Run build check, TypeScript verification, lint check
```

---

## 2. ChatGPT's Role: Design Brief & Patch Contract

Every work ticket passed to either agent must begin with a clear setup created by ChatGPT:
*   **The Design Brief**: Details colors, layout structures, copy assets, and responsive parameters (essential for Antigravity UI Implementer).
*   **The Patch Contract**: Lists modified files, prohibited paths, security boundaries, and target APIs (essential for Codex Senior Engineer).

---

## 3. The Final Proof Block

Before any agent can mark a task as complete and request human verification, they must append a **Final Proof Block** to their final report. This block must include:

```markdown
### Final Proof Block

- **Active Branch**: [Insert active branch name]
- **Target Files Created**:
  - [List of paths relative to root]
- **Target Files Modified**:
  - [List of paths relative to root]
- **Prohibited Files Untouched**: [Yes/No]
- **Command Output (Run Build/Check)**:
  ```bash
  [Insert terminal output here (e.g., git status --short, npm run build)]
  ```
- **Bilingual and Responsive Visual Check**: [Pass/Fail/Not Applicable]
```
