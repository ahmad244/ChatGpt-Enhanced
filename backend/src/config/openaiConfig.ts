import OpenAI from "openai";

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is missing. Check your environment variables.");
}

// Create and export OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
