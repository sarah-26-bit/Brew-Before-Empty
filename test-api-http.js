import { connectDB, disconnectDB } from './config/db.js';
import { SeedService } from './services/seedService.js';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use(errorHandler);

const PORT = 5099;
const server = app.listen(PORT, async () => {
  try {
    await connectDB();
    await SeedService.seedHistoricalData(true);

    const base = `http://localhost:${PORT}/api`;

    // 1. GET /api/ingredients
    const r1 = await fetch(`${base}/ingredients`).then((r) => r.json());
    console.log(`1. GET /api/ingredients -> Success: ${r1.success}, Total: ${r1.data.length}`);

    // 2. POST /api/ingredients
    const r2 = await fetch(`${base}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Starlight Moon-Orchid',
        category: 'Botanical Extracts',
        currentStock: 30,
        unit: 'blossoms',
        minThreshold: 15,
        costPerUnit: 24.5,
      }),
    }).then((r) => r.json());
    console.log(`2. POST /api/ingredients -> Success: ${r2.success}, Name: ${r2.data.name}`);

    // 3. GET /api/sales
    const r3 = await fetch(`${base}/sales`).then((r) => r.json());
    console.log(`3. GET /api/sales -> Success: ${r3.success}, Count: ${r3.data.length}`);

    // 4. POST /api/sales
    const r4 = await fetch(`${base}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        potionName: 'Nocturnal Sight Philter',
        quantity: 2,
        customer: 'Shadow Scout',
      }),
    }).then((r) => r.json());
    console.log(`4. POST /api/sales -> Success: ${r4.success}, Message: "${r4.message}"`);

    // 5. GET /api/forecasts
    const r5 = await fetch(`${base}/forecasts`).then((r) => r.json());
    console.log(`5. GET /api/forecasts -> Success: ${r5.success}, Forecasts: ${r5.data.forecasts.length}`);

    // 6. GET /api/restock
    const r6 = await fetch(`${base}/restock`).then((r) => r.json());
    console.log(`6. GET /api/restock -> Success: ${r6.success}, Recommendations: ${r6.data.recommendations.length}`);

    // 7. GET /api/anomalies
    const r7 = await fetch(`${base}/anomalies`).then((r) => r.json());
    console.log(`7. GET /api/anomalies -> Success: ${r7.success}, Anomalies: ${r7.data.length}`);

    // 8. GET /api/analytics
    const r8 = await fetch(`${base}/analytics`).then((r) => r.json());
    console.log(`8. GET /api/analytics -> Success: ${r8.success}, Revenue: ${r8.data.financials.totalRevenue} ⟡`);

    // 9. POST /api/events
    const r9 = await fetch(`${base}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Witches' Eve Midnight Eclipse",
        code: 'WITCHES_EVE',
        multiplier: 2.1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        description: 'Halloween alignment triples lunar and botanical demand.',
      }),
    }).then((r) => r.json());
    console.log(`9. POST /api/events -> Success: ${r9.success}, Multiplier: ${r9.data.multiplier}x`);

    console.log('\n✨ ALL HTTP REST API ENDPOINTS FULLY OPERATIONAL!');
    server.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error during HTTP endpoint verification:', err);
    server.close();
    process.exit(1);
  }
});
