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

## 9. Known Limitations
- **File Uploads**: Some complex file upload interactions might behave differently than on desktop.
- **Push Notifications**: Not implemented in this mirror phase.
- **Deep Linking**: Currently only supports basic `app=1` entry.
