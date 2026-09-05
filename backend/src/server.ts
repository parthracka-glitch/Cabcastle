import mongoose from 'mongoose';
import { app } from './app.js';
import { PORT } from './config/index.js';
import { connectDB } from './db/connection.js';
import { seedInitialData } from './db/seed.js';

let server: ReturnType<typeof app.listen> | null = null;
let mongodInstance: any = null;

async function startServer() {
  try {
    let conn = await connectDB();
    if (!conn || mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Local MongoDB not reachable, starting in-memory database instance for local development...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongodInstance = await MongoMemoryServer.create();
          const uri = mongodInstance.getUri();
          conn = await mongoose.connect(uri, { dbName: 'cab_castle_goa' });
          console.log('Connected to In-Memory MongoDB Database:', conn.connection.name);
        } catch (memErr) {
          console.warn('In-memory MongoDB not available:', memErr);
        }
      } else {
        console.warn('Production Notice: MongoDB Atlas connection not yet established. Operating with in-memory fallback catalogs.');
      }
    }
    if (conn && mongoose.connection.readyState === 1) {
      await seedInitialData();
    }
  } catch (err) {
    console.warn('Database initialization note:', err);
  }

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cab Castle Goa Express API server listening on port ${PORT} on 0.0.0.0 (PID: ${process.pid})`);
  });
}

// ── Graceful Shutdown Handlers ──
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
          console.log('MongoDB connection pool disconnected.');
        }
      } catch (err) {
        console.error('Error disconnecting MongoDB:', err);
      }
      process.exit(0);
    });

    // Force exit after 10s if connections fail to close
    setTimeout(() => {
      console.error('Graceful shutdown timeout exceeded. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Server startup error:', err);
  });
}

export { app, seedInitialData };
