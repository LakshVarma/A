import express, { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  registerWebhookHandler,
  deleteWebhookHandler,
  getWebhooksHandler,
  handleTriggerHandler,
  getActionsHandler,
  getActionHandler,
  executeActionHandler,
} from './zapierController';

const router = express.Router();

// Apply authentication middleware to most routes
// (except webhook triggers which need to be accessible by Zapier)

// Register a webhook
router.post('/hooks', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  registerWebhookHandler(req as AuthenticatedRequest, res).catch(next);
});

// Delete a webhook
router.delete('/hooks/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  deleteWebhookHandler(req as AuthenticatedRequest, res).catch(next);
});

// Get webhooks for a workflow
router.get('/hooks/workflow/:workflowId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  getWebhooksHandler(req as AuthenticatedRequest, res).catch(next);
});

// Handle a webhook trigger (no auth required as this is called by Zapier)
router.post('/trigger/:triggerId', (req: Request, res: Response, next: NextFunction) => {
  handleTriggerHandler(req as AuthenticatedRequest, res).catch(next);
});

// Get all Zapier actions
router.get('/actions', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  getActionsHandler(req as AuthenticatedRequest, res).catch(next);
});

// Get a specific Zapier action
router.get('/actions/:actionId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  getActionHandler(req as AuthenticatedRequest, res).catch(next);
});

// Execute a Zapier action
router.post('/actions/:actionId/execute', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  executeActionHandler(req as AuthenticatedRequest, res).catch(next);
});

export default router;
