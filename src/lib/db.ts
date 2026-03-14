// Just like Mongoose models, MongoDB connections also stay in memory in Next.js during hot reload and API calls. If we create a new database connection on every request without checking, multiple connections will be created, which can cause errors or performance issues. That’s why we store the connection in a global variable and reuse it instead of opening a new one each time.
import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL ?? process.env.MONGOBD_URL ?? "";

if (!MONGODB_URL) {
  throw new Error(
    "Please define the MONGODB_URL environment variable inside .env.local (or MONGOBD_URL for legacy setups)"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;



// 1️⃣ First API request

// cached.conn = null
// cached.promise = null

// cached.promise = mongoose.connect(MONGODB_URL)

// conn = null
// promise = connecting...

// If another request comes at the same time:
// conn = null
// promise = already running
