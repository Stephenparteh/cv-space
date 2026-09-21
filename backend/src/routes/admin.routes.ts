import { Router } from "express";
import { getActivity, getStats } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

// Authenticated AND admin-only. Enforced server-side — never trust a
// frontend flag. A missing/invalid token -> 401; a non-admin user -> 403.
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);
router.get("/activity", getActivity);

export default router;
