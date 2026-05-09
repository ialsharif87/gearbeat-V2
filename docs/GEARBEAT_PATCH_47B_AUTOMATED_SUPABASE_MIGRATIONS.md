# GEARBEAT PATCH 47B — AUTOMATED SUPABASE MIGRATIONS

## 1. Overview
This patch establishes an automated database migration pipeline for GearBeat V2. It implements a GitHub Actions workflow that automatically applies SQL migrations to the Production Supabase project whenever changes are merged into the `main` branch.

## 2. Infrastructure Changes

### GitHub Workflow: `.github/workflows/supabase-migrations.yml`
- **Trigger:** Executes only on pushes to `main` that include modifications to `supabase/migrations/**`.
- **Environment:** Runs on `ubuntu-latest` with Node.js 20.
- **Process:**
    1. Checks out the source code.
    2. Installs the Supabase CLI via `npx`.
    3. Links the repository to the production project using the `SUPABASE_PROJECT_ID`.
    4. Executes `supabase db push` to apply pending migrations.

## 3. Deployment Safety & Preflight
- **Preflight Check:** The workflow now includes a `supabase migration list` command before attempting to push. This ensures the CLI can successfully connect and authenticate before attempting any changes.
- **Migration History Dependency:** 
    > [!CAUTION]
    > This workflow relies on the presence and health of the `supabase_migrations.schema_migrations` table in production. If this table is missing or corrupted, `db push` may fail or result in duplicate execution attempts.
- **Initialization Requirement:** A one-time manual migration baseline/repair step is required if the production environment was previously managed without the Supabase CLI. 
- **Monitoring:** The first automated execution should be monitored closely to confirm the CLI correctly identifies the local-vs-remote delta.

## 4. Required GitHub Secrets
To enable this automation, the following repository secrets **must** be configured in the GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Source |
| :--- | :--- | :--- |
| `SUPABASE_ACCESS_TOKEN` | Personal Access Token for the Supabase account. | Supabase Dashboard > Account Settings > Access Tokens |
| `SUPABASE_PROJECT_ID` | The reference ID for the GearBeat production project. | Supabase Dashboard > Project Settings > General |
| `SUPABASE_DB_PASSWORD` | The database password set during project creation. | User-defined |

## 4. Safety & Security
- **No Secrets in Code:** The workflow uses GitHub Secrets for all sensitive keys.
- **Atomic Operations:** The workflow uses `db push`, which is the standard, non-destructive method for applying migrations in a remote environment.
- **Targeted Triggers:** The workflow will not run for application-only changes, saving CI/CD minutes and preventing unnecessary database checks.

## 5. Deployment Race Condition Note
> [!WARNING]
> **Vercel vs. Supabase Sync:** Vercel is currently configured to deploy application code automatically upon merging to `main`. This database workflow runs in parallel. 
> 
> There is a theoretical risk that Vercel completes its deployment **before** the Supabase migration finishes. If the new application code relies on a database function being added in the migration, users may experience transient errors for a few seconds. 
> 
> A future patch may consolidate both deployments into a single GitHub Action to ensure the database is updated before the application code is released.

## 6. Verification
- **YAML Syntax:** Verified against GitHub Actions standards.
- **Command Set:** Uses the official Supabase CLI pattern for headless migration deployments.
- **Build/Lint:** `npm run lint` and `npm run build` verify that these configuration files do not interfere with the application runtime.
