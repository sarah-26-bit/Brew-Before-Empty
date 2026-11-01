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

--- Brew-Before-Empty
