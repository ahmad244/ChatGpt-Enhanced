import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if user role is in the allowed roles
    if (req.user.role && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
  };
};
