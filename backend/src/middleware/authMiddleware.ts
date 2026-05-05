import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: any; // Define a more specific type based on your user structure
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get token from header first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If not in header, check cookies
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
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