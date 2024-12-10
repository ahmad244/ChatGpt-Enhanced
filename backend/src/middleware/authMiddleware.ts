import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to authenticate the user based on the access token
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { accessToken } = req.cookies; // Get access token from cookies

  // Check if the access token exists
  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is missing. Please log in.' });
  }

  try {
    // Verify the access token
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET!);

    // Attach user payload to the request
    (req as any).user = payload;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Access token has expired. Please refresh your session.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Invalid access token.' });
    } else {
      return res.status(500).json({ message: 'Internal server error during token validation.' });
    }
  }
};

// Middleware to check if the user has the required role
export const roleMiddleware = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Ensure the user payload exists
    if (!user) {
      return res.status(403).json({ message: 'No user information found.' });
    }

    // Check if the user's role matches the required role
    if (user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
