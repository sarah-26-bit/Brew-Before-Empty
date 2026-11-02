# BREW BEFORE EMPTY🔮✨
> **The Magic of Intelligent Inventory — Predict. Prepare. Prosper.**  
> *Developed for Hack-O-Lantern 2026*

BREW-BEFORE-EMPTY is an AI-powered alchemical inventory management and predictive demand intelligence platform. Designed for both desktop workstations and mobile devices, it bridges high-performance supply-chain algorithms with rich fantasy lore. It predicts ingredient depletion, simulates seasonal demand spikes (e.g. Blood Moon Festival), tracks potion recipes with automated multi-ingredient deductions upon sales, detects anomalies (theft/leakage), and features an AI chatbot assistant.

---

## 🏗️ System Architecture & Platform Overview

```
                       ┌──────────────────────────────────────────────┐
                       │           Supabase PostgreSQL /             │
                       │           Local JSON Persistent DB           │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          Express Backend (Port 5001)         │
                       │  - Forecast Engine (Burn Rates & Surges)     │
                       │  - Anomaly Detector (Spikes & Leaks)         │
                       │  - Alchemical AI Chatbot Service             │
                       │  - Multi-ingredient Deduction Processor      │
                       └──────────────┬────────────────┬──────────────┘
                                      │                │
            REST API (Vite Proxy)     │                │ REST API (10.0.2.2 / Port 5001)
                                      ▼                ▼
         ┌──────────────────────────────┐    ┌───────────────────────────────────┐
         │     Web Frontend (React)     │    │     Mobile Frontend (Android)     │
         │  • React 18 + Vite           │    │  • React Native 0.88 + Expo SDK 58│
         │  • Tailwind CSS Dark Theme   │    │  • Expo Router (File-based Tabs)  │
         │  • Recharts Data Visuals     │    │  • Native Alchemical Styling      │
         │  • Lucide Icons              │    │  • TypeScript                     │
         └──────────────────────────────┘    └───────────────────────────────────┘
```

---

## 🎨 Official Brand Identity & Design System

- **Product Name**:BREW BEFORE EMPTY
- **Tagline**: Predict. Prepare. Prosper.
- **Visual Theme**: Dark Botanical Glassmorphism

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Midnight Charcoal** | `#101713` | Deep sanctum base canvas |
| **Deep Forest** | `#17251D` | Elevated glassmorphic card surfaces |
| **Emerald Green** | `#237A57` / `#2FA375` | Primary action buttons, healthy stock status |
| **Antique Gold** | `#C5A46D` | Imperial currency (`⟡ ARC`), headers, sparkles |
| **Warning Amber** | `#E9A23B` | Low stock alerts and reorder warnings |
| **Curse Red** | `#D65C56` | Blood Moon demand surge, critical stockouts |
| **Warm Ivory** | `#F3F0E6` | High-contrast readable typography |

---

## ⚡ Tech Stack

### Web Dashboard
- **Framework**: React 18, Vite 5, TypeScript / JSX
- **Styling**: Tailwind CSS 3 with custom alchemical tokens, PostCSS, Autoprefixer
- **Visualizations**: Recharts (Demand curves, stock levels, depletion countdowns)
- **Icons & Effects**: Lucide React, Canvas Confetti
- **HTTP Client**: Axios with Vite backend proxy

### Android Mobile App (`mobile/`)
- **Runtime**: Pure React Native 0.88 & Expo SDK 58 (No WebViews or wrappers)
- **Navigation**: Expo Router (File-based 5-tab stack)
- **Language**: TypeScript with end-to-end type safety
- **Security**: `expo-secure-store` for credentials and host persistence
- **Icons**: Expo Vector Icons (Ionicons)

### Backend & Database Layer
- **Server**: Node.js & Express REST API (`port 5001`) with CORS
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) with automatic local JSON fallback (`server/data/initialData.json`)
- **Intelligence Engines**:
  - **Predictive Demand Forecaster**: Calculates rolling daily burn rates, supplier lead-time buffers, and dynamic days-to-depletion.
  - **Seasonal Demand Surge**: Blood Moon Festival simulator (1.75x consumption velocity multiplier).
  - **Atomic Recipe Deductions**: Dispensing a potion verifies all required reagents and atomically decrements vault inventory in a single transaction.
  - **Anomaly Detector**: Identifies sudden consumption spikes and phantom stock leakage with one-click warding dispel actions.
  - **SPELLSTOCK Intelligence Chatbot**: AI conversational assistant answering inventory questions.

