# GearBeat Mobile Preview QA Guide

This document outlines the procedures for previewing and verifying the GearBeat Mobile Mirror app.

## 1. Running the Expo Preview

To start the mobile app preview:

1.  **Navigate to the mobile directory**:
    ```bash
    cd mobile
    ```
2.  **Start Expo with Tunneling**:
    Tunneling is recommended for remote access and to bypass complex network configurations.
    ```bash
    npx expo start --tunnel
    ```
    *Note: The first time you run this, you may be prompted to install `@expo/ngrok`.*

## 2. Accessing the App (QR / URL)

- **QR Code**: Once the server starts, a QR code will be displayed in your terminal. Scan this with the **iOS Camera** or the **Android Expo Go App**.
- **exp URL**: If the QR code is not visible, look for a URL starting with `exp://`. You can manually enter this URL into the Expo Go app.
- **Visual Verification**: The app should show a premium dark/gold **GEARBEAT** loading screen with a fade-in effect upon launch.
- **Troubleshooting**: Ensure your mobile device and computer have internet access. If the tunnel fails, try running with the `--clear` flag: `npx expo start --tunnel --clear`.

## 3. Testing Environments

The app supports multiple environments via a hidden switcher.

- **Default**: Loads `https://gearbeat.app?app=1` (Production).
- **Environment Switcher**: 
    1.  Tap the **top-right corner** of the app (near the status bar) **5 times** quickly.
    2.  A modal will appear allowing you to select between **Production**, **Preview**, or **Local**.
    3.  Select an environment to reload the WebView with the new URL.
    4.  The selection is persisted to local storage.

## 4. Feature Verification Checklist

### Android Back Button
- [ ] Navigate to a sub-page in the app.
- [ ] Press the hardware/system back button.
- [ ] **Expected**: The WebView should go back to the previous page.
- [ ] Navigate to the home page.
- [ ] Press the back button again.
- [ ] **Expected**: The app should minimize or exit (standard Android behavior).

### Pull-to-Refresh
- [ ] On any scrollable page, pull down from the top.
- [ ] **Expected**: A gold activity indicator should appear, and the page should reload.

### External Links
- [ ] Find an external link (e.g., social media icons, external support links).
- [ ] Tap the link.
- [ ] **Expected**: The link should open in the **native system browser** (Safari/Chrome), NOT inside the app's WebView.

## 5. Sprint 4 Readiness (Academy, Services, Tickets)

**Objective**: Verify the public UI layer for the Academy, Services, and Tickets verticals within the mobile WebView without executing live transactions or interacting with the backend.

### Academy Verification
- [ ] Navigate to `/academy` via the mobile app.
- [ ] Verify that the dark/gold UI styling renders correctly on mobile.
- [ ] Verify that "Ask GearBeat" (AI simulation) displays properly and doesn't break layout.
- [ ] **Blocked**: Live AI responses are disabled (no live LLM keys).

### Services Verification
- [ ] Navigate to `/services` via the mobile app.
- [ ] Verify mobile layout scaling for service categories and listings.
- [ ] Ensure external links to service provider social/contact open in the device's native browser.
- [ ] **Blocked**: Live booking and payment execution are disabled.

### Tickets Verification
- [ ] Navigate to `/tickets` via the mobile app.
- [ ] Verify mobile layout and event card styling.
- [ ] **Blocked**: Real ticket purchasing and database mutations are disabled.

### General Limitations
- **No Backend Mutations**: All testing must be limited to read-only UI verification.
- **No Live Payments**: Live gateways are blocked pending legal registration.
- **No Database Changes**: Database migrations and updates are strictly out of scope.

## 6. Sprint 5 Readiness (Full Customer Journey)

**Objective**: Verify the end-to-end customer journey across all verticals (Home, Studios, Marketplace, Services, Tickets, Academy) to ensure premium mobile UX and discovery flow.

### Customer Journey Verification
- [ ] **Home**: Verify Hero section, Search bar, and Featured categories scale correctly on mobile devices.
- [ ] **Studios**: Navigate to `/studios`. Verify filters, list view, and individual Studio profiles.
- [ ] **Marketplace**: Navigate to `/marketplace`. Verify product grid, category tabs, and Product detail pages.
- [ ] **Services**: Navigate to `/services`. Verify service type filtering and provider profile pages.
- [ ] **Tickets**: Navigate to `/tickets`. Verify event discovery cards and event detail layouts.
- [ ] **Academy**: Navigate to `/academy`. Verify course grid and lesson preview readability.

