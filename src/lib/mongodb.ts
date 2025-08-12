import mongoose from 'mongoose';

// Keep the raw value (could be undefined) so we can expose a flag rather than throwing immediately.
const MONGODB_URI = process.env.MONGODB_URI;

// Export a helper flag other modules can use to decide whether to attempt DB access.
export const hasMongoURI = !!MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!hasMongoURI) {
    // Provide a clearer runtime error only if a consumer actually tries to use the DB.
    throw new Error('Database not configured. Set MONGODB_URI in your environment to enable persistence.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

  // At this point hasMongoURI is true, so MONGODB_URI is defined.
  cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
