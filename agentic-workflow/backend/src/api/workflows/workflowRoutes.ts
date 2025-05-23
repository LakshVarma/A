import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from './workflowController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all workflows
router.get('/', getWorkflows);

// Get a specific workflow
router.get('/:id', getWorkflowById);

// Create a new workflow
router.post('/', createWorkflow);

// Update a workflow
router.put('/:id', updateWorkflow);

// Delete a workflow
router.delete('/:id', deleteWorkflow);

export default router;
