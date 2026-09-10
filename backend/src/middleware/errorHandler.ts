import type { NextFunction, Request, Response } from "express";
import { isProduction } from "../config/env.js";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Reads a 4xx status off a non-ApiError thrown by Express or its middleware
 * (body-parser JSON `SyntaxError` → 400, `PayloadTooLargeError` → 413, etc.).
 * Anything outside 400–499 is treated as a server fault.
 */
const clientErrorStatus = (err: unknown): number | null => {
  if (typeof err !== "object" || err === null) return null;
  const raw = (err as { status?: unknown; statusCode?: unknown });
  const code = typeof raw.status === "number" ? raw.status : raw.statusCode;
  return typeof code === "number" && code >= 400 && code < 500 ? code : null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number;
  let message: string;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    const clientStatus = clientErrorStatus(err);
    if (clientStatus) {
      // Malformed / oversized request body and similar client mistakes.
      statusCode = clientStatus;
      message =
        clientStatus === 413
          ? "Request body is too large"
          : "Invalid request body";
    } else {
      statusCode = 500;
      message = "Internal server error";
    }
  }

  if (statusCode >= 500) {
    console.error("[error]", err);
    // Never leak internal error details / stack traces (any environment).
    message = "Internal server error";
  } else if (!isProduction && err instanceof Error && !(err instanceof ApiError)) {
    // In development, keep the underlying reason visible for 4xx framework errors.
    message = `${message} (${err.message})`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
