import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { SeedService } from './services/seedService.js';

const app = express();

// CORS configuration for simultaneous consumption by React web and Android app
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SPELLSTOCK / POTIONPULSE Alchemical Intelligence Engine',
    tagline: 'Predict. Prepare. Prosper.',
    statement: 'The Magic of Intelligent Inventory.',
    edition: 'Hack-O-Lantern 2026',
    apiBaseUrl: '/api',
    endpoints: {
      ingredients: '/api/ingredients',
      sales: '/api/sales',
      forecasts: '/api/forecasts',
      restock: '/api/restock',
      anomalies: '/api/anomalies',
      analytics: '/api/analytics',
      events: '/api/events',
      health: '/api/health',
      seed: '/api/seed',
    },
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup and DB connection
async function startServer() {
  try {
    await connectDB();

    // Auto-seed synthetic historical data if database is empty
    await SeedService.seedHistoricalData(false);

    app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`✨ SPELLSTOCK Backend & Intelligence Engine Running`);
      console.log(`🔮 Listening on port: ${config.port}`);
      console.log(`🌐 Base URL: http://localhost:${config.port}`);
      console.log(`📱 Android Emulator URL: http://10.0.2.2:${config.port}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

startServer();

export default app;
