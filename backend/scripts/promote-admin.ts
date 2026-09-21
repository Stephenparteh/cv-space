/**
 * One-off: grant an EXISTING account the "admin" role. This is the only way
 * to create an admin — there is no API endpoint that can promote a user, so
 * self-promotion over the network is not possible.
 *
 * The account must already exist (register normally first), and this must be
 * run by whoever holds shell/deploy access to the backend (e.g. a Render
 * "Shell" session or locally against the same MONGODB_URI) — never exposed
 * over HTTP.
 *
 * Usage (from backend/):
 *   npx tsx scripts/promote-admin.ts <email>
 *   npx tsx scripts/promote-admin.ts <email> --revoke   (demote back to "user")
 */
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";

const run = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  const revoke = process.argv.includes("--revoke");

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email> [--revoke]");
    process.exit(1);
  }

  await mongoose.connect(env.mongodbUri, { dbName: "resume_builder" });

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No account found for ${email}. Register the account first, then re-run this.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = revoke ? "user" : "admin";
  await user.save();
  console.log(`${email} is now role="${user.role}".`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
