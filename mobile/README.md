# GearBeat Mobile Mirror App

Phase 101A — Foundation

This is an Expo-managed React Native application that serves as a premium mirror wrapper around the web experience.

## Features
- React Native WebView bridging the core GearBeat experience
- GearBeat themed dark/gold loading and error screens
- Pull-to-refresh functionality
- Native Android back button routing
- Opens external URLs (e.g., Stripe, social links) in native device browser
- Hidden environment switcher for QA (Top right corner tap x5)

## Requirements
- Node.js
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go App on your mobile device (or an Android/iOS emulator)

## Setup & Run

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Start the Expo development server (Choose a mode):
   ```bash
   npm run start:lan     # Recommended for local network (Fastest)
   npm run start:tunnel  # Use if local network is restricted
   npm run start:clear   # Use to reset cache if issues occur
   ```

3. Scan the QR code with your camera (iOS) or the Expo Go app (Android).

## Preview Build Workflow (EAS)

For persistent previewing without running a local dev server, use EAS to create an installable APK (Android):

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Build Preview APK**: `eas build --profile preview --platform android`
3. **Install**: Download the resulting APK to your Android device.

*Note: Expo Go is intended for local development only. For high-stakes investor or government demos, always use a compiled Preview Build.*

## Daily Web-Mirror Checking
Because the mobile app is a Mirror Shell, most daily changes to the website (styles, logic, copy) are reflected immediately in the mobile app without requiring a new mobile build.

**How to verify daily changes on mobile**:
1. Open the **installed GearBeat app** (or Preview APK) on your device.
2. The app automatically loads the production URL `https://gearbeat.app?app=1`.
3. If you need to check a non-production environment, use the **hidden environment switcher** (Tap top-right corner 5 times).

## Sprint 6 Readiness
The mobile app is ready for the Sprint 6 "Trust, Legal, & Support" demo, covering:
- **Support Access**: Mobile-optimized help and contact flows.
- **Legal & Compliance**: Responsive Terms, Privacy, and Policy readability.
- **Trust Indicators**: Footer and navigation accessibility for corporate info.
*Note: All support and legal flows are currently for demonstration only.*

## Sprint 7 Readiness
The mobile app is ready for the Sprint 7 "Pilot Demo" (Investors/Government), covering:
- **Full Discovery**: Home, Studios, Marketplace, Services, Tickets, Academy.
- **Trust & Legal**: High-fidelity mirror of legal and support portals.
- **Safe Mode**: All transactional triggers are simulated/deferred.
*Note: This is a read-only demo; no real payments, AI tokens, or DB writes occur.*

## Patch 104A-FIX — Brand Shell Polish
The mobile app shell has been polished to enhance the premium GearBeat identity:
- **Premium Loading**: Added animated pulse effect and improved logo typography.
- **Improved Error State**: Refined offline UI with better messaging and reconnect flow.
- **Visual Integrity**: Removed generic Expo styling in favor of dark/gold cinematic theme.
- **StatusBar Optimization**: Smooth transitions between splash and app content.

## Patch 104A-FIX2 — Preview Build Workflow
Standardized the mobile preview and build process:
- **EAS Readiness**: Integrated `eas.json` for professional APK/build distribution.
- **Script Standardization**: Added `start:lan`, `start:tunnel`, and `start:clear`.
- **Workflow Documentation**: Clarified that daily web changes are verified via the live mirror, reducing the need for constant mobile builds.

## Sprint 9A — Expo Config & Asset Polish
Fixed Expo configuration and validated assets for a professional launch:
- **Asset Fix**: Corrected missing splash image reference in `app.json` to use existing `splash-icon.png`.
- **Validation**: Verified the project with `expo-doctor` ensuring 100% check pass rate.
- **Shell Polish**: Maintained premium GearBeat dark/gold identity across all mobile shell components.
