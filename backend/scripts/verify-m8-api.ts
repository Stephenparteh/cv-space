/**
 * Milestone 8 integration checks — guest→account transfer building blocks,
 * analytics events, and admin authorization/endpoints.
 *
 * Run:  npm run test:api        (from backend/)
 *
 * Uses only Node's built-in test runner (node:test) — no test framework added.
 * Follows the same DB-reachability skip pattern as verify-resume-api.ts.
 */
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";

import app from "../src/app.js";
import { AnalyticsEvent } from "../src/models/AnalyticsEvent.js";
import { Resume } from "../src/models/Resume.js";
import { User } from "../src/models/User.js";
import { signAuthToken } from "../src/utils/jwt.js";

const server = app.listen(0);
const baseUrl = () => {
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
};

type Json = Record<string, unknown>;
interface Res {
  status: number;
  body: Json;
}

const call = async (
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<Res> => {
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
};

let dbReady = false;
const createdUserIds: string[] = [];
const createdEventIds: string[] = [];

before(async () => {
  const attempts = 6;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI ?? "", {
        dbName: "resume_builder",
        serverSelectionTimeoutMS: 10_000,
      });
      dbReady = true;
      return;
    } catch (err) {
      console.warn(
        `[verify-m8-api] DB connect attempt ${i}/${attempts} failed: ` +
          `${err instanceof Error ? err.name : String(err)}`,
      );
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
      if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.warn(`\n[verify-m8-api] DB unreachable after ${attempts} attempts — tests SKIPPED.\n`);
});

