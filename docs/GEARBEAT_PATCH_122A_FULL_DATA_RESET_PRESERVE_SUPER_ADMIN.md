# GearBeat V2 Runbook — Full Data Reset & Preserve Super Admin

This document defines the technical execution plan, safety procedures, and local scripts developed for **Patch 122A** to perform a comprehensive data cleanup, purging all demo/user accounts and application transactional data while strictly preserving the Super Admin identity and associated records.

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Clear all existing test entries, demo users, bookings, rewards, and transactional logs to enable clean, full-journey self-testing by the platform founders.
*   **Verification Status**: 
    *   **TypeScript Verification**: `PENDING` (Running type check shortly).
    *   **Next.js Production Build**: `PENDING` (Running production build verification shortly).
*   **Invite-Only Pilot Readiness Status**: **GO FOR INVITE-ONLY PILOT PREPARATION**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Sovereign Compliance Disclaimer**:
> Manual settlement and payment boundaries remain documented for pre-launch review only. No live payment, SAMA-certified checkout, or commercial payment activation is approved in this phase.

---

## 2. Technical Reset Script Architecture

The local reset utility has been safely implemented inside the standalone operational script:
[scripts/ops/reset-self-test-data.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/scripts/ops/reset-self-test-data.ts)

It is powered by standard npm execution scripts in [package.json](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/package.json):
*   `npm run ops:reset-self-test:dry-run` — Counts and logs what would be deleted.
*   `npm run ops:reset-self-test:execute` — Executes deletions only when fully authorized.

### Key Safety Safeguards
1.  **Super Admin Preservation**: The script fetches the list of all auth users first and verifies that the `SUPER_ADMIN_EMAIL` matches an existing account. If not found, it aborts instantly. The Super Admin auth record, profile row, and role mapping are completely filtered out of all deletions.
2.  **Required Environmental Safeguards**: The script will halt immediately if any of these are missing:
    *   `SUPER_ADMIN_EMAIL`
    *   `SUPABASE_URL`
    *   `SUPABASE_SERVICE_ROLE_KEY`
3.  **Strict Execute Confirmation**: Running in `--execute` mode will crash by design unless `CONFIRM_RESET=GEARBEAT_FULL_RESET` is explicitly supplied in the execution shell environment.
4.  **Graceful Table Resilience**: Rather than hard-crashing if certain tables are not present (due to staging/local schema differences), the script checks table metadata and logs a clean notice before moving to the next.

---

## 3. Storage Bucket Cleanup Plan

During active usage, providers and customers upload document assets, avatars, and cover media. Public brand assets must remain untouched at all times.

### A. Bucket Classifications
*   📁 **`brand-assets`** *(Public / Read-Only)*: Logos, banner SVGs, gold badges. **DO NOT DELETE. MUST PRESERVE.**
*   📁 **`user-uploads`** *(Writable)*: Customer avatars, profile banners. **TARGET FOR PURGING.**
*   📁 **`provider-documents`** *(Private / Writable)*: Onboarding licenses, CR files, certifications. **TARGET FOR PURGING.**
*   📁 **`studio-images`** *(Public / Writable)*: Room photographs, equipment gallery images. **TARGET FOR PURGING.**

### B. Storage Deletion Execution Plan (Manual Approval Required)
To keep database operations separate from object storage, storage deletions are not executed automatically. When approved, storage objects inside the purgeable buckets can be cleared manually via the Supabase Dashboard, or by executing the following administrative Storage API lines:

```typescript
// Safe batch removal template for 'user-uploads'
const { data: files } = await supabase.storage.from('user-uploads').list();
if (files && files.length > 0) {
  const filePaths = files.map(f => f.name);
  await supabase.storage.from('user-uploads').remove(filePaths);
}
```

---

## 4. Operational Deletion Execution Commands

### Phase A: Dry-Run Auditing (Safe)
Execute this command first to verify the counts of targeted users and public table rows:

```bash
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="ey..."
npm run ops:reset-self-test:dry-run
```

### Phase B: Execute Deletion (High Stakes)
Run this command *only* when authorized and ready to wipe all non-admin data:

```bash
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="ey..."
$env:CONFIRM_RESET="GEARBEAT_FULL_RESET"
npm run ops:reset-self-test:execute
```
