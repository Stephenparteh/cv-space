import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

/**
 * Admin authorization guard. Must run AFTER `requireAuth` (needs `req.userId`).
 *
 * Re-reads the user's role from the database on every request rather than
 * trusting anything from the JWT payload or the client — the JWT only ever
 * carries the user id (see utils/jwt.ts), so a revoked admin role takes
 * effect on the very next request, not just after the token expires.
 */
export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) {
      throw new ApiError(401, "Authentication required");
    }
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }
    next();
  },
);
