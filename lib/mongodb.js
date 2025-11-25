import mongoose from "mongoose";

const { MONGODB_URI, MONGODB_ALLOW_INSECURE_TLS } = process.env;

mongoose.set("strictQuery", false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const { MONGODB_URI, MONGODB_ALLOW_INSECURE_TLS } = process.env;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local (see .env.example)."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const allowInsecureTls = MONGODB_ALLOW_INSECURE_TLS === "true";

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        dbName: "fms",
        tlsAllowInvalidCertificates: allowInsecureTls,
      })
      .then((mongooseClient) => mongooseClient)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
