import { Router } from "express";
import { recordEvent } from "../controllers/analytics.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Public — guests fire these too. optionalAuth attaches req.userId only when
// a valid token is present; never required.
router.post("/events", optionalAuth, recordEvent);

export default router;
