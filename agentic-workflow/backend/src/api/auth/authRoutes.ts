import express, { Request, Response, NextFunction } from 'express';
import { handleClerkWebhook } from './clerkWebhookHandler';
import { requireAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = express.Router();

// Clerk webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response, next: NextFunction) => {
  handleClerkWebhook(req, res).catch(next);
});

// Get current user
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  res.status(200).json({
    id: authReq.auth.userId,
    sessionId: authReq.auth.sessionId,
  });
});

export default router;
