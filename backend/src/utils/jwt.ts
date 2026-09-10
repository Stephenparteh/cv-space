import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload {
  /** Subject — the authenticated user's id. */
  sub: string;
}

/**
 * Signs a minimal JWT containing only the user id.
 */
export const signAuthToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId }, env.jwtSecret, options);
};

/**
 * Verifies a JWT and returns its payload.
 * Throws (TokenExpiredError / JsonWebTokenError / Error) on any invalid token.
 */
export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Invalid token payload");
  }
  return { sub: String(decoded.sub) };
};
