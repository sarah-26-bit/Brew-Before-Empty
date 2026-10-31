import mongoose from 'mongoose';
import { config } from './environment.js';

let memoryServer = null;

export async function connectDB() {
  const customUri = config.mongodbUri;

  if (customUri) {
    try {
      console.log('🔮 Connecting to MongoDB Atlas cluster...');
      await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✨ Successfully connected to MongoDB Atlas!');
      return mongoose.connection;
    } catch (err) {
      console.warn(`⚠️ Atlas connection failed (${err.message}). Initializing embedded MongoDB engine...`);
    }
  }

  // Fallback to MongoMemoryServer for standalone/offline execution
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to Embedded MongoDB Instance (In-Memory Database active).');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ Failed to initialize MongoDB connection:', err);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

