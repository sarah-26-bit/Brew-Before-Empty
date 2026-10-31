# SPELLSTOCK — The Magic of Intelligent Inventory 🔮✨
> **Predict. Prepare. Prosper.**  
> *Developed for Hack-O-Lantern 2026*

SPELLSTOCK is an AI-powered magical inventory management platform designed for alchemists, enchanters, and potion guilds. It fuses deep alchemical lore with high-performance SaaS inventory forecasting, dynamic stock deduction, anomaly detection, and automated replenishment incantations.

---

## 🎨 Official Brand Identity & Palette

- **Product Name**: SPELLSTOCK
- **Tagline**: Predict. Prepare. Prosper.
- **Brand Statement**: The Magic of Intelligent Inventory.

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Midnight** | `#100B19` | Sanctum deep space background & vault canvas |
| **Arcane Violet** | `#8B5CF6` | Primary mystical accents, buttons & prophecies |
| **Potion Orange** | `#FF8A32` | Energy highlights, currency values, surge states |
| **Enchanted Green** | `#78D66B` | Plentiful stock indicators, wards & prosperity |
| **Curse Red** | `#FF5268` | Depletion warnings, spectral anomalies, blood surges |
| **Moonlight** | `#F3EBDD` | Elegant typography, rune readouts & crisp borders |

---

## ⚡ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3
- **Data Visualization**: Recharts (Demand curves, Stock levels, Category breakdown)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Networking**: Axios HTTP Client with API Proxy
- **Backend**: Node.js & Express REST API with JSON persistence & Primordial Reset

---

## 🧭 Navigation & Modules

1. **Overview** — Imperial command dashboard displaying key metrics (Total assets, Gross gold revenue, Hazard count, Anomalies), quick restock alerts, and live transaction chronologies.
2. **Potion Pantry** — Full reagent management (*Add, update, and delete ingredients*). Real-time search, category filtering, stock availability meters, and low-stock warning triggers.
3. **Sales & Transactions** — Dispensation ledger recording customer orders, guilds, and **automatically reflecting ingredient stock deductions** directly in the pantry registers.
4. **Prophecy AI** — Neural demand forecasting over 14-day horizons, stockout hazard projection dates, confidence interval envelopes, and **Seasonal Demand Spikes Simulator** (Blood Moon, Witches' Eve, Solstice, Necrotic Plague).
5. **Restock Spell** — Algorithmic replenishment generator (*Incantation of Abundant Harvest*). Multi-select selective restock, custom order sizing, unit cost evaluation, and immediate stock restoration with magical confetti celebration.
6. **Strange Happenings** — Telemetry logging supernatural disturbances (Spectral leakage, thermal degradation, rapid stockout risks) with one-click **Warding Charm** resolution.
7. **Crystal Ball Analytics** — Historical vs predicted demand curves, inventory turnover velocity (4.8x), stockout risk index, and asset distribution across reagent categories.
8. **Midnight Curse** — Simulated seasonal surge engine: calibrate consumption velocity multiplier (1.0x to 3.5x), assess celestial spoilage rate, and invoke holy wards.
9. **Settings** — Sanctum shop governance, alchemist titles, forecast horizons, automated warding toggles, and **Primordial Rejuvenation** database reset.

---

## 🚀 Running the Platform

### 1. Run both Backend & Frontend concurrently
```bash
npm run dev
```
- **Backend API**: Runs on `http://localhost:5001/api`
- **Frontend Dashboard**: Runs on `http://localhost:5173`

### 2. Run Independently
```bash
# Terminal 1: Node.js Backend Server
npm run server

# Terminal 2: Vite Frontend Client
npm run client
```

### 3. Production Build
```bash
npm run build
```

---

## 🔮 API Endpoints Reference

- `GET /api/overview` — Sanctum summary metrics, recent sales, and low stock warnings.
- `GET /api/ingredients` — Catalog of reagents enriched with days remaining and stockout dates.
- `POST /api/ingredients` — Inscribe new reagent into vault.
- `PUT /api/ingredients/:id` — Refine reagent properties and threshold.
- `DELETE /api/ingredients/:id` — Banish reagent from inventory.
- `GET /api/potions` — Potion recipes and real-time brew availability.
- `GET /api/sales` — Transaction history with auto-deduction reports.
- `POST /api/sales` — Record dispensation and auto-deduct recipe reagents.
- `GET /api/prophecy` — 14-day demand timeline and stockout predictions.
- `POST /api/prophecy/simulate-spike` — Simulate seasonal demand spikes and accelerated depletion dates.
- `GET /api/restock` — Algorithmic restock recommendations and lead times.
- `POST /api/restock/execute` — Execute Restock Spell to restore depleted stock.
- `GET /api/anomalies` — Strange happening anomaly alerts.
- `POST /api/anomalies/:id/resolve` — Etch ward and resolve anomaly.
- `GET /api/analytics` — Historical vs predicted demand datasets and category metrics.
- `GET /api/curse` & `POST /api/curse/toggle` — Midnight Curse surge toggle & multiplier.
- `GET /api/settings` & `PUT /api/settings` — Sanctum parameters.
- `POST /api/settings/reset` — Restore primordial Hack-O-Lantern 2026 data.

