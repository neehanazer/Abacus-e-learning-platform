import mongoose from "mongoose";
import dns from "dns";

// Ensure DNS resolvers can resolve MongoDB SRV records on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

/**
 * MongoDB connection helper using Mongoose with connection pooling and caching.
 * Prevents multiple connections during Next.js Hot Module Replacement (HMR) in development.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

import fs from "fs";
import path from "path";

// Auto-load .env.local if running in standalone scripts
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [k, ...v] = trimmed.split("=");
          if (k && v.length > 0) {
            process.env[k.trim()] = v.join("=").trim();
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    "[MongoDB Warning]: MONGODB_URI is not defined in environment variables. Please check your .env.local file."
  );
}

// Attach cache to global object in development to persist across HMR
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Please define it in .env.local"
    );
  }

  // Ensure DNS resolvers are set
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore
  }

  // Return existing connection if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection promise is already in flight, wait for it
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      dbName: "abacus",
    };

    // Helper to connect with fallback for SRV DNS lookup issues on Windows
    const tryConnect = async (targetUri: string): Promise<typeof mongoose> => {
      try {
        return await mongoose.connect(targetUri, opts);
      } catch (err: any) {
        if (
          targetUri.startsWith("mongodb+srv://") &&
          (err?.message?.includes("querySrv") || err?.message?.includes("ECONNREFUSED"))
        ) {
          // Fallback to direct replica set nodes if SRV query fails on Windows
          const directUri =
            "mongodb://neehanaz226_db_user:M0bnysbrqibx6KMk@ac-cjammo3-shard-00-00.ivsxywu.mongodb.net:27017,ac-cjammo3-shard-00-01.ivsxywu.mongodb.net:27017,ac-cjammo3-shard-00-02.ivsxywu.mongodb.net:27017/abacus?ssl=true&replicaSet=atlas-c3ceos-shard-0&authSource=admin&retryWrites=true&w=majority";
          console.warn("[MongoDB]: SRV lookup failed on Windows, falling back to direct replica set connection...");
          try {
            return await mongoose.connect(directUri, opts);
          } catch (fallbackErr: any) {
            const fMsg = String(fallbackErr?.message || fallbackErr);
            if (
              fMsg.includes("alert number 80") ||
              fMsg.includes("tlsv1 alert internal error") ||
              fMsg.includes("SSL routines")
            ) {
              const friendlyError = new Error(
                "MongoDB Atlas connection rejected: Your current IP address is not whitelisted in the MongoDB Atlas Network Access list."
              );
              throw friendlyError;
            }
            throw fallbackErr;
          }
        }
        throw err;
      }
    };

    cached.promise = tryConnect(uri)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        const msg = String(err?.message || err);
        if (
          msg.includes("alert number 80") ||
          msg.includes("tlsv1 alert internal error") ||
          msg.includes("SSL routines")
        ) {
          const friendlyError = new Error(
            "MongoDB Atlas connection rejected: Your current IP address is not whitelisted in the MongoDB Atlas Network Access list."
          );
          throw friendlyError;
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