after(async () => {
  if (dbReady) {
    if (createdUserIds.length > 0) {
      await Resume.deleteMany({ ownerId: { $in: createdUserIds } });
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (createdEventIds.length > 0) {
      await AnalyticsEvent.deleteMany({ _id: { $in: createdEventIds } });
    }
    await mongoose.disconnect();
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const dbTest = (name: string, fn: () => Promise<void>) =>
  test(name, async (t) => {
    if (!dbReady) {
      t.skip("DB unreachable");
      return;
    }
    await fn();
  });

const stamp = Date.now();
let userToken = "";
let userId = "";
let adminToken = "";
let adminId = "";

dbTest("seed: a normal user and an admin user", async () => {
  const u = await User.create({
    name: "M8 User",
    email: `m8-user-${stamp}@example.com`,
    password: "password123",
  });
  const a = await User.create({
    name: "M8 Admin",
    email: `m8-admin-${stamp}@example.com`,
    password: "password123",
    role: "admin",
  });
  userId = u.id;
  adminId = a.id;
  createdUserIds.push(userId, adminId);
  userToken = signAuthToken(userId);
  adminToken = signAuthToken(adminId);
  assert.equal(u.role, "user"); // default
  assert.equal(a.role, "admin");
});

/* ---------------------------------------------------------------------- */
/*  Role safety                                                           */
/* ---------------------------------------------------------------------- */

dbTest("register ignores a client-supplied role — always defaults to user", async () => {
  const email = `m8-noselfpromote-${stamp}@example.com`;
  const res = await call("POST", "/api/auth/register", {
    body: { name: "Sneaky", email, password: "password123", role: "admin" },
  });
  assert.equal(res.status, 201);
  const user = (res.body.data as Json).user as Json;
  assert.equal(user.role, "user");
  createdUserIds.push(user.id as string);
});

/* ---------------------------------------------------------------------- */
/*  Admin authorization — the core security requirement                   */
/* ---------------------------------------------------------------------- */

for (const path of ["/api/admin/stats", "/api/admin/activity"]) {
  test(`GET ${path} without a token → 401`, async () => {
    const res = await call("GET", path);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  dbTest(`GET ${path} as a normal (non-admin) user → 403`, async () => {
    const res = await call("GET", path, { token: userToken });
    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  dbTest(`GET ${path} as an admin → 200`, async () => {
    const res = await call("GET", path, { token: adminToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
}

dbTest("admin stats shape: totals, templateUsage, timeSeries — no PII/secrets", async () => {
  const res = await call("GET", "/api/admin/stats", { token: adminToken });
  assert.equal(res.status, 200);
  const data = res.body.data as Json;
  const totals = data.totals as Json;
  assert.equal(typeof totals.users, "number");
  assert.equal(typeof totals.savedResumes, "number");
  assert.equal(typeof totals.publicResumes, "number");
  assert.equal(typeof totals.guestResumesStarted, "number");
  assert.equal(typeof totals.pdfDownloads, "number");
  assert.ok(totals.users as number >= 2); // at least the two seeded users
  assert.equal(typeof data.templateUsage, "object");
  const ts = data.timeSeries as Json;
  assert.equal(ts.days, 14);
  assert.ok(Array.isArray(ts.users));
  const raw = JSON.stringify(res.body);
  assert.doesNotMatch(raw, /password|token|secret/i);
});

dbTest("admin activity shape: recent lists, no password/token fields", async () => {
  const res = await call("GET", "/api/admin/activity", { token: adminToken });
  assert.equal(res.status, 200);
  const data = res.body.data as Json;
  assert.ok(Array.isArray(data.recentUsers));
  assert.ok(Array.isArray(data.recentResumes));
  assert.ok(Array.isArray(data.recentEvents));
  const raw = JSON.stringify(res.body);
  assert.doesNotMatch(raw, /password|"token"|jwtSecret/i);
});

/* ---------------------------------------------------------------------- */
/*  Analytics events                                                      */
/* ---------------------------------------------------------------------- */

dbTest("POST /api/analytics/events — anonymous event, no auth required", async () => {
  const res = await call("POST", "/api/analytics/events", { body: { type: "resume_started" } });
  assert.equal(res.status, 201);
  const doc = await AnalyticsEvent.findOne({ type: "resume_started" }).sort({ createdAt: -1 });
  assert.ok(doc);
  assert.equal(doc?.userId, null);
  if (doc) createdEventIds.push(String(doc._id));
});

dbTest("POST /api/analytics/events — authenticated event attaches userId", async () => {
  const res = await call("POST", "/api/analytics/events", {
    token: userToken,
    body: { type: "resume_saved" },
  });
  assert.equal(res.status, 201);
  const doc = await AnalyticsEvent.findOne({ type: "resume_saved", userId: userId }).sort({
    createdAt: -1,
  });
  assert.ok(doc);
  if (doc) createdEventIds.push(String(doc._id));
});

dbTest("POST /api/analytics/events — template_selected records the template", async () => {
  const res = await call("POST", "/api/analytics/events", {
    body: { type: "template_selected", template: "creative" },
  });
  assert.equal(res.status, 201);
  const doc = await AnalyticsEvent.findOne({ type: "template_selected" }).sort({ createdAt: -1 });
  assert.equal(doc?.template, "creative");
  if (doc) createdEventIds.push(String(doc._id));
});

test("POST /api/analytics/events — invalid type → 400", async () => {
  const res = await call("POST", "/api/analytics/events", { body: { type: "not_a_real_event" } });
  assert.equal(res.status, 400);
});

test("POST /api/analytics/events — missing type → 400", async () => {
  const res = await call("POST", "/api/analytics/events", { body: {} });
  assert.equal(res.status, 400);
});

dbTest("POST /api/analytics/events — invalid token is ignored, event still anonymous", async () => {
  const res = await call("POST", "/api/analytics/events", {
    token: "not-a-jwt",
    body: { type: "resume_downloaded" },
  });
  // optionalAuth never rejects the request for a bad token.
  assert.equal(res.status, 201);
  const doc = await AnalyticsEvent.findOne({ type: "resume_downloaded" }).sort({ createdAt: -1 });
  assert.equal(doc?.userId, null);
  if (doc) createdEventIds.push(String(doc._id));
});

dbTest("POST /api/analytics/events — an unrecognized template is dropped, not rejected", async () => {
  const res = await call("POST", "/api/analytics/events", {
    body: { type: "template_selected", template: "not-a-real-template" },
  });
  assert.equal(res.status, 201);
  const doc = await AnalyticsEvent.findOne({ type: "template_selected", template: null }).sort({
    createdAt: -1,
  });
  assert.ok(doc);
  if (doc) createdEventIds.push(String(doc._id));
});

/* ---------------------------------------------------------------------- */
/*  Guest → account transfer building block: creating a resume from        */
/*  guest-shaped fields via the ordinary (already-tested) create endpoint. */
/* ---------------------------------------------------------------------- */

dbTest("guest-shaped resume payload creates fine via the normal resume API", async () => {
  const res = await call("POST", "/api/resumes", {
    token: userToken,
    body: {
      title: "Guest Resume",
      personalInfo: { fullName: "Guest Person", email: "guest@example.com" },
      summary: "Built as a guest.",
      experience: [{ jobTitle: "Engineer", company: "Acme", responsibilities: ["Shipped things"] }],
      skills: ["React"],
      template: "modern",
    },
  });
  assert.equal(res.status, 201);
  const resume = (res.body.data as Json).resume as Json;
  assert.equal(resume.ownerId, userId);
  assert.equal(resume.title, "Guest Resume");
});
