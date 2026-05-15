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

## 5. Known Limitations
- **File Uploads**: Some complex file upload interactions might behave differently than on desktop.
- **Push Notifications**: Not implemented in this mirror phase.
- **Deep Linking**: Currently only supports basic `app=1` entry.
