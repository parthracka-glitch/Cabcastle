import dns from 'node:dns';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import {
  MONGO_URL,
  DB_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '../config/index.js';

// Ensure reliable SRV DNS resolution for MongoDB Atlas across Windows / ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if dns.setServers is restricted in sandbox
}

// Configure Mongoose connection resilience
mongoose.set('bufferTimeoutMS', 5000);

export async function connectDB(): Promise<typeof mongoose | null> {
  const targetUrl = MONGO_URL || 'mongodb://127.0.0.1:27017/coastal_cabs_goa';

  try {
    const conn = await mongoose.connect(targetUrl, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 25,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    });
    console.log(`Successfully connected to MongoDB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error (${targetUrl}):`, error);
    return null;
  }
}

if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET && CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

