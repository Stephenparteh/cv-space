import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler.js";
import { verifyAuthToken } from "../utils/jwt.js";

const BEARER_PREFIX = "Bearer ";

/**
 * Reusable authentication guard for protected routes.
 *
 * - Extracts the Bearer token from the Authorization header.
 * - Verifies it against JWT_SECRET.
 * - Attaches the authenticated user's id to `req.userId`.
 * - Rejects missing / malformed / expired / invalid tokens with 401.
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw new ApiError(401, "Authentication required");
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    const expired =
      error instanceof Error && error.name === "TokenExpiredError";
    throw new ApiError(401, expired ? "Token expired" : "Invalid token");
  }
};
