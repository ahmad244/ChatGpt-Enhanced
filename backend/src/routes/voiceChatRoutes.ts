import express from "express";

import { authMiddleware as protect } from "../middleware/authMiddleware";

import { processVoiceChat } from "../controllers/voiceChatController.js";

const router = express.Router();

// Process voice chat

router.post("/chat", protect, processVoiceChat);

export default router;
