/**
 * Adds the authenticated user's id to Express requests.
 * Populated by the requireAuth middleware.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
