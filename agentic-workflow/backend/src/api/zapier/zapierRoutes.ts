import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
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
router.post('/hooks', requireAuth, registerWebhookHandler);

// Delete a webhook
router.delete('/hooks/:id', requireAuth, deleteWebhookHandler);

// Get webhooks for a workflow
router.get('/hooks/workflow/:workflowId', requireAuth, getWebhooksHandler);

// Handle a webhook trigger (no auth required as this is called by Zapier)
router.post('/trigger/:triggerId', handleTriggerHandler);

// Get all Zapier actions
router.get('/actions', requireAuth, getActionsHandler);

// Get a specific Zapier action
router.get('/actions/:actionId', requireAuth, getActionHandler);

// Execute a Zapier action
router.post('/actions/:actionId/execute', requireAuth, executeActionHandler);

export default router;
