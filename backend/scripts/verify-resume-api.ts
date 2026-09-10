/**
 * Milestone 2 integration checks for the Resume CRUD API.
 *
 * Run:  npm run test:api        (from backend/)
 *
 * Uses only Node's built-in test runner (node:test) — no test framework added.
 *
 * - The "auth protection" tests need no database.
 * - The "CRUD" and "ownership isolation" tests need a reachable MongoDB.
 *   If the DB cannot be reached they are skipped (reported, not failed).
 */
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";

import app from "../src/app.js";
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

before(async () => {
  // Connectivity to Atlas from this environment has been intermittent (mobile
  // CGNAT rotating the egress IP), so retry a few times before giving up.
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
        `[verify-resume-api] DB connect attempt ${i}/${attempts} failed: ` +
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
  console.warn(
    `\n[verify-resume-api] DB unreachable after ${attempts} attempts — ` +
      `CRUD/ownership tests will be SKIPPED (not failed).\n`,
  );
});

after(async () => {
  if (dbReady) {
    if (createdUserIds.length > 0) {
      await Resume.deleteMany({ ownerId: { $in: createdUserIds } });
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await mongoose.disconnect();
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

/* ---------------------------------------------------------------------- */
/*  1-5. Auth protection (no DB required)                                 */
/* ---------------------------------------------------------------------- */

const protectedRoutes: Array<[string, string]> = [
  ["GET", "/api/resumes"],
  ["POST", "/api/resumes"],
  ["GET", "/api/resumes/64b7f9c2e4b0a1a2b3c4d5e6"],
  ["PUT", "/api/resumes/64b7f9c2e4b0a1a2b3c4d5e6"],
  ["DELETE", "/api/resumes/64b7f9c2e4b0a1a2b3c4d5e6"],
];

for (const [method, path] of protectedRoutes) {
  test(`${method} ${path} without a token → 401`, async () => {
    const res = await call(method, path);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(typeof res.body.error, "string");
  });
}

test("GET /api/resumes with a malformed token → 401", async () => {
  const res = await call("GET", "/api/resumes", { token: "not-a-jwt" });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

/* ---------------------------------------------------------------------- */
/*  6-10 + ownership isolation (DB required)                             */
/* ---------------------------------------------------------------------- */

const stamp = Date.now();

// `dbReady` is only known after the `before()` hook runs, so the skip decision
// must happen inside the test body, not when the test is registered.
const dbTest = (name: string, fn: () => Promise<void>) =>
  test(name, async (t) => {
    if (!dbReady) {
      t.skip("DB unreachable");
      return;
    }
    await fn();
  });

let tokenA = "";
let tokenB = "";
let resumeAId = "";
let resumeBId = "";

dbTest("seed: two users A and B", async () => {
  const a = await User.create({
    name: "User A",
    email: `m2a-${stamp}@example.com`,
    password: "password123",
  });
  const b = await User.create({
    name: "User B",
    email: `m2b-${stamp}@example.com`,
    password: "password123",
  });
  createdUserIds.push(a.id, b.id);
  tokenA = signAuthToken(a.id);
  tokenB = signAuthToken(b.id);
  assert.ok(tokenA && tokenB);
});

dbTest("6. authenticated user creates a resume", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: {
      title: "Software Developer Resume",
      personalInfo: { fullName: "Ada Lovelace", email: "ada@example.com" },
      summary: "Analytical engine enthusiast.",
      experience: [{ jobTitle: "Mathematician", company: "Analytical Society", current: true }],
      education: [{ institution: "Home", degree: "Self-taught" }],
      skills: ["Mathematics", "Programming", " ", 42],
      template: "modern",
    },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  const resume = (res.body.data as Json).resume as Json;
  resumeAId = resume.id as string;
  assert.match(resumeAId, /^[a-f\d]{24}$/i);
  assert.equal(resume.ownerId, createdUserIds[0]);
  assert.equal(resume.template, "modern");
  assert.equal(resume.title, "Software Developer Resume");
  assert.deepEqual(resume.skills, ["Mathematics", "Programming"]); // trimmed / non-strings dropped
  assert.equal((resume.experience as Json[])[0].current, true);
  assert.equal(resume.password, undefined);
  assert.equal((resume as Json).__v, undefined);
});

dbTest("POST with a client-supplied ownerId → 400 (mass-assignment guard)", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { title: "x", ownerId: createdUserIds[1] },
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

dbTest("POST with an invalid template → 400", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { template: "fancy" },
  });
  assert.equal(res.status, 400);
});

dbTest("POST with skills not an array → 400", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { skills: "React,Node" },
  });
  assert.equal(res.status, 400);
});

