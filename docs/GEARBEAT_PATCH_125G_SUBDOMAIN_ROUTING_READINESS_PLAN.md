# GEARBEAT PATCH 125G — SUBDOMAIN ROUTING READINESS PLAN

This document outlines the architectural plan, safety boundaries, risks, and phases for implementing subdomain routing within the unified GearBeat Next.js deployment.

---

## 1. Target Subdomains

To organize user experiences, restrict access vectors, and establish clean domains, we target the following DNS mapping structure:

* **`gearbeat.app`**: Public client website, landing pages, searches, bookings, and customer profiles.
* **`admin.gearbeat.app`**: Internal Platform Administration and Command Center.
* **`partners.gearbeat.app`**: Unified Partner application intake pipeline.
* **`portal.gearbeat.app`**: Approved Studio Owner dashboard and manager consoles.
* **`seller.gearbeat.app`**: Approved Merchant/Seller inventory and order consoles.
* **`providers.gearbeat.app`**: (Future) Service Provider mixing/mastering dashboard.
* **`instructors.gearbeat.app`**: (Future) Academy sound instructors dashboard.
* **`organizers.gearbeat.app`**: (Future) Live events and ticketing dashboard.

---

## 2. Same-Project Routing Map

Next.js will handle incoming hosts dynamically within the same deployment to keep development overhead low and code unified:

* `admin.gearbeat.app/*` ➔ Rewritten internally to `/admin/*`
* `partners.gearbeat.app/*` ➔ Rewritten internally to `/partners/apply/*`
* `portal.gearbeat.app/*` ➔ Rewritten internally to `/portal/*` (Studio Owner Portal)
* `seller.gearbeat.app/*` ➔ Rewritten internally to `/vendor-pending` or `/vendor-store` (Seller Portal)
* `gearbeat.app/*` ➔ Serves normal client/customer routes (root, `/studios`, `/gear`, `/support`).

---

## 3. Required Future Technical Stack

To implement this routing robustly, the following technical components must be configured:

* **Next.js Middleware Host-Based Routing:** 
  Utilize edge middleware (`middleware.ts`) to extract `request.headers.get("host")` and rewrite path requests using `NextResponse.rewrite` before routing gets resolved.
* **Vercel Domain Aliases:**
  Map wildcard domains (`*.gearbeat.app`) or individual subdomain aliases explicitly to the active production Vercel project deployment.
* **Cloudflare DNS Configuration:**
  Create CNAME or A records for subdomains (e.g., proxied or DNS-only) pointing to Vercel CNAME targets.
* **SSL Readiness:**
  Configure wildcard SSL certificates via Let's Encrypt (automatic on Vercel) or manage SSL edge rules directly on Cloudflare.
* **SEO & Canonical URLs:**
  Render dynamic `<link rel="canonical" href="..." />` tags to prevent crawler indexing loops on admin or private portals across duplicated hosts.

---

## 4. Authentication Boundaries

* **Customer Auth:** Login stays confined to `gearbeat.app/login`. Sessions are strictly bound to `gearbeat.app`.
* **Admin/Operator Auth:** Accessed strictly via `admin.gearbeat.app/login` or `/admin/login`. Admins cannot access controls from other domains.
* **Partner/Studio Auth:** Login targets `portal.gearbeat.app/login`.
* **Seller Auth:** Login targets `seller.gearbeat.app/login`.
* **Operator Signups:** Public operator signup is disabled entirely. All operator accounts are provisioned via administrative seeding.

---

## 5. Safety & Rollout Phases

1. **Phase 1: Architecture Mapping & Plan (Current)** — Map subdomains, routes, and risks.
2. **Phase 2: DNS & Cloudflare/Vercel Verification** — Configure aliases, SSL, and ensure target domains route traffic to our server project.
3. **Phase 3: Middleware Routing MVP** — Introduce a safe rewrite controller in `middleware.ts` for a single domain (e.g. `admin.*`) before rolling it out universally.
4. **Phase 4: Session & Cookie Auditing** — Validate Supabase Auth cookies across subdomains (configuring `cookieOptions.domain` as `.gearbeat.app` to share tokens securely where allowed, or enforcing host-only cookies for maximum isolation).
5. **Phase 5: Canonical Cleanup** — Verify indexing blocks (`robots.txt` and search console settings) for private portals.

---

## 6. Risks & Blockers

* **Auth Cookie Domain Leakage/Inaccessibility:** Enforcing `.gearbeat.app` domain sharing enables cross-subdomain sessions but introduces potential CSRF or token leakage risks if client subdomains are compromised. Alternatively, keeping them host-isolated requires logging in separately on each portal.
* **Infinite Redirect Loops:** Bad rewrite rules matching relative redirects from layout guards can cause circular loops between middleware rewrites and route redirects.
* **Duplicate SEO Indexing:** Search engines indexing private dashboards or admin panels under public links.
* **Access Control Vulnerability:** Staff accessing admin interfaces if the host header can be spoofed or rewritten improperly.

---

## 7. Manual Checklist Before Implementation

- [ ] Confirm domains are successfully verified and mapped inside the Vercel dashboard.
- [ ] Confirm DNS records (CNAME/A) are active in Cloudflare with SSL validation active.
- [ ] Confirm edge middleware is tested locally using custom hosts (e.g. `admin.localhost`).
- [ ] Confirm authentication cookies are configured with the appropriate domain boundaries.
- [ ] Confirm robots.txt blocks crawlers from indexing `admin.*`, `portal.*`, and `seller.*`.
- [ ] Confirm no administrative routes are exposed to the main client domain under any path.

---

## 8. Next Planned Patch

* **Patch 125H — Same-Project Subdomain Routing MVP**: Build the edge middleware rewrite system and test with a simulated subdomain.
