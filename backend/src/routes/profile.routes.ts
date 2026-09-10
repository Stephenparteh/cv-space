import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// The authenticated user's own profile only.
router.use(requireAuth);

router.get("/", getMyProfile);
router.put("/", updateMyProfile);

export default router;
