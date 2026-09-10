import { Router } from "express";
import {
  createResume,
  deleteResume,
  getResume,
  listResumes,
  setResumeVisibility,
  updateResume,
} from "../controllers/resume.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Every resume route is protected and user-scoped.
router.use(requireAuth);

router.get("/", listResumes);
router.post("/", createResume);
router.get("/:id", getResume);
router.put("/:id/visibility", setResumeVisibility);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

export default router;
