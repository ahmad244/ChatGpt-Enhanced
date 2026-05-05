import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { ModelDB } from "../models/Model";
import openai from "../config/openaiConfig";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Admin routes

/**
 * @route   GET /models/openai
 * @desc    Fetch all available models from OpenAI API
 * @access  Admin
 */
router.get("/openai", roleMiddleware(["Admin"]), async (req: Request, res: Response) => {
  try {
    const response = await openai.models.list();
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    res.status(500).json({ message: "Failed to fetch models from OpenAI" });
  }
});

/**
 * @route   POST /models
 * @desc    Create a new model
 * @access  Admin
 */
router.post("/", roleMiddleware(["Admin"]), async (req: Request, res: Response) => {
  const { name, value, description, endpoint, enabled, order } = req.body;

  // Validate required fields
  if (!name || !value || !endpoint) {
    res.status(400).json({ message: "Name, value, and endpoint are required." });
    return;
  }

  try {
    // Check for duplicate 'value'
    const existingModel = await ModelDB.findOne({ value });
    if (existingModel) {
      res.status(400).json({ message: "Model with this value already exists." });
      return;
    }

    const model = await ModelDB.create({
      name,
      value,
      description,
      endpoint,
      enabled,
      order,
    });
    res.status(201).json(model);
  } catch (error) {
    console.error("Error creating model:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /models
 * @desc    Retrieve all models
 * @access  Authenticated users
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const models = await ModelDB.find().sort({ order: 1 }).select("-__v"); // Exclude __v if not needed
    res.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   PUT /models/:id
 * @desc    Update an existing model
 * @access  Admin
 */
router.put("/:id", roleMiddleware(["Admin"]), async (req: Request, res: Response) => {
  const { name, value, description, endpoint, enabled, order } = req.body;

  try {
    // If 'value' is being updated, ensure it's unique
    if (value) {
      const existingModel = await ModelDB.findOne({
        value,
        _id: { $ne: req.params.id },
      });
      if (existingModel) {
        res.status(400).json({ message: "Another model with this value already exists." });
        return;
      }
    }

    const model = await ModelDB.findByIdAndUpdate(
      req.params.id,
      { name, value, description, endpoint, enabled, order },
      { new: true, runValidators: true }
    );

    if (!model) {
      res.status(404).json({ message: "Model not found." });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error("Error updating model:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   DELETE /models/:id
 * @desc    Delete a model
 * @access  Admin
 */
router.delete("/:id", roleMiddleware(["Admin"]), async (req: Request, res: Response) => {
  try {
    const model = await ModelDB.findByIdAndDelete(req.params.id);
    if (!model) {
      res.status(404).json({ message: "Model not found." });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting model:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;