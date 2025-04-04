import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import modelRoutes from "./routes/modelRoutes";
import userRoutes from "./routes/userRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { apiLimiter } from "./middleware/rateLimiter";
import cookieParser from "cookie-parser";

(async () => {
  await connectDB();
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONT_END_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Request"],
    })
  );

  app.use(express.json());
  app.use(apiLimiter);
  app.use(cookieParser());

  app.use("/auth", authRoutes);
  app.use("/models", modelRoutes);
  app.use("/users", userRoutes);
  app.use("/conversations", conversationRoutes);
  app.use("/analytics", analyticsRoutes);

  app.get("/", (req: Request, res: Response) => {
    res.send("API is running....");
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
})();
