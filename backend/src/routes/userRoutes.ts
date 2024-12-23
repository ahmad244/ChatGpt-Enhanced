import { Router, Request, Response } from "express";
import { authMiddleware } from '../middleware/authMiddleware';
import { User } from '../models/User';

const router = Router();
router.use(authMiddleware);

router.get('/me', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await User.findById(userId);
  res.json({ email: user?.email, role: user?.role });
});

export default router;
