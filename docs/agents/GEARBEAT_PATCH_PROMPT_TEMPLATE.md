# GearBeat Patch Prompt Template

To maintain high-quality communication and context when passing tasks between agents (ChatGPT, Antigravity, Codex), use the following standardized prompt template. It ensures clear boundaries, exact constraints, and clear verification steps.

---

## The Standardized Patch Prompt Template

Copy the structure below when requesting code or documentation modifications:

```markdown
# Patch [ID] — [Feature/Patch Title]

## 1. Task Objective
Provide a 1-2 sentence description of the goal. Explain the business value and target outcomes clearly.

## 2. File Constraints & Target Locations
*   **Create Only**: List files that are allowed to be created.
*   **Modify Only**: List files that are allowed to be changed.
*   **DO NOT TOUCH**: Explicit list of files/directories that must remain unchanged (e.g., auth, DB, payments, env).

## 3. Visual & Styling Specifications
*   **Aesthetics**: Define design constraints (e.g., dark theme, gold accents, sound-wave assets).
*   **Layout & Responsive**: Detail mobile-first breakpoints, padding sizes, and expected alignment rules.
*   **Bilingual (RTL/LTR)**: Outline direction requirements, mirroring expectations, and Arabic/English label details.

## 4. Technical & Security Boundaries
*   Define the role division:
    *   **Antigravity (Frontend)**: Only modifies layout structure, styling, copywriting, and visual assets.
    *   **Codex (Backend)**: Handles logic, routing, TS compiler errors, SQL migrations, and RLS policies.
*   Provide security instructions (e.g., "Must check RLS policies are enabled," "No exposure of API secrets").

## 5. Copywriting Guidelines
*   Provide Arabic/English copy mapping.
*   Enforce the "no unsupported claims" rule.

## 6. Verification Steps
*   List automated checks to run (e.g., `npm run build`, linting).
*   List manual testing steps (e.g., testing tap targets on mobile layouts, auditing RTL text rendering in browser views).
```

---

## Handover Instructions for Agents

When handing over tasks between agents, follow this protocol:
1.  **Summarize work completed**: Explicitly state which files were created/modified and what changes were made.
2.  **Highlight findings/blockers**: If Codex encounters a design bug or Antigravity encounters an API schema mismatch, detail the error log or layout issue.
3.  **Define next steps**: Explicitly state what the next agent (or the user) needs to do.
4.  **Confirm repository cleanliness**: Report `git status` and a list of modified files to ensure zero stray edits.