### Transactional & Interaction Blocks
- [ ] **Live Payments**: Stripe/Checkout interactions must remain in "Preview/Deferred" mode. No live credit card processing.
- [ ] **Live AI**: "Ask GearBeat" interactions are simulated or restricted. No live production LLM tokens should be consumed during this QA phase.
- [ ] **Data Mutations**: Booking, Order placement, and Ticket acquisition must NOT result in persistent database changes during public UI verification.

## 8. Customer Journey Readiness (Sprint 5 Addendum)

**Focus**: Premium discovery flow across all verticals.

### Core Journey Checks
- [ ] Verify header/footer navigation links in WebView.
- [ ] Verify "Ask GearBeat" discovery UI renders without layout shifts.
- [ ] Ensure all external checkout/support links route to native browser.

### Verified Vertical States
- [x] Home (Responsive Hero & Pulse)
- [x] Studios (Filter & Profile)
- [x] Marketplace (Grid & Detail)
- [x] Services (Listing & Provider)
- [x] Tickets (Event Cards)
- [x] Academy (Grid & Preview)

## 9. Sprint 6 Readiness (Trust, Legal, Support)

**Objective**: Verify that customers can easily locate and consume trust, legal, and support information within the mobile app shell.

### Accessibility & Readability
- [ ] **Footer Links**: Scroll to the bottom of any vertical. Verify that "Terms of Service", "Privacy Policy", and "Support" links are legible and reachable.
- [ ] **Support Landing**: Navigate to `/support`. Verify that the mobile layout for support categories and contact forms is optimized for small screens.
- [ ] **Legal Document Scaling**: Open a legal policy page (e.g., Privacy). Verify that the text scales correctly and remains readable without excessive horizontal scrolling.
- [ ] **Help Access**: Verify that FAQ or Help sections are navigable and that expanding/collapsing content works smoothly.

### Integrity & Safety Boundaries
- [ ] **No Live Claims**: Legal flows are for documentation and pilot verification only. No automated enforcement is active.
- [ ] **No Real-World Support Automation**: Contact forms and support triggers are in "Demonstration" mode. No live ticket system integration is active.
- [ ] **External Routing**: Any link to external legal resources or third-party support portals must open in the device's native browser.

## 10. Sprint 7 Readiness (Pilot Demo Journey)

**Objective**: Verify the full customer journey for the invite-only pilot demo (Investors/Government).

### Demo Journey Checklist
- [ ] **Discovery Flow**: Verify Home -> Studios -> Marketplace navigation.
- [ ] **Trust Flow**: Verify legal, support, and "Certified" trust markers.
- [ ] **Safe-Mode Verification**: Confirm that all transactional CTAs (Buy, Book, Enroll) are strictly in "Simulation/Deferred" mode.
- [ ] **Documentation**: See [GEARBEAT_AGENT_1_SPRINT_7_MOBILE_PILOT_DEMO_CHECKLIST.md](../docs/GEARBEAT_AGENT_1_SPRINT_7_MOBILE_PILOT_DEMO_CHECKLIST.md) for the detailed step-by-step checklist.

## 11. Brand Shell Polish (Patch 104A-FIX)

**Objective**: Verify the premium GearBeat branding across the mobile application shell components.

### Loading Screen Verification
- [ ] **Pulse Animation**: Verify the "GEARBEAT" logo text pulses smoothly during initial load.
- [ ] **Typography**: Confirm the gold/dark typography feels premium and matches the brand identity.
- [ ] **Fade In/Out**: Ensure the loading screen transitions smoothly without jarring flashes.

### Error Screen Verification
- [ ] **Visual Consistency**: Verify the "Connection Lost" screen uses the dark/gold palette.
- [ ] **User Experience**: Confirm the "Reconnect" button is prominent and functional.
- [ ] **Messaging**: Ensure the offline copy is professional and helpful.

## 12. Preview Build Workflow (Patch 104A-FIX2)

**Objective**: Verify the professional distribution and daily checking workflows.

### Script Verification
- [ ] **LAN Mode**: `npm run start:lan` starts the dev server and displays a local IP URL.
- [ ] **Tunnel Mode**: `npm run start:tunnel` starts the dev server via ngrok for remote access.
- [ ] **Clear Cache**: `npm run start:clear` resets the bundler state correctly.

### EAS Build Configuration
- [ ] **eas.json**: Verify that `eas.json` exists in the mobile root and contains `preview` and `production` profiles.

### Daily Sync Verification
- [ ] **Live Mirror**: Verify that a change made to the web production site (e.g. footer text) appears in the mobile app without a re-build.
- [ ] **Switcher Persistence**: Verify that the environment selection persists after closing and reopening the app.

## 13. Known Limitations
- **File Uploads**: Some complex file upload interactions might behave differently than on desktop.
- **Push Notifications**: Not implemented in this mirror phase.
- **Deep Linking**: Currently only supports basic `app=1` entry.