dbTest("7. user lists only their own resumes", async () => {
  await call("POST", "/api/resumes", { token: tokenB, body: { title: "B resume" } }).then((r) => {
    resumeBId = ((r.body.data as Json).resume as Json).id as string;
  });

  const res = await call("GET", "/api/resumes", { token: tokenA });
  assert.equal(res.status, 200);
  const resumes = (res.body.data as Json).resumes as Json[];
  assert.ok(Array.isArray(resumes));
  assert.ok(resumes.every((r) => r.ownerId === createdUserIds[0]));
  assert.ok(resumes.some((r) => r.id === resumeAId));
  assert.ok(!resumes.some((r) => r.id === resumeBId));
});

dbTest("8. user retrieves their own resume by id", async () => {
  const res = await call("GET", `/api/resumes/${resumeAId}`, { token: tokenA });
  assert.equal(res.status, 200);
  assert.equal(((res.body.data as Json).resume as Json).id, resumeAId);
});

dbTest("GET with a malformed id → 400", async () => {
  const res = await call("GET", "/api/resumes/not-an-object-id", { token: tokenA });
  assert.equal(res.status, 400);
});

dbTest("9. user updates their own resume; updatedAt advances, owner fixed", async () => {
  const before = await call("GET", `/api/resumes/${resumeAId}`, { token: tokenA });
  const beforeResume = (before.body.data as Json).resume as Json;

  await new Promise((r) => setTimeout(r, 10));
  const res = await call("PUT", `/api/resumes/${resumeAId}`, {
    token: tokenA,
    body: { title: "Senior Developer Resume", summary: "Updated." },
  });
  assert.equal(res.status, 200);
  const updated = (res.body.data as Json).resume as Json;
  assert.equal(updated.title, "Senior Developer Resume");
  assert.equal(updated.summary, "Updated.");
  assert.equal(updated.ownerId, createdUserIds[0]);
  assert.equal(updated.createdAt, beforeResume.createdAt);
  assert.notEqual(updated.updatedAt, beforeResume.updatedAt);
});

dbTest("PUT attempting to change ownerId → 400; owner unchanged", async () => {
  const res = await call("PUT", `/api/resumes/${resumeAId}`, {
    token: tokenA,
    body: { ownerId: createdUserIds[1] },
  });
  assert.equal(res.status, 400);
  const check = await call("GET", `/api/resumes/${resumeAId}`, { token: tokenA });
  assert.equal(((check.body.data as Json).resume as Json).ownerId, createdUserIds[0]);
});

dbTest("ownership: A cannot READ B's resume → 404", async () => {
  const res = await call("GET", `/api/resumes/${resumeBId}`, { token: tokenA });
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

dbTest("ownership: A cannot UPDATE B's resume → 404; B's resume intact", async () => {
  const res = await call("PUT", `/api/resumes/${resumeBId}`, {
    token: tokenA,
    body: { title: "hacked" },
  });
  assert.equal(res.status, 404);
  const asB = await call("GET", `/api/resumes/${resumeBId}`, { token: tokenB });
  assert.equal(((asB.body.data as Json).resume as Json).title, "B resume");
});

dbTest("ownership: A cannot DELETE B's resume → 404; B's resume still exists", async () => {
  const res = await call("DELETE", `/api/resumes/${resumeBId}`, { token: tokenA });
  assert.equal(res.status, 404);
  const asB = await call("GET", `/api/resumes/${resumeBId}`, { token: tokenB });
  assert.equal(asB.status, 200);
});

dbTest("10. user deletes their own resume; then GET → 404", async () => {
  const res = await call("DELETE", `/api/resumes/${resumeAId}`, { token: tokenA });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(((res.body.data as Json).message ?? undefined) !== undefined, true);

  const gone = await call("GET", `/api/resumes/${resumeAId}`, { token: tokenA });
  assert.equal(gone.status, 404);
});

/* ---------------------------------------------------------------------- */
/*  M6 — expanded resume content + public allowlist                       */
/* ---------------------------------------------------------------------- */

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
let m6ResumeId = "";
let m6Slug = "";

dbTest("M6: create a resume with all expanded fields; round-trips", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: {
      title: "Expanded CV",
      template: "professional",
      personalInfo: {
        fullName: "M6 Tester",
        email: "m6@example.com",
        phone: "111",
        phone2: "222",
        dateOfBirth: "1990-01-02",
        gender: "Female",
        religion: "None",
        nationality: "Liberian",
        photo: TINY_PNG,
      },
      experience: [
        {
          jobTitle: "Engineer",
          company: "ACME",
          current: true,
          responsibilities: ["Built X", "Configured Y", " ", 5],
        },
      ],
      certifications: [{ name: "AWS SAA", institution: "Amazon", startDate: "2023" }],
      languages: [
        { language: "English", proficiency: "Fluent" },
        { language: "French", proficiency: "Basic" },
      ],
      references: [
        { name: "Jane Ref", position: "Manager", email: "jane@example.com", contact: "+231 555" },
      ],
    },
  });
  assert.equal(res.status, 201);
  const resume = (res.body.data as Json).resume as Json;
  m6ResumeId = resume.id as string;
  assert.equal(resume.template, "professional");
  const pi = resume.personalInfo as Json;
  assert.equal(pi.phone2, "222");
  assert.equal(pi.dateOfBirth, "1990-01-02");
  assert.equal(pi.gender, "Female");
  assert.equal(pi.photo, TINY_PNG);
  const exp = (resume.experience as Json[])[0];
  assert.deepEqual(exp.responsibilities, ["Built X", "Configured Y"]); // trimmed / non-strings dropped
  assert.equal((resume.certifications as Json[])[0].name, "AWS SAA");
  assert.equal((resume.languages as Json[]).length, 2);
  assert.equal((resume.references as Json[])[0].email, "jane@example.com");
});

