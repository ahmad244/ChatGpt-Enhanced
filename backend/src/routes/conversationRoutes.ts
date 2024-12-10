import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

const router = Router();
router.use(authMiddleware);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

/**
 * POST /conversations
 * Create a new conversation.
 */
router.post('/', async (req, res) => {
  const userId = (req as any).user.userId;

  try {
    console.log("Creating new conversation for user:", userId);
    const conversation = await Conversation.create({ userId });
    console.log("New conversation created with ID:", conversation._id);
    res.status(201).json({ conversationId: conversation._id, title: conversation.title, messages: [] });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post('/:id/messages', async (req, res) => {
  const userId = (req as any).user.userId;
  const { message, model } = req.body;
  const conversationId = req.params.id;

  console.log("Received request to add message to conversation:", { userId, message, model, conversationId });

  try {
    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      console.log("Conversation not found.");
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (!message || message.trim() === "") {
      console.log("Message content is required.");
      return res.status(400).json({ message: "Message content is required." });
    }

    console.log("Creating user message for conversation ID:", conversation._id);
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    if (!userMessage) {
      console.log("Failed to create user message.");
      return res.status(500).json({ message: "Failed to create user message" });
    }

    console.log("Fetching previous messages for conversation ID:", conversation._id);
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: -1 })
      .limit(15)
      .lean();

    const openAIMessages: ChatCompletionMessageParam[] = previousMessages.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    openAIMessages.push({ role: "user", content: message });

    const tempModel = model || "gpt-3.5-turbo";
    console.log("Sending messages to OpenAI for completion with model:", tempModel);

    const completion = await openai.chat.completions.create({
      model: tempModel,
      messages: openAIMessages,
    });

    const assistantMessageContent =
      completion.choices[0].message?.content || "No response received";

    console.log("Creating assistant message for conversation ID:", conversation._id);
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: assistantMessageContent,
      modelType: tempModel,
    });

    if (!assistantMessage) {
      console.log("Failed to create assistant message.");
      return res.status(500).json({ message: "Failed to create assistant message" });
    }

    // If it's the first user and assistant messages, generate a title
    const allMessages = await Message.find({ conversationId: conversation._id }).sort({ timestamp: 1 });

    if (allMessages.length === 2) {
      console.log("Generating title for new conversation.");
      const titlePrompt: ChatCompletionMessageParam[] = [
        { role: "system", content: "Generate a title for this conversation." },
        { role: "user", content: allMessages[0].content },
        { role: "assistant", content: allMessages[1].content },
      ];

      const titleCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: titlePrompt,
      });

      const generatedTitle = titleCompletion?.choices[0]?.message?.content?.trim() || "Conversation Title";
      conversation.title = generatedTitle;
      await conversation.save();
      console.log("Generated title for conversation:", generatedTitle);
    }

    console.log("Conversation updated successfully.");
    res.status(201).json({ userMessage, assistantMessage });
  } catch (error) {
    console.error("Error adding message to conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;

  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    await Message.deleteMany({ conversationId: id });
    res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
