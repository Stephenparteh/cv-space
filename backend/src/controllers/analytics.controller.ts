import type { Request, Response } from "express";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseAnalyticsEventInput } from "../utils/validators.js";

/**
 * POST /api/analytics/events — no auth required (guests fire these too).
 * `optionalAuth` attaches `req.userId` when a valid token is present; the
 * event is otherwise fully anonymous. Always responds quickly and simply —
 * analytics must never become a source of user-facing errors.
 */
export const recordEvent = asyncHandler(async (req: Request, res: Response) => {
  const { type, template } = parseAnalyticsEventInput(req.body);
  await AnalyticsEvent.create({
    type,
    template,
    userId: req.userId ?? null,
  });
  res.status(201).json({ success: true, data: null });
});
