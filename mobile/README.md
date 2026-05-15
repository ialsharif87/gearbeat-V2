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
