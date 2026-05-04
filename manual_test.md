# Manual Testing Guide for Falling Sand (Capacitor)

This guide outlines how to verify the mobile-adapted version of Falling Sand across different platforms.

## 1. Local Browser Testing (Quick Check)
Use this to verify the UI layout and basic sand physics logic.

1. **Start the local server**:
   ```powershell
   .venv/Scripts/python.exe -m http.server 4173
   ```
2. **Open in Chrome/Edge**:
   Navigate to `http://localhost:4173/apps/mobile/`.
3. **Simulate Mobile View**:
   - Press `F12` to open DevTools.
   - Click the **Device Toolbar** icon (or press `Ctrl+Shift+M`).
   - Select a mobile device (e.g., iPhone 14 or Pixel 7).
4. **Verify**:
   - The canvas should resize to fit the lower half of the screen.
   - Controls should be stacked and readable.
   - Sand should emit when clicking/touching near the top.

## 2. PWA Testing (Mobile Browser)
Verify how the app behaves when added to a home screen via a browser.

1. **Serve over Local Network**:
   Ensure your phone and PC are on the same Wi-Fi.
2. **Find your IP**:
   Run `ipconfig` and find your IPv4 address (e.g., `192.168.1.50`).
3. **Open on Phone**:
   Navigate to `http://<your-ip>:4173/apps/mobile/`.
4. **Test "Add to Home Screen"**:
   - On iOS (Safari): Tap Share -> Add to Home Screen.
   - On Android (Chrome): Tap Menu -> Install App.
5. **Verify**:
   - The app should open without browser chrome (URL bar).
   - The status bar should overlay correctly if configured.

## 3. Native Android Testing (Capacitor)
This is the "True Native" test for haptics and native performance.

1. **Prerequisites**:
   - Android Studio installed.
   - A physical Android device (connected via USB/Wireless) or an Emulator.
2. **Sync and Open**:
   ```powershell
   npm run cap:sync
   npm run cap:open:android
   ```
3. **Run from Android Studio**:
   Click the **Play** button in Android Studio to build and launch the app.
4. **Verify Native Features**:
   - **Haptics**: Tap the **Clear** or **Reset** buttons. You should feel a physical vibration.
   - **Status Bar**: The app theme should extend behind the system status bar icons.
   - **Safe Areas**: Ensure controls are not cut off by the notch or rounded corners.

## 4. Native iOS Testing (macOS Required)
1. **Sync and Open**:
   ```powershell
   npm run cap:sync
   npm run cap:open:ios
   ```
2. **Run from Xcode**:
   Select your device/simulator and press `Cmd+R`.

---
**Note**: If you add new code to `apps/mobile/`, always run `npm run cap:sync` before testing in Android Studio or Xcode to ensure the latest web assets are copied into the native projects.
