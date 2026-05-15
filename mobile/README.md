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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm run start
   ```

4. Scan the QR code with your camera (iOS) or the Expo Go app (Android).

## Environments
By default, the app loads `https://gearbeat.app?app=1`. 
Tap the top right corner of the screen 5 times to reveal the developer environment switcher.

## Quality Assurance
For detailed testing steps and checklist, see [QA_MOBILE_PREVIEW.md](./QA_MOBILE_PREVIEW.md).

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
