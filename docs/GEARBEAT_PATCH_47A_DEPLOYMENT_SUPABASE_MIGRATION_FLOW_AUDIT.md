# GEARBEAT PATCH 47A — DEPLOYMENT & SUPABASE MIGRATION FLOW AUDIT

## 1. Overview
This audit investigates the current deployment pipeline of GearBeat V2 to identify why critical SQL migrations (e.g., the atomic booking RPC) are not being applied to the production Supabase database automatically upon merging to the `main` branch.

## 2. Current Deployment Architecture

### A. GitHub to Vercel (Application Layer)
- **Status:** **Connected & Automated.**
- **Flow:** Merges to the `main` branch trigger a Vercel Production deployment.
- **Scope:** This process builds and deploys the Next.js application, including Edge Functions and API routes.
- **Configuration:** Managed via native Vercel-GitHub integration.

### B. GitHub to Supabase (Database Layer)
- **Status:** **Disconnected & Manual.**
- **Flow:** SQL files are committed to `supabase/migrations/` but are **never executed** against the production database by any automated process.
- **Gap:** There is no CI/CD pipeline (GitHub Actions or Vercel Build Hooks) configured to interact with the Supabase Management API or the Database.

## 3. Audit Findings

### CI/CD Configuration
- **GitHub Actions:** No `.github/workflows/` directory exists. There are no automated scripts to handle database schema changes.
- **package.json:** No scripts are defined for `supabase db push` or `migration up`.
- **vercel.json:** The configuration is limited to Cron jobs and does not contain build-time database hooks.

### Supabase CLI Integration
- **Config:** No `supabase/config.toml` exists in the repository. The project is not officially "linked" via the Supabase CLI in a way that supports standard migration tracking.
- **State:** The `supabase/migrations/` folder is used as a local archive rather than a managed migration history.

### Root Cause of Missing RPC
The production Supabase database was missing the `create_studio_booking_v1` RPC because **merging a SQL file into the repository does not apply it to the database.** 
- Patch 42B1 was merged into the code but the SQL remained unexecuted in production.
- Patch 46D2 was merged into the code, creating a dependency on an RPC that did not exist in the production environment.

## 4. Risks of Current Setup
- **System Downtime:** Application code (Next.js) that depends on new SQL functions will fail in production until a developer manually executes the SQL.
- **Data Inconsistency:** Manual execution of SQL is prone to human error, including skipping files or executing them in the wrong order.
- **Environmental Drift:** The "Source of Truth" in GitHub (migrations folder) becomes desynchronized from the actual state of the Production database.

## 5. Recommended Process

### Immediate (Manual Corrective Action)
Developers must follow a manual "SQL Execution Plan" using the Supabase Dashboard SQL Editor for every patch involving database changes.

### Short-Term (Documentation)
Update the internal development workflow to explicitly state:
> [!IMPORTANT]
> Merging SQL files to `main` WILL NOT update the production database. All SQL changes must be manually applied to the Supabase Production project SQL Editor.

### Long-Term (Automation)
1. **Initialize Supabase CLI:** Link the repository to the Supabase Project ID.
2. **GitHub Actions:** Create a `.github/workflows/deploy-migrations.yml` that runs `supabase db push` using the `SUPABASE_ACCESS_TOKEN` and `DB_PASSWORD`.
3. **Migration Tracking:** Use the `supabase_migrations.schema_migrations` table to automatically track which patches have been applied.

## 6. Implementation Guardrails

### Files Likely Needed for Future Automation:
- `.github/workflows/supabase-deploy.yml`
- `supabase/config.toml`

### Must Not Touch:
- Core payment provider logic.
- RLS policies (without a specific security audit).
- Auth/OTP flows.
