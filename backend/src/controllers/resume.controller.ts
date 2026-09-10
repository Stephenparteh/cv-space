import type { Request, Response } from "express";
import { ApiError } from "../middleware/errorHandler.js";
import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUniqueSlug } from "../utils/slug.js";
import {
  assertValidObjectId,
  parseResumeInput,
  parseVisibilityInput,
} from "../utils/validators.js";

const NOT_FOUND_MESSAGE = "Resume not found";

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;

const mintResumeSlug = (title: string): Promise<string> =>
  generateUniqueSlug(title || "resume", "resume", async (candidate) =>
    Boolean(await Resume.exists({ publicSlug: candidate })),
  );

/**
 * GET /api/resumes
 * All resumes owned by the authenticated user, newest-edited first.
 */
export const listResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await Resume.find({ ownerId: req.userId }).sort({ updatedAt: -1 });
  res.status(200).json({ success: true, data: { resumes } });
});

/**
 * POST /api/resumes
 * Ownership is taken from the authenticated user, never the request body.
 */
export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const input = parseResumeInput(req.body, { partial: false });
  const resume = await Resume.create({ ...input, ownerId: req.userId });
  res.status(201).json({ success: true, data: { resume } });
});

/**
 * GET /api/resumes/:id
 * 404 (not 403) when the resume belongs to someone else, so existence of
 * another user's resume is not revealed.
 */
export const getResume = asyncHandler(async (req: Request, res: Response) => {
  assertValidObjectId(req.params.id);
  const resume = await Resume.findOne({ _id: req.params.id, ownerId: req.userId });
  if (!resume) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }
  res.status(200).json({ success: true, data: { resume } });
});

/**
 * PUT /api/resumes/:id
 * Ownership is part of the query filter, so a non-owner can never match.
 * `parseResumeInput` whitelists fields — `ownerId` / `createdAt` cannot be
 * changed. `timestamps` bumps `updatedAt` automatically.
 */
export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  assertValidObjectId(req.params.id);
  const updates = parseResumeInput(req.body, { partial: true });
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.userId },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!resume) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }
  res.status(200).json({ success: true, data: { resume } });
});

/**
 * PUT /api/resumes/:id/visibility  { isPublic: boolean }
 *
 * Owner-scoped. On the first publish a `publicSlug` is minted; it is reused on
 * later private↔public toggles. The client can never set or change the slug.
 */
export const setResumeVisibility = asyncHandler(async (req: Request, res: Response) => {
  assertValidObjectId(req.params.id);
  const { isPublic } = parseVisibilityInput(req.body);

  const filter = { _id: req.params.id, ownerId: req.userId };
  const current = await Resume.findOne(filter).select("publicSlug title");
  if (!current) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }

  const update: Record<string, unknown> = { isPublic };
  if (isPublic && !current.publicSlug) {
    update.publicSlug = await mintResumeSlug(current.title);
  }

  let resume;
  try {
    resume = await Resume.findOneAndUpdate(filter, { $set: update }, { new: true });
  } catch (error) {
    if (isDuplicateKeyError(error) && typeof update.publicSlug === "string") {
      update.publicSlug = await mintResumeSlug(current.title);
      resume = await Resume.findOneAndUpdate(filter, { $set: update }, { new: true });
    } else {
      throw error;
    }
  }
  if (!resume) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }

  res.status(200).json({ success: true, data: { resume } });
});

/**
 * DELETE /api/resumes/:id
 */
export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  assertValidObjectId(req.params.id);
  const deleted = await Resume.findOneAndDelete({
    _id: req.params.id,
    ownerId: req.userId,
  });
  if (!deleted) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }
  res.status(200).json({
    success: true,
    data: { message: "Resume deleted successfully" },
  });
});
