import mongoose from "mongoose";
import dns from "dns";
// Ensure DNS resolvers can resolve MongoDB SRV records on Windows
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}
catch {
    // Ignore in environments where setting DNS servers is restricted
}
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.warn("[MongoDB Warning]: MONGODB_URI is not defined in environment variables. Please check your .env.local file.");
}
// Attach cache to global object in development to persist across HMR
const cached = global.mongooseCache || {
    conn: null,
    promise: null,
};
if (!global.mongooseCache) {
    global.mongooseCache = cached;
}
export async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is missing. Please define it in .env.local");
    }
    // Return existing connection if ready
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }
    // If a connection promise is already in flight, wait for it
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s to avoid hanging during connection failures
            dbName: "abacus",
        };
        cached.promise = mongoose
            .connect(uri, opts)
            .then((mongooseInstance) => {
            return mongooseInstance;
        })
            .catch((err) => {
            cached.promise = null;
            throw err;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (error) {
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
    return cached.conn;
}
export default connectToDatabase;
