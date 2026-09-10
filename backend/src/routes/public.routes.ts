import { Router } from "express";
import {
  getDirectory,
  getPublicProfile,
  getPublicResume,
} from "../controllers/public.controller.js";

// No authentication — these are read-only, allowlisted public endpoints.
const router = Router();

router.get("/directory", getDirectory);
router.get("/resumes/:slug", getPublicResume);
router.get("/profiles/:slug", getPublicProfile);

export default router;
