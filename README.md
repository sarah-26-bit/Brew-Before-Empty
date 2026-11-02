# 🧪 Brew Before Empty
### Predict. Prepare. Prosper.
**The Magic of Intelligent Inventory**

Brew Before Empty is an AI-powered inventory management and demand forecasting platform designed for a magical potion shop. It helps shop owners manage ingredients, monitor stock levels, predict future demand, detect unusual inventory activity, and make smarter restocking decisions.

Imagine running a potion shop where ingredients like Mandrake Root, Dragon Blood, Moon Dust, and Crystal Shards are essential. Running out of a critical ingredient could disrupt the entire business.

Brew Before Empty brings intelligence into inventory management by combining real-time stock tracking, predictive analytics, and intelligent recommendations in one platform.

---

## ✨ Key Features

### 📦 1. Smart Inventory Management
- Add, edit, view, and delete ingredients.
- Track available stock and minimum stock thresholds.
- Organize ingredients by category.
- Monitor low-stock and out-of-stock ingredients.
- Maintain a record of stock movements.

### 🔮 2. AI-Powered Demand Forecasting
- Predict future ingredient demand using historical consumption data.
- Identify ingredients that may run out soon.
- Estimate potential stockout dates.
- Provide explanations behind predictions.
- Help shop owners prepare before shortages occur.

### 🛒 3. Intelligent Restock Recommendations
- Identify ingredients that need replenishment.
- Calculate suggested reorder quantities.
- Prioritize urgent restocking requirements.
- Support smarter purchasing decisions.

### 🧠 4. Intelligent Inventory Assistant

Brew Before Empty includes an intelligent assistant that helps users understand their inventory through natural-language queries.

Example questions:
- Which ingredients are running low?
- What should I restock today?
- Which ingredients might run out in the next 7 days?
- Which ingredients have the highest consumption?
- What happens if demand increases by 40%?

The assistant is designed to provide insights using actual inventory information rather than fabricated results.

### 🚨 5. Anomaly Detection
- Identify unusual stock changes.
- Detect unexpected ingredient consumption.
- Highlight abnormal inventory activity.
- Display alerts with explanations and possible actions.

### 🎃 6. Festival & Seasonal Demand Simulation
- Simulate increases in demand during festivals and special events.
- Adjust demand scenarios using configurable multipliers.
- Observe how increased demand affects inventory.
- Recalculate potential stockouts and restocking requirements.

### 📊 7. Analytics Dashboard
- Visualize inventory trends.
- Monitor ingredient consumption.
- Track sales and transactions.
- Identify frequently used ingredients.
- Compare historical and predicted demand.
- Understand overall inventory health.

### 📱 8. Web & Android Experience
- Access inventory information through a web dashboard.
- Manage inventory using a mobile application.
- Keep data synchronized through a shared backend.
- Access important inventory information while on the move.

---

## 🖥️ Application Modules

| Module | Description |
|---|---|
| The Master's Chamber | Main dashboard and inventory overview |
| The Inventory Vault | Ingredient management |
| Sales & Transactions | Sales records and stock movement |
| The Oracle Room | AI forecasting and inventory intelligence |
| The Merchant's Guild | Smart restocking recommendations |
| The Forbidden Chamber | Anomaly detection and unusual activity |
| The Analytics Hall | Reports, charts, and inventory insights |
| The Festival Chamber | Seasonal demand simulation |

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Web frontend |
| Tailwind CSS | Styling and responsive UI |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Supabase | Authentication and database services |
| JavaScript | Application logic |
| Recharts | Data visualization |
| Lucide Icons | Interface icons |
| React Native / Expo | Android application |

**AI & Intelligence:** Statistical forecasting, inventory analysis, anomaly detection, and an intelligent assistant integrated with real application data. An external LLM service can be configured for natural-language intelligence.

---

## 🏗️ System Architecture

```text
              BREW BEFORE EMPTY
                      |
          +-----------+-----------+
          |                       |
     Web Dashboard            Android App
       (React)              (React Native)
          |                       |
          +-----------+-----------+
                      |
                  REST API
             (Node.js / Express)
                      |
          +-----------+-----------+
          |                       |
    Supabase Services       Intelligence Layer
    Authentication         Forecasting
    Database                Anomaly Detection
                            Restock Analysis
                            AI Assistant
```

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)
- A Supabase account and project

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate into the project

```bash
cd brew-before-empty
```

### 3. Install dependencies

Run the installation command inside the frontend and backend directories:

```bash
cd frontend
npm install
```

```bash
cd ../backend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the appropriate project directory.

Example:

```env
PORT=5000

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Configure your AI provider
AI_API_KEY=your_ai_api_key
```

Use the environment variable names expected by your actual application. Never upload real API keys, passwords, or secrets to GitHub.

### 5. Start the application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL displayed in your terminal.

> Note: These commands assume a frontend/backend folder structure with `dev` scripts configured in both packages. Update them to match your actual repository.

---

## 🧪 Example Use Case

Imagine Madam Hexley owns a potion shop.

She currently has:

- 12 units of Mandrake Root
- 8 units of Dragon Blood
- 20 units of Moon Dust

During a festival, potion demand is expected to increase by 40%.

Brew Before Empty can help her:

1. Monitor the current ingredient quantities.
2. Analyze historical consumption.
3. Predict the increased demand.
4. Identify ingredients at risk of running out.
5. Recommend how much to restock.
6. Simulate the festival scenario before making purchasing decisions.

**The result:** Better inventory planning, fewer unexpected shortages, and smarter business decisions.

---

## 🔐 Security & Data Integrity

Brew Before Empty aims to maintain reliable inventory records through:

- Secure authentication.
- Environment-based secret management.
- Backend validation of inventory operations.
- Stock checks before recording sales.
- Prevention of invalid or negative stock quantities.
- Confirmation before consequential inventory changes.
- Traceable stock movement records.

---

## 🚀 Future Enhancements

- More advanced machine-learning forecasting models.
- Improved seasonal and festival demand prediction.
- Supplier management and purchase-order tracking.
- Ingredient expiry and wastage monitoring.
- Automated inventory reports.
- Advanced anomaly detection.
- Enhanced mobile notifications.
- More intelligent conversational inventory assistance.

---

## 🎯 Project Vision

Brew Before Empty is built around one simple idea:

**Don't wait for the shelves to become empty. Predict what you need before you run out.**

By combining inventory management, predictive analytics, and intelligent decision support, Brew Before Empty transforms a traditional inventory system into a proactive inventory companion.

---

**Project:** Brew Before Empty  
**Tagline:** Predict. Prepare. Prosper.  
**Event:** Hack-O-Lantern 2026  
**Club:** Vulcan Club, Mirai School of Technology

---

<p align="center">
  🧪 <b>Brew Before Empty</b><br/>
  <i>The Magic of Intelligent Inventory</i><br/>
  Built with curiosity, creativity, and a little bit of magic. ✨
</p>
MIT © Hack-O-Lantern 2026. Crafted for Grand Magisters and Potion Stewards.
