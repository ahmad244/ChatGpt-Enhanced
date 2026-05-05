import { Router, Request, Response } from "express";
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { User } from '../models/User';

const router = Router();
router.use(authMiddleware);

// Current user info
router.get('/me', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await User.findById(userId);
  res.json({ email: user?.email, role: user?.role });
});

// Admin routes for user management
router.get('/all', roleMiddleware(['Admin']), async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user role (admin only)
router.put('/:id/role', roleMiddleware(['Admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['Admin', 'User', 'Moderator'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Must be Admin, User, or Moderator' });
      return;
    }
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully', user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;