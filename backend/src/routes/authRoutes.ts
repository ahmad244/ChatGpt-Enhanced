import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import jwt from 'jsonwebtoken';

const router = Router();

// Registration endpoint
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const user = new User({ email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    // Set tokens in cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is missing. Please log in.' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    const newAccessToken = generateAccessToken({ userId: (payload as any).userId, role: (payload as any).role });

    const newRefreshToken = generateRefreshToken({ userId: (payload as any).userId, role: (payload as any).role });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
});



// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken'); // Clear access token
  res.clearCookie('refreshToken'); // Clear refresh token
  res.status(200).json({ message: 'Logged out successfully.' });
});


export default router;
