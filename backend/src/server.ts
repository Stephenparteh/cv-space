import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env, isProduction } from "./config/env.js";

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(
      "[server] Startup aborted:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  app.listen(env.port, () => {
    const where = isProduction ? `port ${env.port}` : `http://localhost:${env.port}`;
    console.log(`[server] Resume Builder V2 backend listening on ${where} (${env.nodeEnv})`);
    console.log(`[server] Health check: GET /api/health`);
  });
};

start();
