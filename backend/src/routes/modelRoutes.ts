import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { ModelDB } from "../models/Model";

const router = Router();

router.use(authMiddleware);

/**
 * @route   POST /models
 * @desc    Create a new model
 * @access  Admin
 */
router.post("/", roleMiddleware(["Admin"]), async (req: Request, res: Response) => {
  const { name, value, description, endpoint, enabled } = req.body;

  if (!name || !value || !endpoint) {
    return res
      .status(400)
      .json({ message: "Name, value, and endpoint are required." });
  }

  try {
    const existingModel = await ModelDB.findOne({ value });
    if (existingModel) {
      return res
        .status(400)
        .json({ message: "Model with this value already exists." });
    }

    const model = await ModelDB.create({
      name,
      value,
      description,
      endpoint,
      enabled,
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
    const models = await ModelDB.find().sort({ order: 1 }).select("-__v");
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
  const { name, value, description, endpoint, enabled } = req.body;

  try {
    if (value) {
      const existingModel = await ModelDB.findOne({
        value,
        _id: { $ne: req.params.id },
      });
      if (existingModel) {
        return res
          .status(400)
          .json({ message: "Another model with this value already exists." });
      }
    }

    const model = await ModelDB.findByIdAndUpdate(
      req.params.id,
      { name, value, description, endpoint, enabled },
      { new: true, runValidators: true }
    );

    if (!model) {
      return res.status(404).json({ message: "Model not found." });
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
      return res.status(404).json({ message: "Model not found." });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting model:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
