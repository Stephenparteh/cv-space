/**
 * One-off: remove throw-away test accounts (and their resumes / profiles) left
 * behind by the verification scripts. Protected accounts are never touched.
 *
 * Dry run:   npx tsx scripts/cleanup-test-data.ts
 * Execute:   npx tsx scripts/cleanup-test-data.ts --yes
 */
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { Resume } from "../src/models/Resume.js";
import { User } from "../src/models/User.js";
import { Profile } from "../src/models/Profile.js";

const TEST_EMAIL_PREFIXES = [
  "m7",
  "m6ui-",
  "m6-",
  "m5-",
  "m4-",
  "m2-",
  "sec-",
];

const PROTECTED = new Set([
  "stephen.test@example.com",
  "ownership.test@example.com",
  "stephenparteh@gmail.com",
]);

const run = async () => {
  const execute = process.argv.includes("--yes");
  await mongoose.connect(env.mongodbUri, { dbName: "resume_builder" });

  const orClauses = TEST_EMAIL_PREFIXES.map((p) => ({
    email: { $regex: `^${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, $options: "i" },
  }));
  const candidates = await User.find({ $or: orClauses }).select("email _id");
  const victims = candidates.filter((u) => !PROTECTED.has(u.email));

  console.log(`Matched ${victims.length} test account(s):`);
  victims.forEach((u) => console.log(`  ${u.email}`));

  if (!victims.length) {
    await mongoose.disconnect();
    return;
  }
  const ids = victims.map((u) => u._id);
  const resumeCount = await Resume.countDocuments({ ownerId: { $in: ids } });
  const profileCount = await Profile.countDocuments({ userId: { $in: ids } });
  console.log(`Associated: ${resumeCount} resume(s), ${profileCount} profile(s).`);

  if (!execute) {
    console.log("\nDry run only. Re-run with --yes to delete.");
    await mongoose.disconnect();
    return;
  }

  const r1 = await Resume.deleteMany({ ownerId: { $in: ids } });
  const r2 = await Profile.deleteMany({ userId: { $in: ids } });
  const r3 = await User.deleteMany({ _id: { $in: ids } });
  console.log(`\nDeleted: ${r3.deletedCount} users, ${r1.deletedCount} resumes, ${r2.deletedCount} profiles.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
