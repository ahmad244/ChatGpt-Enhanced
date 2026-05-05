import asyncHandler from 'express-async-handler';
import openai from '../config/openaiConfig.js';

// ...existing code...

/**
 * @desc    Search for available OpenAI models
 * @route   GET /api/openai/models
 * @access  Private
 */
const searchModels = asyncHandler(async (req, res) => {
  try {
    const response = await openai.models.list();
    
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      error: error.response ? error.response.data : "Failed to fetch models",
    });
  }
});

// ...existing code...

export {
  // ...existing exports...
  searchModels,
};
