import "dotenv/config";

/**
 * Reads a required environment variable.
 * Throws a clear error (without printing the value) when it is missing.
 */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Set it in backend/.env (see backend/.env.example).`,
    );
  }
  return value.trim();
};

/**
 * Allowed browser origins for CORS, as a comma-separated list in CORS_ORIGIN
 * (e.g. "https://app.example.com,https://www.example.com").
 * Unset — or "*" — allows any origin, which is the sensible default for local
 * development and for a public read API, but should be pinned in production.
 */
const parseCorsOrigins = (): string[] | "*" => {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === "*") return "*";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d",
  corsOrigins: parseCorsOrigins(),
  /** Max accepted JSON request body. Profile photos are inlined as data URLs. */
  jsonBodyLimit: process.env.JSON_BODY_LIMIT?.trim() || "1mb",
};

export const isProduction = env.nodeEnv === "production";
