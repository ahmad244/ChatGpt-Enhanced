import express from "express";

import { authMiddleware as protect } from "../middleware/authMiddleware";

import {
  // ...existing imports...

  searchModels,
} from "../controllers/openaiController.js";

const router = express.Router();

// ...existing routes...

// Route to search for models

router.get("/models", protect, searchModels);

export default router;