---

## 📱 Mobile App Features (5 Native Tabs)

1. **Home (`/(tabs)/index.tsx`)**:
   - Grand Master's Chamber hero card with live status indicator.
   - Active Blood Moon seasonal surge alert banner (1.75x multiplier).
   - 4 Key Metrics: Total in Stock, Total Revenue (`⟡`), Low Stock Alerts, Unusual Activity.
   - Automated Inventory Health Score gauge (0–100%).
   - Alchemical Daily Objectives checklist.
2. **Potion Pantry (`/(tabs)/inventory.tsx`)**:
   - Real-time search by name, supplier, or category with instant chip filters.
   - Reagent cards with 3-column stats (Current Stock, Min Threshold, Days Left).
   - Daily burn rate and supplier delivery lead-time indicators.
   - Inline stock steppers (`+` / `-`) for instant adjustments.
   - Floating "+ Inscribe Reagent" action button.
3. **Sales Ledger (`/(tabs)/sales.tsx`)**:
   - Total treasury revenue counter and brews dispensed counter.
   - "Record Customer Purchase" modal with live ingredient deduction calculations.
   - Transaction cards with patron name, guild affiliation, and gold earned.
4. **Insights Centre (`/(tabs)/insights.tsx`)**:
   - Segmented navigation: Prophecy AI, Restock Spell, Anomalies, Curse Surge.
   - Urgent depletion warnings and 1-tap restock dispatch.
   - One-click anomaly resolution charms.
5. **Sanctuary Profile & Settings (`/(tabs)/profile.tsx`)**:
   - Alchemist profile card with title and shop credentials.
   - Store branding parameters, currency representation (`⟡ ARC`), and prophecy horizon.
   - Arcane Gateway API host manager (quick toggle between Android emulator `10.0.2.2:5001` and `localhost:5001`).
   - Danger zone demo baseline reset.
6. **Floating AI Chatbot (`FloatingAIChatbot.tsx`)**:
   - Bottom-right glowing orb accessible across all tabs.
   - Suggested prompts, real-time responses, and conversation management.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Android Studio & SDK** (for Android Emulator / Device testing)

### 2. Install Dependencies
```bash
# Install root (web + backend) dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Configure your Supabase credentials (optional; local JSON fallback is provided automatically):
```env
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Running the Platform

#### Option A: Run Web & Backend together
```bash
npm run dev
```
- **Backend API**: `http://localhost:5001/api`
- **Web Dashboard**: `http://localhost:5173`

#### Option B: Run Services Independently
```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: Web Dashboard
npm run client

# Terminal 3: Android Mobile App
npm run mobile:android
```

---

## 🔮 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and system status |
| `GET` | `/api/overview` | Dashboard summary metrics, health score, and recent sales |
| `GET` | `/api/ingredients` | Reagent catalog enriched with burn rates and depletion dates |
| `POST` | `/api/ingredients` | Inscribe a new reagent into the vault |
| `PUT` | `/api/ingredients/:id` | Update reagent properties, stock, and thresholds |
| `DELETE` | `/api/ingredients/:id` | Banish reagent from inventory |
| `GET` | `/api/potions` | Potion recipes and real-time brew availability |
| `GET` | `/api/sales` | Transaction history with ingredient deduction breakdown |
| `POST` | `/api/sales` | Record customer sale and auto-deduct required ingredients |
| `GET` | `/api/prophecy` | 14-day demand timeline and depletion forecast |
| `GET` | `/api/restock` | Reorder recommendations based on lead times |
| `POST` | `/api/restock/execute` | Execute restock order and replenish vault stock |
| `GET` | `/api/anomalies` | Detected strange happenings, spikes, and leaks |
| `POST` | `/api/anomalies/:id/resolve`| Dispel anomaly with an inscribed ward |
| `GET` | `/api/curse` | Current status of Blood Moon seasonal demand surge |
| `POST` | `/api/curse/toggle` | Activate or deactivate seasonal demand multiplier |
| `GET` | `/api/settings` | Store configuration and branding |
| `PUT` | `/api/settings` | Update store parameters and alert preferences |
| `POST` | `/api/settings/reset` | Restore demo baseline dataset |
| `POST` | `/api/chat` | Query the SPELLSTOCK Intelligence assistant |

---

## 📄 License
MIT © Hack-O-Lantern 2026. Crafted for Grand Magisters and Potion Stewards.
