import mongoose from "mongoose";
import { env } from "./env.js";

export type DbStatus = "connecting" | "connected" | "error";

let status: DbStatus = "connecting";
let lastError: string | null = null;

export const getDbStatus = () => ({ status, error: lastError });

/**
 * Removes any mongodb connection string from a message so credentials /
 * the full URI are never logged or returned in an API response.
 */
const sanitize = (message: string): string =>
  message.replace(/mongodb(\+srv)?:\/\/\S+/gi, "<redacted-connection-string>");

export const connectDB = async (): Promise<void> => {
  status = "connecting";

  try {
    await mongoose.connect(env.mongodbUri, {
      dbName: "resume_builder",
      serverSelectionTimeoutMS: 10_000,
    });
    status = "connected";
    lastError = null;
    console.log("[db] MongoDB connected successfully.");
  } catch (error) {
    status = "error";
    lastError = sanitize(
      error instanceof Error ? error.message : "Unknown database error",
    );
    // Do not log the URI or credentials — only the sanitized reason.
    console.error(`[db] MongoDB connection failed: ${lastError}`);
    throw new Error(`Database connection failed: ${lastError}`);
  }
};

mongoose.connection.on("disconnected", () => {
  if (status === "connected") {
    status = "error";
    lastError = "Database disconnected";
    console.error("[db] MongoDB connection lost.");
  }
});

mongoose.connection.on("reconnected", () => {
  status = "connected";
  lastError = null;
  console.log("[db] MongoDB reconnected.");
});
