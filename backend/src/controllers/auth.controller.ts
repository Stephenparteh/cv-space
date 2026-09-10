import type { Request, Response } from "express";
import { ApiError } from "../middleware/errorHandler.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAuthToken } from "../utils/jwt.js";
import { validateLoginInput, validateRegisterInput } from "../utils/validators.js";

const DUPLICATE_EMAIL_MESSAGE = "An account with this email already exists";
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = validateRegisterInput(req.body);

  const existing = await User.exists({ email });
  if (existing) {
    throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
  }

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (error) {
    // Unique-index race: another request created the same email first.
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
    }
    throw error;
  }

  const token = signAuthToken(user.id);
  res.status(201).json({
    success: true,
    data: { user: user.toJSON(), token },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = validateLoginInput(req.body);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const token = signAuthToken(user.id);
  res.status(200).json({
    success: true,
    data: { user: user.toJSON(), token },
  });
});

/**
 * GET /api/auth/me — protected by requireAuth.
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: { user: user.toJSON() },
  });
});

/**
 * POST /api/auth/logout
 *
 * Authentication is stateless JWT, so there is nothing to invalidate
 * server-side. The client must discard its stored token. This endpoint
 * exists only for API symmetry.
 */
export const logout = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message:
        "Logged out. This app uses stateless JWTs — remove the stored token on the client.",
    },
  });
};
