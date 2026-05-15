# Patch 103D — QA Release Checklist + Investor Demo Script

## 1. 4-Agent Sprint Release Checklist
To ensure the integrity of the GearBeat V2 ecosystem (Web + Mobile), each agent workstream must confirm the following before the final merge:

- **[ ] Agent 1 (Mobile UX/Stability)**:
    - [ ] WebView correctly appends `?app=1` to all requests.
    - [ ] Android Hardware Back Button correctly triggers `canGoBack()` in the WebView.
    - [ ] Pull-to-refresh activity indicator matches the #D4AF37 (Gold) theme.
    - [ ] App correctly handles external links by opening them in the native browser.
- **[ ] Agent 2 (Frontend/Discovery)**:
    - [ ] "Ask GearBeat" AI Chips are present on all discovery verticals (Marketplace, Studios, Academy).
    - [ ] Smart Filters correctly map to the Unified Discovery Taxonomy.
    - [ ] RTL (Arabic) support is verified for all new discovery layouts.
- **[ ] Agent 3 (Backend/Security)**:
    - [ ] RLS policies are enabled for all new tables (Settlements, Cart Items).
    - [ ] `manual-confirm` API route is restricted or decommissioned for non-admin users.
    - [ ] Schema drift from `seed.sql` has been identified and scheduled for migration.
- **[ ] Agent 4 (Ops/QA)**:
    - [ ] Investor/Government Readiness Pack is finalized and pushed.
    - [ ] All PRs have the "Agent X —" prefix and clear descriptions.
    - [ ] No `.env` or production secrets are committed in the history.

---

## 2. PR Merge Order Checklist
To prevent deployment failures or schema conflicts, PRs must be merged in this sequence:
1. **[Core/Data] Agent 3**: Database schema, RLS, and security hardening.
2. **[Logic/UI] Agent 2**: Web application features and discovery engine UI.
3. **[Mobile] Agent 1**: Mobile App Mirror/WebView updates.
4. **[Governance] Agent 4**: Final documentation and readiness packs.

---

## 3. Vercel Ready Verification Checklist
- [ ] **Environment Variables**: Verify `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `RESEND_API_KEY`.
- [ ] **Build Validation**: Run `npm run build` locally to ensure no TypeScript or Linting errors.
- [ ] **Middleware**: Confirm that the Auth Middleware correctly redirects unauthenticated users from protected routes (e.g., `/admin`).
- [ ] **Analytics**: Verify that the GA4 / Clarity foundation scripts are loading correctly.

---

## 4. Demo Verification Checklist

### 4.1 Mobile App (Expo)
- [ ] App starts successfully with `npx expo start --tunnel`.
- [ ] Hidden environment switcher appears after 5x tap on top-right corner.
- [ ] Loading screen shows the GearBeat Logo on a dark background.

### 4.2 Public Web
- [ ] Home page "Hero" section is responsive and matches luxury branding.
- [ ] "Ask GearBeat" chips lead to the correct filtered discovery state.
- [ ] "GearBeat Certified" badges are visible on studio cards.

---

## 5. Investor Demo Script (Home → Mobile)

### Step 1: The Unified Home (Vision)
- **Action**: Load `gearbeat.app`.
- **Narration**: "GearBeat V2 is more than a marketplace; it's a unified ecosystem. Notice the luxury identity and the 'Ask GearBeat' entry point, which represents the future of AI-driven creative discovery."

### Step 2: Studio Booking (Reliability)
- **Action**: Navigate to `/studios`. Select a studio.
- **Narration**: "Our booking engine is atomic and real-time. The 'GearBeat Certified' badge ensures investors and users that these spaces are vetted for professional standards."

### Step 3: Marketplace (Commerce)
- **Action**: Navigate to `/marketplace`. Browse gear.
- **Narration**: "We integrate commerce directly. Users can book a studio and rent the necessary gear in a single, seamless flow."

### Step 4: Academy (Growth)
- **Action**: Navigate to `/academy`.
- **Narration**: "The Academy vertical completes the loop by offering workshops and skill development, ensuring our community stays at the cutting edge of the industry."

### Step 5: Mobile Experience (Accessibility)
- **Action**: Open the Mobile Mirror app on a phone/emulator.
- **Narration**: "Finally, we bring the entire experience to the user's pocket. This native-feeling shell provides the same luxury experience with mobile-optimized navigation and performance."

---

## 6. Demo & Government Wording Boundaries

### ⚠️ What MUST NOT be claimed (Strict Boundaries)
- **DO NOT CLAIM**: "Payments are live and processing millions." (Fact: We are in manual/deferred testing mode).
- **DO NOT CLAIM**: "Our AI is a fully autonomous reasoning engine." (Fact: It is currently a UI/UX-governed discovery layer).
- **DO NOT CLAIM**: "We are officially launched for public commerce." (Fact: We are in a Private Pilot/Registration phase).

### ✅ Approved Wording for Submissions
- "GearBeat V2 is a **Digital Marketplace Foundation** currently in the Private Pilot stage."
- "The platform utilizes a **Governed AI Discovery Layer** to facilitate smart searching."
- "The ecosystem is **Technically Ready** for regional payment provider activation."

---

## 7. Go/No-Go Checklist (Next Sprint)
- [ ] **Go**: If all PRs pass automated tests and Agent 4 Readiness Pack is approved.
- [ ] **Go**: If legal/government registration documentation is submitted.
- [ ] **No-Go**: If `manual-confirm` security loophole remains unpatched.
- [ ] **No-Go**: If the mobile WebView fails to load the production URL correctly.