dbTest("M6: invalid photo (not a data: URL) → 400", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { personalInfo: { photo: "http://evil.example/pic.png" } },
  });
  assert.equal(res.status, 400);
});

dbTest("M6: invalid language proficiency → 400", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { languages: [{ language: "English", proficiency: "Wizard" }] },
  });
  assert.equal(res.status, 400);
});

dbTest("M6: legacy-style resume (no new fields) still creates fine", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: {
      title: "Legacy",
      personalInfo: { fullName: "Old Data" },
      experience: [{ jobTitle: "Dev", description: "did things\nand more things" }],
    },
  });
  assert.equal(res.status, 201);
  const resume = (res.body.data as Json).resume as Json;
  const exp = (resume.experience as Json[])[0];
  assert.equal(exp.description, "did things\nand more things"); // preserved on the backend
  assert.deepEqual(exp.responsibilities, []); // not auto-migrated server-side
});

dbTest("M6: public resume response omits sensitive fields", async () => {
  const pub = await call("PUT", `/api/resumes/${m6ResumeId}/visibility`, {
    token: tokenA,
    body: { isPublic: true },
  });
  assert.equal(pub.status, 200);
  m6Slug = ((pub.body.data as Json).resume as Json).publicSlug as string;

  const res = await call("GET", `/api/public/resumes/${m6Slug}`);
  assert.equal(res.status, 200);
  const r = (res.body.data as Json).resume as Json;
  const pi = r.personalInfo as Json;

  // present (deliberately public)
  assert.equal(pi.phone2, "222");
  assert.equal(pi.photo, TINY_PNG);
  assert.ok(Array.isArray((r.experience as Json[])[0].responsibilities));
  assert.ok(Array.isArray(r.certifications));
  assert.ok(Array.isArray(r.languages));

  // deliberately withheld
  assert.equal("dateOfBirth" in pi, false);
  assert.equal("gender" in pi, false);
  assert.equal("religion" in pi, false);
  assert.equal("nationality" in pi, false);
  assert.equal("references" in r, false);
  // never public
  assert.equal("id" in r, false);
  assert.equal("ownerId" in r, false);
  assert.equal("isPublic" in r, false);
  assert.equal("publicSlug" in r, false);
});

/* ---------------------------------------------------------------------- */
/*  M7 — production hardening: framework errors, limits, isolation        */
/* ---------------------------------------------------------------------- */

dbTest("M7: malformed JSON body → 400, not 500, no stack trace", async () => {
  const res = await fetch(`${baseUrl()}/api/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: "{ not valid json",
  });
  const body = (await res.json()) as Json;
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.doesNotMatch(String(body.error), /\bat \/|\.ts:\d+|SyntaxError:/);
});

dbTest("M7: request body over the JSON size limit → 413, not 500", async () => {
  const res = await fetch(`${baseUrl()}/api/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ summary: "x".repeat(2_000_000) }),
  });
  const body = (await res.json()) as Json;
  assert.equal(res.status, 413);
  assert.equal(body.success, false);
});

dbTest("M7: oversized photo within the body limit → 400 with a friendly message", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: { personalInfo: { photo: `data:image/png;base64,${"A".repeat(500_000)}` } },
  });
  assert.equal(res.status, 400);
  assert.match(String(res.body.error), /too large|smaller image/i);
});

dbTest("M7: a JSON array as the request body → 400", async () => {
  const res = await fetch(`${baseUrl()}/api/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: "[]",
  });
  assert.equal(res.status, 400);
});

dbTest("M7: user B cannot change visibility of user A's resume → 404", async () => {
  const res = await call("PUT", `/api/resumes/${m6ResumeId}/visibility`, {
    token: tokenB,
    body: { isPublic: false },
  });
  assert.equal(res.status, 404);
});

dbTest("M7: skills de-duplicated; repeatable sections capped at 50", async () => {
  const res = await call("POST", "/api/resumes", {
    token: tokenA,
    body: {
      title: "M7 limits",
      skills: ["React", "React", "  React  ", "TypeScript"],
      experience: Array.from({ length: 120 }, (_, i) => ({ jobTitle: `Role ${i}` })),
    },
  });
  assert.equal(res.status, 201);
  const resume = (res.body.data as Json).resume as Json;
  assert.deepEqual(resume.skills, ["React", "TypeScript"]);
  assert.equal((resume.experience as Json[]).length, 50);
  await call("DELETE", `/api/resumes/${resume.id}`, { token: tokenA });
});
