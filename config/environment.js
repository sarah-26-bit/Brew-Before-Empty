import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultSafetyFactor: 1.5,
  defaultForecastDays: 7,
  defaultHistoryDays: 14,
};

