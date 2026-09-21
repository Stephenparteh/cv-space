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

/**
 * Attaches `req.userId` when a valid Bearer token is present, but never
 * rejects the request when it's missing, malformed, or expired — the caller
 * is simply treated as anonymous. For public-but-optionally-attributed
 * endpoints (currently: analytics events) where authentication is a bonus,
 * not a requirement.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (header?.startsWith(BEARER_PREFIX)) {
    const token = header.slice(BEARER_PREFIX.length).trim();
    if (token) {
      try {
        req.userId = verifyAuthToken(token).sub;
      } catch {
        // Invalid/expired token on an optional-auth route — proceed anonymously.
      }
    }
  }
  next();
};
