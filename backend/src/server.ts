import dotenv from "dotenv";
dotenv.config(); // Load environment variables early

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import modelRoutes from "./routes/modelRoutes";
import userRoutes from "./routes/userRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { apiLimiter } from "./middleware/rateLimiter";
import cookieParser from "cookie-parser";

(async () => {
  await connectDB();
  const app = express();

  // CORS Configuration
  app.use(
    cors({
      origin: "http://localhost:5173", // Ensure this matches your frontend's URL
      credentials: true, // Allow cookies and credentials to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Remove empty string and include 'OPTIONS'
      allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Request"], // Add any custom headers if used
    })
  );

  // Middleware
  app.use(express.json());
  app.use(apiLimiter);
  app.use(cookieParser());

  // Routes
  app.use("/auth", authRoutes);
  app.use("/models", modelRoutes);
  app.use("/users", userRoutes);
  app.use("/conversations", conversationRoutes);
  app.use("/messages", messageRoutes);
  app.use("/analytics", analyticsRoutes);

  // Start the server
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
})();
