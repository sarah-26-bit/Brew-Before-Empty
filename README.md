# Brew Before Empty — Native Android Application

A native Android mobile application for **Brew Before Empty / SpellStock**, built with **React Native**, **Expo SDK 58**, **TypeScript**, and **Expo Router**.

This mobile app operates as a dedicated mobile frontend alongside the desktop web dashboard, sharing the same Express & Supabase backend.

---

## 📱 Mobile Architecture & Features

### 1. Independent Native Architecture
- **Pure React Native & Expo**: No WebView, Cordova, or Capacitor wrappers. Native UI components, gestures, and tactile interactions.
- **Expo Router**: Modern file-based routing (`app/` directory) with strict TypeScript typings.
- **Shared Alchemical Palette**: Emerald Green (`#237A57`), Deep Forest (`#17251D`), Midnight Charcoal (`#101713`), Antique Gold (`#C5A46D`), and Warm Ivory (`#F3F0E6`).

### 2. 5-Tab Mobile Navigation
- **Home (`/(tabs)`)**:
  - Alchemist welcome banner & sanctuary status dot (Warded vs. Curse Active).
  - Quick-action buttons (Add Reagent, Dispense Potion, Prophecy AI, Vault List).
  - 4 Key Metrics: Vault Value (Gold), Low Stock Alerts, Active Anomalies, Total Revenue.
  - Urgent Attention Carousel for low-stock reagents.
  - Recent transaction feed.
- **Inventory (`/(tabs)/inventory`)**:
  - Potion Pantry with real-time text search and category pill filters.
  - Stock health badges (`HEALTHY`, `LOW`, `CRITICAL`, `OUT_OF_STOCK`).
  - Inline stock adjustment steppers (`+` / `-`) for instant 1-tap stock adjustments.
  - Supplier info and lead-time indicators.
  - Floating "Inscribe Reagent" button opening the catalog modal sheet.
- **Sales (`/(tabs)/sales`)**:
  - Total gold collected and brews dispensed counter.
  - "Dispense Potion Order" modal with live recipe ingredient deduction previews.
  - Detailed historical transaction cards showing exact reagents deducted.
- **Insights (`/(tabs)/insights`)**:
  - **Prophecy AI**: 7-day demand forecasts, daily consumption burn rates, and predicted depletion dates.
  - **Restock Spell**: Automated reorder recommendations with supplier lead-time buffers and 1-tap "Dispatch Restock Order" actions.
  - **Strange Happenings**: Anomaly detection with severity badges and 1-tap "Dispel" resolution.
  - **Midnight Curse**: Blood Moon Festival simulation controller (+75% burn rate surge on festival reagents).
- **Profile (`/(tabs)/profile`)**:
  - Alchemist credentials (pre-configured with sample user **Deva** - `kunjatadevu2008@gmail.com`).
  - **Arcane Gateway Configurator**: Live backend host switcher (`http://10.0.2.2:5001/api` for Android Emulator, `http://localhost:5001/api`, or Wi-Fi LAN IP) with built-in "Test Server Connection" ping tool.
  - Sign Out & Guest Mode toggles.

### 3. SPELLSTOCK INTELLIGENCE AI Chatbot
- Floating glowing orb accessible across all tabs.
- Full conversational sheet with typing indicator, suggested prompt chips, chat history, and clear-chat control.

---

## 🚀 How to Run the Android Application

### Prerequisites
Make sure the backend server is running:
```bash
# In the project root directory
npm run server
```
*(The backend runs on `http://localhost:5001` and connects to the Supabase database).*

---

### Option A: Run on Android Emulator
The Android emulator maps the host machine's `localhost` to `10.0.2.2`. The mobile app is pre-configured to default to `http://10.0.2.2:5001/api` on Android.

1. Start your Android Emulator (e.g., via Android Studio Virtual Device Manager).
2. From the project root or the `mobile` folder, run:
```bash
npm run mobile:android
# Or inside the mobile folder:
cd mobile
npx expo start --android
```

---

### Option B: Run on a Physical Android Phone (Expo Go)
1. Install **Expo Go** from the Google Play Store on your Android phone.
2. Ensure your phone and computer are connected to the same Wi-Fi network.
3. Start the Expo development server:
```bash
npm run mobile:start
# Or inside the mobile folder:
cd mobile
npx expo start
```
4. Open the Expo Go app on your phone and scan the QR code displayed in the terminal.
5. In the app's **Profile** tab, set the Arcane Gateway host to your computer's local Wi-Fi IP (e.g., `http://192.168.1.50:5001/api`) and tap **Test Server Connection**.

---

## 📦 Building Standalone APKs (Debug & Release)

### 1. Build Standalone Android APK with EAS (Recommended)
Expo Application Services (EAS) builds a standalone `.apk` in the cloud without needing local Android Studio build tools:

```bash
cd mobile

# Install EAS CLI if not already installed
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure EAS project
eas build:configure

# Build a standalone preview APK (installable on any Android device)
eas build -p android --profile preview
```
When complete, EAS provides a direct download link for the `.apk` file that can be installed on any Android device.

---

### 2. Build Debug APK Locally (Android SDK Required)
If you have the Android SDK & Gradle installed locally:

```bash
cd mobile

# Generate the native Android project
npx expo prebuild --platform android

# Compile and run debug APK directly on connected device/emulator
npx expo run:android --variant debug
```
The compiled debug APK will be located at:
`mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧪 Typecheck & Verification
To verify TypeScript typings and app integrity:
```bash
npm run mobile:typecheck
```
Both the desktop web app (`npm run build`) and mobile app pass 100% clean builds with zero errors.

# Brew-Before-Empty
