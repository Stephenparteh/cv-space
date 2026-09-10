import type { Request, Response } from "express";
import { ApiError } from "../middleware/errorHandler.js";
import { Profile } from "../models/Profile.js";
import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  toDirectoryEntry,
  toPublicProfile,
  toPublicResume,
} from "../utils/publicShapes.js";

// Generic "not found" — a private resource is indistinguishable from a missing one.
const NOT_FOUND = "Not found";
const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const DIRECTORY_LIMIT = 60;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * GET /api/public/resumes/:slug — no auth. Public resumes only.
 */
export const getPublicResume = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug ?? "");
  if (!SLUG_RE.test(slug)) {
    throw new ApiError(404, NOT_FOUND);
  }
  const resume = await Resume.findOne({ publicSlug: slug, isPublic: true });
  if (!resume) {
    throw new ApiError(404, NOT_FOUND);
  }
  res.status(200).json({ success: true, data: { resume: toPublicResume(resume) } });
});

/**
 * GET /api/public/profiles/:slug — no auth. Public profiles only.
 * The featured resume is embedded only if it is itself still public.
 */
export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug ?? "");
  if (!SLUG_RE.test(slug)) {
    throw new ApiError(404, NOT_FOUND);
  }
  const profile = await Profile.findOne({ slug, isPublic: true });
  if (!profile) {
    throw new ApiError(404, NOT_FOUND);
  }

  let featured = null;
  if (profile.featuredResumeId) {
    featured = await Resume.findOne({ _id: profile.featuredResumeId, isPublic: true });
  }

  res.status(200).json({
    success: true,
    data: { profile: toPublicProfile(profile, featured) },
  });
});

/**
 * GET /api/public/directory?q=&skill= — no auth.
 * Only profiles that opted in (`isPublic && inDirectory`). MongoDB regex filter.
 */
export const getDirectory = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim().slice(0, 80);
  const skill = String(req.query.skill ?? "").trim().slice(0, 60);

  const filter: Record<string, unknown> = { isPublic: true, inDirectory: true };
  if (q) {
    filter.headline = { $regex: escapeRegExp(q), $options: "i" };
  }
  if (skill) {
    filter.skills = { $elemMatch: { $regex: escapeRegExp(skill), $options: "i" } };
  }

  const profiles = await Profile.find(filter).sort({ updatedAt: -1 }).limit(DIRECTORY_LIMIT);

  const featuredIds = profiles
    .map((p) => p.featuredResumeId)
    .filter((value): value is NonNullable<typeof value> => value != null);

  const publicResumes = featuredIds.length
    ? await Resume.find({ _id: { $in: featuredIds }, isPublic: true }).select("publicSlug")
    : [];
  const slugByResumeId = new Map(
    publicResumes.map((r) => [String(r._id), r.publicSlug ?? null]),
  );

  const entries = profiles.map((p) =>
    toDirectoryEntry(
      p,
      p.featuredResumeId ? slugByResumeId.get(String(p.featuredResumeId)) ?? null : null,
    ),
  );

  res.status(200).json({ success: true, data: { profiles: entries } });
});
