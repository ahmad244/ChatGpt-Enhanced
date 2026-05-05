import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { User } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_ACCESS_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const JWT_REFRESH_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Registration endpoint
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: "User already exists." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Login endpoint
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
      role: user.role,
    });

    // Set tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjusted for development
      maxAge: JWT_ACCESS_TIMEOUT, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjusted for development
      maxAge: JWT_REFRESH_TIMEOUT, // 7 days
    });

    res.status(200).json({ message: "Login successful." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is missing. Please log in." });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    const newAccessToken = generateAccessToken({
      userId: (payload as any).userId,
      role: (payload as any).role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: (payload as any).userId,
      role: (payload as any).role,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjusted for development
      maxAge: JWT_ACCESS_TIMEOUT, // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjusted for development
      maxAge: JWT_REFRESH_TIMEOUT, // 7 days
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
});

// Logout endpoint
router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  }); // Clear access token
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  }); // Clear refresh token
  res.status(200).json({ message: "Logged out successfully." });
});

export default router;