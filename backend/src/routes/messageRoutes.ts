import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import OpenAI from "openai";

const router = Router();
router.use(authMiddleware);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the API key is set in your environment variables
});

if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is missing. Check your environment variables.");
  process.exit(1);
}

// Get all conversations for a user
router.get("/", async (req, res) => {
  const userId = (req as any).user.userId;
  try {
    const conversations = await Conversation.find({ userId });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get messages for a specific conversation
router.get("/:id/messages", async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await Message.find({ conversationId: id }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new conversation or append a message to an existing one
router.post("/", async (req, res) => {
  const userId = (req as any).user.userId;
  const { message, conversationId, model } = req.body;

  try {
    let conversation;

    if (conversationId) {
      // Check if the conversation exists
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
      });
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }
    } else {
      // Create a new conversation without messages
      conversation = await Conversation.create({ userId });
      return res
        .status(201)
        .json({ conversationId: conversation._id, messages: [] });
    }

    // If no message is provided, do not proceed further
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message content is required." });
    }

    // Save the user's message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    if (!userMessage) {
      console.error("Failed to create user message");
      return res.status(500).json({ message: "Failed to create user message" });
    }

    // Fetch the last 15 messages for context
    const previousMessages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ timestamp: -1 }) // Sort by most recent
      .limit(15)
      .lean(); // Get plain objects for better performance

    // Prepare the messages array for OpenAI
    const openAIMessages = previousMessages
      .reverse() // Ensure the oldest messages come first
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Add the user's current message to the context
    openAIMessages.push({ role: "user", content: message });

    console.log("OpenAI Messages:", openAIMessages);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini", // Default to gpt-4o-mini
      messages: openAIMessages,
    });

    const assistantMessageContent =
      completion.choices[0].message?.content || "No response received";

    // Save the assistant's message
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: assistantMessageContent,
    });

    if (!assistantMessage) {
      console.error("Failed to create assistant message");
      return res
        .status(500)
        .json({ message: "Failed to create assistant message" });
    }

    res.status(201).json({ userMessage, assistantMessage });
  } catch (error) {
    console.error("Error creating/updating conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
