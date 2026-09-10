import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler.js";
import { Profile } from "../models/Profile.js";
import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUniqueSlug } from "../utils/slug.js";
import { parseProfileInput } from "../utils/validators.js";

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;

/**
 * GET /api/profile — the authenticated user's own profile (or null).
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Profile.findOne({ userId: req.userId });
  res.status(200).json({
    success: true,
    data: { profile: profile ? profile.toJSON() : null },
  });
});

/**
 * PUT /api/profile — create or update the authenticated user's profile.
 * The `slug` is server-owned; it is minted on the first publish and reused.
 */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = parseProfileInput(req.body);

  if (input.featuredResumeId) {
    const owned = await Resume.exists({ _id: input.featuredResumeId, ownerId: req.userId });
    if (!owned) {
      throw new ApiError(400, "featuredResumeId must be one of your own resumes");
    }
  }

  const profile =
    (await Profile.findOne({ userId: req.userId })) ??
    new Profile({ userId: req.userId });

  if (input.displayName !== undefined) profile.displayName = input.displayName;
  if (input.headline !== undefined) profile.headline = input.headline;
  if (input.bio !== undefined) profile.bio = input.bio;
  if (input.location !== undefined) profile.location = input.location;
  if (input.skills !== undefined) profile.skills = input.skills;
  if (input.isPublic !== undefined) profile.isPublic = input.isPublic;
  if (input.inDirectory !== undefined) profile.inDirectory = input.inDirectory;
  if (input.featuredResumeId !== undefined) {
    profile.featuredResumeId = input.featuredResumeId
      ? new Types.ObjectId(input.featuredResumeId)
      : null;
  }

  // The directory requires a public profile — going private always removes it.
  if (!profile.isPublic) {
    profile.inDirectory = false;
  }

  if (profile.isPublic && !profile.slug) {
    profile.slug = await generateUniqueSlug(
      profile.displayName || "profile",
      "profile",
      async (candidate) => Boolean(await Profile.exists({ slug: candidate })),
    );
  }

  try {
    await profile.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, "Profile could not be saved due to a naming conflict — please retry");
    }
    throw error;
  }

  res.status(200).json({ success: true, data: { profile: profile.toJSON() } });
});
